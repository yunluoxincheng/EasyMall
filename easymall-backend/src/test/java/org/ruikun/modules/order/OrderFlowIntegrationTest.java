package org.ruikun.modules.order;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.ruikun.BaseSpringBootTest;
import org.ruikun.enums.OrderStatus;
import org.ruikun.modules.inventory.entity.Inventory;
import org.ruikun.modules.inventory.mapper.InventoryMapper;
import org.ruikun.modules.order.dto.OrderCreateDTO;
import org.ruikun.modules.order.entity.Cart;
import org.ruikun.modules.order.entity.Order;
import org.ruikun.modules.order.entity.OrderItem;
import org.ruikun.modules.order.mapper.CartMapper;
import org.ruikun.modules.order.mapper.OrderItemMapper;
import org.ruikun.modules.order.mapper.OrderMapper;
import org.ruikun.modules.order.service.OrderServiceImpl;
import org.ruikun.modules.order.vo.OrderCreateVO;
import org.ruikun.modules.payment.entity.PaymentOrder;
import org.ruikun.modules.payment.mapper.PaymentOrderMapper;
import org.ruikun.modules.payment.service.PaymentServiceImpl;
import org.ruikun.modules.product.entity.Product;
import org.ruikun.modules.product.mapper.ProductMapper;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.user.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("OrderFlow Integration Tests")
@Transactional
class OrderFlowIntegrationTest extends BaseSpringBootTest {

    @Autowired
    private OrderServiceImpl orderService;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private CartMapper cartMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private InventoryMapper inventoryMapper;

    @Autowired
    private PaymentOrderMapper paymentOrderMapper;

    @MockitoBean
    private org.ruikun.modules.points.service.IPointsService pointsService;

    @MockitoBean
    private org.ruikun.modules.user.service.IPriceService priceService;

    @MockitoBean
    private org.ruikun.modules.coupon.service.ICouponService couponService;

    @MockitoSpyBean
    private PaymentServiceImpl paymentService;

    @MockitoBean
    private org.ruikun.infrastructure.mq.DomainEventPublisher eventPublisher;

    private Long userId;
    private Long productId;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("$2a$10$test");
        user.setNickname("Test");
        user.setStatus(1);
        user.setPoints(0);
        user.setLevel(1);
        userMapper.insert(user);
        userId = user.getId();

        Product product = new Product();
        product.setName("Test Product");
        product.setPrice(new BigDecimal("99.00"));
        product.setStock(100);
        product.setStatus(1);
        product.setCategoryId(1L);
        productMapper.insert(product);
        productId = product.getId();

        Inventory inv = new Inventory();
        inv.setProductId(productId);
        inv.setTotalStock(100);
        inv.setAvailableStock(100);
        inv.setLockedStock(0);
        inv.setSoldStock(0);
        inventoryMapper.insert(inv);

        doNothing().when(eventPublisher).publishDelayedAfterCommit(
                anyString(), anyString(), any(), anyLong());
        doNothing().when(eventPublisher).publishAfterCommit(
                anyString(), anyString(), any());
    }

    @AfterEach
    void tearDown() {
        cartMapper.delete(new LambdaQueryWrapper<Cart>().eq(Cart::getUserId, userId));
        orderItemMapper.delete(new LambdaQueryWrapper<>());
        orderMapper.delete(new LambdaQueryWrapper<>());
        paymentOrderMapper.delete(new LambdaQueryWrapper<>());
    }

    private Cart createCartItem() {
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setProductId(productId);
        cart.setProductName("Test Product");
        cart.setProductPrice(new BigDecimal("99.00"));
        cart.setQuantity(1);
        cart.setTotalPrice(new BigDecimal("99.00"));
        cart.setSelected(true);
        cartMapper.insert(cart);
        return cart;
    }

    @Nested
    @DisplayName("10.2 createOrder")
    class CreateOrderTests {

        @Test
        @DisplayName("创建订单后库存锁定，订单状态为 PENDING_PAYMENT")
        void createOrderLocksInventory() {
            Cart cart = createCartItem();

            when(priceService.applyMemberDiscountToOrder(eq(userId), any()))
                    .thenReturn(new BigDecimal("99.00"));

            PaymentOrder mockPayment = new PaymentOrder();
            mockPayment.setPaymentNo("PAY123");
            mockPayment.setAmount(new BigDecimal("99.00"));
            doReturn(mockPayment).when(paymentService).createPayment(anyLong(), anyString(), eq(userId), any());

            OrderCreateDTO dto = new OrderCreateDTO();
            dto.setCartIds(List.of(cart.getId()));
            dto.setReceiverName("Test User");
            dto.setReceiverPhone("13800000000");
            dto.setReceiverAddress("Test Address");

            OrderCreateVO result = orderService.createOrder(userId, dto);

            assertNotNull(result);
            assertNotNull(result.getOrderNo());

            Order order = orderMapper.selectOne(
                    new LambdaQueryWrapper<Order>()
                            .eq(Order::getOrderNo, result.getOrderNo()));
            assertNotNull(order);
            assertEquals(OrderStatus.PENDING_PAYMENT.getCode(), order.getStatus());
            assertEquals(userId, order.getUserId());

            Inventory inv = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            assertEquals(1, inv.getLockedStock());
            assertEquals(99, inv.getAvailableStock());
        }

        @Test
        @DisplayName("创建订单时携带优惠券，锁定优惠券并记录折扣")
        void createOrderWithCouponLocksCoupon() {
            Cart cart = createCartItem();

            when(priceService.applyMemberDiscountToOrder(eq(userId), any()))
                    .thenReturn(new BigDecimal("99.00"));

            BigDecimal couponDiscount = new BigDecimal("10.00");
            when(couponService.lockCoupon(eq(userId), eq(3001L), anyLong(), anyString(), eq(new BigDecimal("99.00"))))
                    .thenReturn(couponDiscount);

            PaymentOrder mockPayment = new PaymentOrder();
            mockPayment.setPaymentNo("PAY456");
            mockPayment.setAmount(new BigDecimal("89.00"));
            doReturn(mockPayment).when(paymentService).createPayment(anyLong(), anyString(), eq(userId), eq(new BigDecimal("89.00")));

            OrderCreateDTO dto = new OrderCreateDTO();
            dto.setCartIds(List.of(cart.getId()));
            dto.setUserCouponId(3001L);
            dto.setReceiverName("Test User");
            dto.setReceiverPhone("13800000000");
            dto.setReceiverAddress("Test Address");

            OrderCreateVO result = orderService.createOrder(userId, dto);

            assertNotNull(result);
            Order order = orderMapper.selectOne(
                    new LambdaQueryWrapper<Order>()
                            .eq(Order::getOrderNo, result.getOrderNo()));
            assertNotNull(order);
            assertEquals(OrderStatus.PENDING_PAYMENT.getCode(), order.getStatus());
            assertEquals(0, new BigDecimal("89.00").compareTo(order.getPayAmount()));
            assertEquals(0, new BigDecimal("10.00").compareTo(order.getCouponDiscount()));

            verify(couponService).lockCoupon(eq(userId), eq(3001L), eq(order.getId()),
                    eq(order.getOrderNo()), eq(new BigDecimal("99.00")));
        }
    }

    @Nested
    @DisplayName("10.3 createOrder with insufficient stock")
    class CreateOrderInsufficientStockTests {

        @Test
        @DisplayName("库存不足时创建订单抛异常，订单未创建且库存未锁定")
        void createOrderFailsWhenStockInsufficient() {
            Inventory inv = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            inv.setAvailableStock(0);
            inventoryMapper.updateById(inv);

            Cart cart = createCartItem();

            when(priceService.applyMemberDiscountToOrder(eq(userId), any()))
                    .thenReturn(new BigDecimal("99.00"));

            PaymentOrder mockPayment = new PaymentOrder();
            mockPayment.setPaymentNo("PAY999");
            mockPayment.setAmount(new BigDecimal("99.00"));
            doReturn(mockPayment).when(paymentService).createPayment(anyLong(), anyString(), eq(userId), any());

            OrderCreateDTO dto = new OrderCreateDTO();
            dto.setCartIds(List.of(cart.getId()));
            dto.setReceiverName("Test User");
            dto.setReceiverPhone("13800000000");
            dto.setReceiverAddress("Test Address");

            assertThrows(Exception.class,
                    () -> orderService.createOrder(userId, dto));

            Long orderCount = orderMapper.selectCount(
                    new LambdaQueryWrapper<Order>().eq(Order::getUserId, userId));
            assertEquals(0, orderCount);

            Inventory afterInv = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            assertEquals(0, afterInv.getLockedStock());
            assertEquals(0, afterInv.getAvailableStock());
        }
    }

    @Nested
    @DisplayName("10.4 processCallback")
    class ProcessCallbackTests {

        @Test
        @DisplayName("支付回调后确认库存扣减、确认优惠券使用、订单状态变为 PAID")
        void processCallbackConfirmsStockAndCoupon() {
            Inventory inv = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            inv.setLockedStock(1);
            inv.setAvailableStock(99);
            inv.setSoldStock(0);
            inventoryMapper.updateById(inv);

            Order order = new Order();
            order.setOrderNo("ORD-CB-001");
            order.setUserId(userId);
            order.setTotalAmount(new BigDecimal("99.00"));
            order.setPayAmount(new BigDecimal("89.00"));
            order.setStatus(OrderStatus.PENDING_PAYMENT.getCode());
            order.setUserCouponId(3001L);
            order.setReceiverName("Test User");
            order.setReceiverPhone("13800000000");
            order.setReceiverAddress("Test Address");
            orderMapper.insert(order);

            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setProductId(productId);
            item.setProductName("Test Product");
            item.setProductPrice(new BigDecimal("99.00"));
            item.setQuantity(1);
            item.setTotalPrice(new BigDecimal("99.00"));
            orderItemMapper.insert(item);

            PaymentOrder paymentOrder = new PaymentOrder();
            paymentOrder.setPaymentNo("PAY-CB-001");
            paymentOrder.setOrderId(order.getId());
            paymentOrder.setOrderNo(order.getOrderNo());
            paymentOrder.setUserId(userId);
            paymentOrder.setAmount(new BigDecimal("89.00"));
            paymentOrder.setChannel("MOCK");
            paymentOrder.setStatus("PAYING");
            paymentOrderMapper.insert(paymentOrder);

            doNothing().when(couponService).confirmCouponUsed(eq(userId), eq(3001L), eq(order.getId()));

            paymentService.processCallback("PAY-CB-001", new BigDecimal("89.00"), "MOCK");

            PaymentOrder paidPayment = paymentOrderMapper.selectById(paymentOrder.getId());
            assertEquals("PAID", paidPayment.getStatus());
            assertNotNull(paidPayment.getPaidTime());

            Order paidOrder = orderMapper.selectById(order.getId());
            assertEquals(OrderStatus.PAID.getCode(), paidOrder.getStatus());
            assertNotNull(paidOrder.getPayTime());

            Inventory confirmedInv = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            assertEquals(0, confirmedInv.getLockedStock());
            assertEquals(1, confirmedInv.getSoldStock());
            assertEquals(99, confirmedInv.getAvailableStock());

            verify(couponService).confirmCouponUsed(eq(userId), eq(3001L), eq(order.getId()));
        }
    }

    @Nested
    @DisplayName("10.5 processCallback idempotency")
    class ProcessCallbackIdempotencyTests {

        @Test
        @DisplayName("重复支付回调幂等处理，下游操作不重复执行")
        void duplicateCallbackIsIdempotent() {
            Inventory inv = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            inv.setLockedStock(1);
            inv.setAvailableStock(99);
            inv.setSoldStock(0);
            inventoryMapper.updateById(inv);

            Order order = new Order();
            order.setOrderNo("ORD-IDEMPOTENT-001");
            order.setUserId(userId);
            order.setTotalAmount(new BigDecimal("99.00"));
            order.setPayAmount(new BigDecimal("99.00"));
            order.setStatus(OrderStatus.PENDING_PAYMENT.getCode());
            order.setReceiverName("Test User");
            order.setReceiverPhone("13800000000");
            order.setReceiverAddress("Test Address");
            orderMapper.insert(order);

            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setProductId(productId);
            item.setProductName("Test Product");
            item.setProductPrice(new BigDecimal("99.00"));
            item.setQuantity(1);
            item.setTotalPrice(new BigDecimal("99.00"));
            orderItemMapper.insert(item);

            PaymentOrder paymentOrder = new PaymentOrder();
            paymentOrder.setPaymentNo("PAY-IDEMPOTENT-001");
            paymentOrder.setOrderId(order.getId());
            paymentOrder.setOrderNo(order.getOrderNo());
            paymentOrder.setUserId(userId);
            paymentOrder.setAmount(new BigDecimal("99.00"));
            paymentOrder.setChannel("MOCK");
            paymentOrder.setStatus("PAYING");
            paymentOrderMapper.insert(paymentOrder);

            paymentService.processCallback("PAY-IDEMPOTENT-001", new BigDecimal("99.00"), "MOCK");

            Inventory afterFirst = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            assertEquals(0, afterFirst.getLockedStock());
            assertEquals(1, afterFirst.getSoldStock());

            paymentService.processCallback("PAY-IDEMPOTENT-001", new BigDecimal("99.00"), "MOCK");

            Inventory afterSecond = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            assertEquals(0, afterSecond.getLockedStock());
            assertEquals(1, afterSecond.getSoldStock());
        }
    }

    @Nested
    @DisplayName("10.6 cancelOrder")
    class CancelOrderTests {

        @Test
        @DisplayName("取消待支付订单后释放库存并返还优惠券")
        void cancelOrderReleasesInventoryAndReturnsCoupon() {
            Inventory inv = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            inv.setLockedStock(1);
            inv.setAvailableStock(99);
            inventoryMapper.updateById(inv);

            Order order = new Order();
            order.setOrderNo("ORD-TEST-CANCEL");
            order.setUserId(userId);
            order.setTotalAmount(new BigDecimal("99.00"));
            order.setPayAmount(new BigDecimal("89.00"));
            order.setStatus(OrderStatus.PENDING_PAYMENT.getCode());
            order.setUserCouponId(3001L);
            order.setReceiverName("Test User");
            order.setReceiverPhone("13800000000");
            order.setReceiverAddress("Test Address");
            orderMapper.insert(order);

            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setProductId(productId);
            item.setProductName("Test Product");
            item.setProductPrice(new BigDecimal("99.00"));
            item.setQuantity(1);
            item.setTotalPrice(new BigDecimal("99.00"));
            orderItemMapper.insert(item);

            doNothing().when(paymentService).closeByOrderId(order.getId());

            orderService.cancelOrder(userId, order.getId());

            Order cancelled = orderMapper.selectById(order.getId());
            assertEquals(OrderStatus.CANCELLED.getCode(), cancelled.getStatus());

            Inventory released = inventoryMapper.selectOne(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getProductId, productId));
            assertEquals(0, released.getLockedStock());
            assertEquals(100, released.getAvailableStock());

            verify(couponService).returnLockedCoupon(eq(userId), eq(3001L), eq(order.getId()));
        }
    }

    @Nested
    @DisplayName("10.7 confirmOrder")
    class ConfirmOrderTests {

        @Test
        @DisplayName("确认收货后订单状态变为 COMPLETED，发布积分发放事件")
        void confirmOrderCompletesAndPublishesEvent() {
            Order order = new Order();
            order.setOrderNo("ORD-TEST-CONFIRM");
            order.setUserId(userId);
            order.setTotalAmount(new BigDecimal("99.00"));
            order.setPayAmount(new BigDecimal("99.00"));
            order.setStatus(OrderStatus.SHIPPED.getCode());
            order.setReceiverName("Test User");
            order.setReceiverPhone("13800000000");
            order.setReceiverAddress("Test Address");
            orderMapper.insert(order);

            orderService.confirmOrder(userId, order.getId());

            Order completed = orderMapper.selectById(order.getId());
            assertEquals(OrderStatus.COMPLETED.getCode(), completed.getStatus());

            verify(eventPublisher).publishAfterCommit(
                    anyString(), anyString(), any());
        }
    }
}
