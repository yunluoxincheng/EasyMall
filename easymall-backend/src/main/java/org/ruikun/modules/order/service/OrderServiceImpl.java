package org.ruikun.modules.order.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.common.ResponseCode;
import org.ruikun.modules.order.dto.OrderCreateDTO;
import org.ruikun.modules.order.entity.Cart;
import org.ruikun.modules.order.entity.Order;
import org.ruikun.modules.order.entity.OrderItem;
import org.ruikun.enums.OrderStatus;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.order.mapper.CartMapper;
import org.ruikun.modules.order.mapper.OrderItemMapper;
import org.ruikun.modules.order.mapper.OrderMapper;
import org.ruikun.modules.product.mapper.ProductMapper;
import org.ruikun.modules.inventory.service.IInventoryService;
import org.ruikun.modules.order.service.IOrderService;
import org.ruikun.modules.order.vo.OrderCreateVO;
import org.ruikun.modules.order.vo.OrderItemVO;
import org.ruikun.modules.order.vo.OrderVO;
import org.ruikun.modules.payment.entity.PaymentOrder;
import org.ruikun.modules.payment.service.IPaymentService;
import org.ruikun.modules.payment.vo.PaymentVO;
import org.ruikun.infrastructure.mq.DomainEvent;
import org.ruikun.infrastructure.mq.DomainEventPublisher;
import org.ruikun.infrastructure.mq.MqConstants;
import org.ruikun.infrastructure.mq.event.OrderCreatedPayload;
import org.ruikun.infrastructure.mq.event.OrderCompletedPayload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final CartMapper cartMapper;
    private final ProductMapper productMapper;
    private final IInventoryService inventoryService;
    private final org.ruikun.modules.points.service.IPointsService pointsService;
    private final org.ruikun.modules.user.service.IPriceService priceService;
    private final org.ruikun.modules.coupon.service.ICouponService couponService;
    private final OrderStateMachine stateMachine;
    private final IPaymentService paymentService;
    private final DomainEventPublisher eventPublisher;

    @Value("${easymall.order.timeout-minutes:30}")
    private int orderTimeoutMinutes;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderCreateVO createOrder(Long userId, OrderCreateDTO orderCreateDTO) {
        List<Cart> cartItems = cartMapper.selectList(
                new LambdaQueryWrapper<Cart>()
                        .eq(Cart::getUserId, userId)
                        .in(Cart::getId, orderCreateDTO.getCartIds())
                        .eq(Cart::getSelected, true)
        );

        if (cartItems.isEmpty()) {
            throw new BusinessException(ResponseCode.CART_ITEM_EMPTY, "请选择要购买的商品");
        }

        BigDecimal totalAmount = cartItems.stream()
                .map(Cart::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 先应用会员折扣
        BigDecimal payAmount = priceService.applyMemberDiscountToOrder(userId, totalAmount);

        // 再应用优惠券优惠（优惠券在会员折扣后的金额基础上计算）
        BigDecimal couponDiscount = BigDecimal.ZERO;
        Long userCouponId = orderCreateDTO.getUserCouponId();

        if (userCouponId != null) {
            // 使用优惠券
            couponDiscount = couponService.useCoupon(userId, userCouponId, null, null, payAmount);
            payAmount = payAmount.subtract(couponDiscount);
            // 确保支付金额不为负
            if (payAmount.compareTo(BigDecimal.ZERO) < 0) {
                payAmount = BigDecimal.ZERO;
            }
        }

        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setPayAmount(payAmount);
        order.setStatus(OrderStatus.PENDING_PAYMENT.getCode());
        order.setUserCouponId(userCouponId);
        order.setCouponDiscount(couponDiscount);
        order.setReceiverName(orderCreateDTO.getReceiverName());
        order.setReceiverPhone(orderCreateDTO.getReceiverPhone());
        order.setReceiverAddress(orderCreateDTO.getReceiverAddress());
        order.setRemark(orderCreateDTO.getRemark());
        orderMapper.insert(order);

        for (Cart cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setProductName(cartItem.getProductName());
            orderItem.setProductImage(cartItem.getProductImage());
            orderItem.setProductPrice(cartItem.getProductPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setTotalPrice(cartItem.getTotalPrice());
            orderItemMapper.insert(orderItem);

            inventoryService.lockStock(cartItem.getProductId(), cartItem.getQuantity(), order.getId());
        }

        cartMapper.deleteBatchIds(orderCreateDTO.getCartIds());

        // 创建支付单
        PaymentOrder paymentOrder = paymentService.createPayment(order.getId(), order.getOrderNo(), userId, payAmount);

        OrderCreateVO createVO = new OrderCreateVO();
        createVO.setOrderNo(order.getOrderNo());
        createVO.setPaymentNo(paymentOrder.getPaymentNo());

        // 发布延迟关单消息（事务提交后）
        OrderCreatedPayload payload = new OrderCreatedPayload();
        payload.setOrderId(order.getId());
        payload.setOrderNo(order.getOrderNo());
        payload.setUserId(userId);
        DomainEvent<OrderCreatedPayload> event = DomainEvent.of(
                MqConstants.ORDER_CREATED_EVENT,
                MqConstants.AGGREGATE_TYPE_ORDER,
                order.getId(), payload);
        long expirationMillis = orderTimeoutMinutes * 60L * 1000L;
        eventPublisher.publishDelayedAfterCommit(
                MqConstants.ORDER_EXCHANGE,
                MqConstants.ORDER_CREATED_ROUTING_KEY,
                event, expirationMillis);

        return createVO;
    }

    @Override
    public PageResult<OrderVO> getOrderPage(Long userId, PageRequest pageRequest) {
        Page<Order> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        Page<Order> orderPage = orderMapper.selectPage(page,
                new LambdaQueryWrapper<Order>()
                        .eq(Order::getUserId, userId)
                        .orderByDesc(Order::getCreateTime));

        List<OrderVO> orderVOs = orderPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(orderPage.getTotal(), orderVOs,
                (int) orderPage.getCurrent(), (int) orderPage.getSize());
    }

    @Override
    public OrderVO getOrderDetail(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.ORDER_NOT_FOUND, "订单不存在");
        }
        return convertToVO(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.ORDER_NOT_FOUND, "订单不存在");
        }

        stateMachine.transit(order, OrderStatus.CANCELLED);
        cancelOrderInternal(order);

        // 同一事务内关闭关联的活跃支付单，保证强一致
        paymentService.closeByOrderId(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrderInternal(Order order) {
        orderMapper.updateById(order);

        if (order.getUserCouponId() != null) {
            couponService.returnCoupon(order.getUserId(), order.getUserCouponId(), order.getId());
        }

        List<OrderItem> orderItems = orderItemMapper.getOrderItemsByOrderId(order.getId());
        for (OrderItem orderItem : orderItems) {
            inventoryService.releaseLockedStock(orderItem.getProductId(), orderItem.getQuantity(), order.getId());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelOrderByTimeout(Long orderId) {
        // CAS: only transition from PENDING_PAYMENT to CANCELLED
        int rows = orderMapper.casUpdateStatus(
                orderId,
                OrderStatus.PENDING_PAYMENT.getCode(),
                OrderStatus.CANCELLED.getCode());
        if (rows == 0) {
            log.info("Order timeout cancel skipped, order {} is no longer PENDING_PAYMENT", orderId);
            return false;
        }

        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            log.warn("Order {} not found after CAS cancel", orderId);
            return false;
        }

        // Release inventory
        List<OrderItem> orderItems = orderItemMapper.getOrderItemsByOrderId(orderId);
        for (OrderItem orderItem : orderItems) {
            inventoryService.releaseLockedStock(orderItem.getProductId(), orderItem.getQuantity(), orderId);
        }

        // Return coupon
        if (order.getUserCouponId() != null) {
            couponService.returnCoupon(order.getUserId(), order.getUserCouponId(), orderId);
        }

        // Close active payment order
        paymentService.closeByOrderId(orderId);

        log.info("Order {} cancelled by timeout successfully", orderId);
        return true;
    }

    @Override
    public PaymentVO getPaymentInfo(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.ORDER_NOT_FOUND, "订单不存在");
        }
        return paymentService.getByOrderId(orderId, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmOrder(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.ORDER_NOT_FOUND, "订单不存在");
        }

        stateMachine.transit(order, OrderStatus.COMPLETED);
        orderMapper.updateById(order);

        // 异步积分：发布 OrderCompletedEvent，由 MQ 消费者发放积分
        OrderCompletedPayload payload = new OrderCompletedPayload();
        payload.setOrderId(orderId);
        payload.setUserId(userId);
        payload.setPayAmount(order.getPayAmount().doubleValue());
        DomainEvent<OrderCompletedPayload> event = DomainEvent.of(
                MqConstants.ORDER_COMPLETED_EVENT,
                MqConstants.AGGREGATE_TYPE_ORDER,
                orderId, payload);
        eventPublisher.publishAfterCommit(
                MqConstants.ORDER_EXCHANGE,
                MqConstants.ORDER_COMPLETED_ROUTING_KEY,
                event);
    }

    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis();
    }

    private OrderVO convertToVO(Order order) {
        OrderVO orderVO = new OrderVO();
        orderVO.setId(order.getId());
        orderVO.setOrderNo(order.getOrderNo());
        orderVO.setUserId(order.getUserId());
        orderVO.setTotalAmount(order.getTotalAmount());
        orderVO.setPayAmount(order.getPayAmount());
        orderVO.setStatus(order.getStatus());
        orderVO.setStatusText(OrderStatus.getDescriptionByCode(order.getStatus()));
        orderVO.setPaymentMethod(order.getPaymentMethod());
        orderVO.setPayTime(order.getPayTime());
        orderVO.setReceiverName(order.getReceiverName());
        orderVO.setReceiverPhone(order.getReceiverPhone());
        orderVO.setReceiverAddress(order.getReceiverAddress());
        orderVO.setRemark(order.getRemark());
        orderVO.setCreateTime(order.getCreateTime());

        List<OrderItem> orderItems = orderItemMapper.getOrderItemsByOrderId(order.getId());
        List<OrderItemVO> orderItemVOs = orderItems.stream()
                .map(this::convertOrderItemToVO)
                .collect(Collectors.toList());
        orderVO.setOrderItems(orderItemVOs);

        return orderVO;
    }

    private OrderItemVO convertOrderItemToVO(OrderItem orderItem) {
        OrderItemVO orderItemVO = new OrderItemVO();
        orderItemVO.setId(orderItem.getId());
        orderItemVO.setOrderId(orderItem.getOrderId());
        orderItemVO.setProductId(orderItem.getProductId());
        orderItemVO.setProductName(orderItem.getProductName());
        orderItemVO.setProductImage(orderItem.getProductImage());
        orderItemVO.setProductPrice(orderItem.getProductPrice());
        orderItemVO.setQuantity(orderItem.getQuantity());
        orderItemVO.setTotalPrice(orderItem.getTotalPrice());
        orderItemVO.setCreateTime(orderItem.getCreateTime());
        return orderItemVO;
    }


}