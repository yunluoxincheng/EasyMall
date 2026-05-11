package org.ruikun.modules.order.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.enums.OrderStatus;
import org.ruikun.infrastructure.mq.DomainEvent;
import org.ruikun.infrastructure.mq.DomainEventPublisher;
import org.ruikun.modules.coupon.service.ICouponService;
import org.ruikun.modules.inventory.service.IInventoryService;
import org.ruikun.modules.order.dto.OrderCreateDTO;
import org.ruikun.modules.order.entity.Cart;
import org.ruikun.modules.order.entity.Order;
import org.ruikun.modules.order.entity.OrderItem;
import org.ruikun.modules.order.mapper.CartMapper;
import org.ruikun.modules.order.mapper.OrderItemMapper;
import org.ruikun.modules.order.mapper.OrderMapper;
import org.ruikun.modules.payment.entity.PaymentOrder;
import org.ruikun.modules.payment.service.IPaymentService;
import org.ruikun.modules.product.mapper.ProductMapper;
import org.ruikun.modules.user.service.IPriceService;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @BeforeAll
    static void initMybatisPlusLambdaCache() {
        Configuration configuration = new Configuration();

        MapperBuilderAssistant assistant1 = new MapperBuilderAssistant(configuration, "");
        assistant1.setCurrentNamespace("org.ruikun.modules.order.mapper.CartMapper");
        TableInfoHelper.initTableInfo(assistant1, Cart.class);

        MapperBuilderAssistant assistant2 = new MapperBuilderAssistant(configuration, "");
        assistant2.setCurrentNamespace("org.ruikun.modules.order.mapper.OrderMapper");
        TableInfoHelper.initTableInfo(assistant2, Order.class);

        MapperBuilderAssistant assistant3 = new MapperBuilderAssistant(configuration, "");
        assistant3.setCurrentNamespace("org.ruikun.modules.order.mapper.OrderItemMapper");
        TableInfoHelper.initTableInfo(assistant3, OrderItem.class);
    }

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderItemMapper orderItemMapper;

    @Mock
    private CartMapper cartMapper;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private IInventoryService inventoryService;

    @Mock
    private org.ruikun.modules.points.service.IPointsService pointsService;

    @Mock
    private IPriceService priceService;

    @Mock
    private ICouponService couponService;

    @Mock
    private OrderStateMachine stateMachine;

    @Mock
    private IPaymentService paymentService;

    @Mock
    private DomainEventPublisher eventPublisher;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Captor
    private ArgumentCaptor<Order> orderCaptor;

    private Cart createCart() {
        Cart cart = new Cart();
        cart.setId(1L);
        cart.setUserId(100L);
        cart.setProductId(5L);
        cart.setProductName("测试商品");
        cart.setProductPrice(new BigDecimal("120.00"));
        cart.setQuantity(1);
        cart.setTotalPrice(new BigDecimal("120.00"));
        cart.setSelected(true);
        return cart;
    }

    @Nested
    @DisplayName("createOrder")
    class CreateOrder {

        @Test
        @DisplayName("创建订单时锁定优惠券并在支付单创建前持久化折扣")
        void createOrderLocksCoupon() {
            OrderCreateDTO dto = new OrderCreateDTO();
            dto.setCartIds(List.of(1L));
            dto.setUserCouponId(3001L);
            dto.setReceiverName("张三");
            dto.setReceiverPhone("13800000000");
            dto.setReceiverAddress("测试地址");

            when(cartMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(createCart()));
            when(priceService.applyMemberDiscountToOrder(100L, new BigDecimal("120.00"))).thenReturn(new BigDecimal("120.00"));
            when(orderMapper.insert(any(Order.class))).thenAnswer(invocation -> {
                Order order = invocation.getArgument(0);
                order.setId(10L);
                return 1;
            });
            when(couponService.lockCoupon(eq(100L), eq(3001L), eq(10L), anyString(), eq(new BigDecimal("120.00"))))
                    .thenReturn(new BigDecimal("10.00"));

            PaymentOrder paymentOrder = new PaymentOrder();
            paymentOrder.setPaymentNo("PAY123");
            when(paymentService.createPayment(eq(10L), anyString(), eq(100L), eq(new BigDecimal("110.00"))))
                    .thenReturn(paymentOrder);

            orderService.createOrder(100L, dto);

            verify(couponService).lockCoupon(eq(100L), eq(3001L), eq(10L), anyString(), eq(new BigDecimal("120.00")));
            verify(orderMapper).updateById(orderCaptor.capture());
            Order updatedOrder = orderCaptor.getValue();
            assertEquals(0, new BigDecimal("110.00").compareTo(updatedOrder.getPayAmount()));
            assertEquals(0, new BigDecimal("10.00").compareTo(updatedOrder.getCouponDiscount()));
            verify(paymentService).createPayment(eq(10L), anyString(), eq(100L), eq(new BigDecimal("110.00")));
            verify(eventPublisher).publishDelayedAfterCommit(anyString(), anyString(), any(DomainEvent.class), anyLong());
        }
    }

    @Nested
    @DisplayName("cancelOrder")
    class CancelOrder {

        @Test
        @DisplayName("手动取消待支付订单只返还该订单锁定优惠券")
        void manualCancelReturnsLockedCoupon() {
            Order order = new Order();
            order.setId(10L);
            order.setUserId(100L);
            order.setStatus(OrderStatus.PENDING_PAYMENT.getCode());
            order.setUserCouponId(3001L);
            when(orderMapper.selectById(10L)).thenReturn(order);
            when(orderItemMapper.getOrderItemsByOrderId(10L)).thenReturn(List.of());

            orderService.cancelOrder(100L, 10L);

            verify(stateMachine).transit(order, OrderStatus.CANCELLED);
            verify(couponService).returnLockedCoupon(100L, 3001L, 10L);
            verify(paymentService).closeByOrderId(10L);
        }

        @Test
        @DisplayName("超时取消待支付订单后返还该订单锁定优惠券")
        void timeoutCancelReturnsLockedCoupon() {
            Order order = new Order();
            order.setId(10L);
            order.setUserId(100L);
            order.setStatus(OrderStatus.CANCELLED.getCode());
            order.setUserCouponId(3001L);
            when(orderMapper.casUpdateStatus(10L, OrderStatus.PENDING_PAYMENT.getCode(), OrderStatus.CANCELLED.getCode()))
                    .thenReturn(1);
            when(orderMapper.selectById(10L)).thenReturn(order);
            when(orderItemMapper.getOrderItemsByOrderId(10L)).thenReturn(List.of());

            boolean cancelled = orderService.cancelOrderByTimeout(10L);

            assertEquals(true, cancelled);
            verify(couponService).returnLockedCoupon(100L, 3001L, 10L);
            verify(paymentService).closeByOrderId(10L);
        }

        @Test
        @DisplayName("已支付订单超时消息不会返还已使用优惠券")
        void timeoutPaidOrderDoesNotReturnCoupon() {
            when(orderMapper.casUpdateStatus(10L, OrderStatus.PENDING_PAYMENT.getCode(), OrderStatus.CANCELLED.getCode()))
                    .thenReturn(0);

            boolean cancelled = orderService.cancelOrderByTimeout(10L);

            assertEquals(false, cancelled);
            verify(couponService, never()).returnLockedCoupon(anyLong(), anyLong(), anyLong());
        }
    }
}
