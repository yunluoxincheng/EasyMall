package org.ruikun.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.dto.OrderCreateDTO;
import org.ruikun.entity.*;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.*;
import org.ruikun.service.IOrderService;
import org.ruikun.vo.OrderItemVO;
import org.ruikun.vo.OrderVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final CartMapper cartMapper;
    private final ProductMapper productMapper;
    private final org.ruikun.service.IPointsService pointsService;
    private final org.ruikun.service.IPriceService priceService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String createOrder(Long userId, OrderCreateDTO orderCreateDTO) {
        List<Cart> cartItems = cartMapper.selectList(
                new LambdaQueryWrapper<Cart>()
                        .eq(Cart::getUserId, userId)
                        .in(Cart::getId, orderCreateDTO.getCartIds())
                        .eq(Cart::getSelected, true)
        );

        if (cartItems.isEmpty()) {
            throw new BusinessException("请选择要购买的商品");
        }

        BigDecimal totalAmount = cartItems.stream()
                .map(Cart::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 应用会员折扣
        BigDecimal payAmount = priceService.applyMemberDiscountToOrder(userId, totalAmount);

        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setPayAmount(payAmount);
        order.setStatus(0);
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

            productMapper.decreaseStock(cartItem.getProductId(), cartItem.getQuantity());
        }

        cartMapper.deleteBatchIds(orderCreateDTO.getCartIds());

        return order.getOrderNo();
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
            throw new BusinessException("订单不存在");
        }
        return convertToVO(order);
    }

    @Override
    public void cancelOrder(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() != 0) {
            throw new BusinessException("订单状态不允许取消");
        }

        order.setStatus(4);
        orderMapper.updateById(order);

        List<OrderItem> orderItems = orderItemMapper.getOrderItemsByOrderId(orderId);
        for (OrderItem orderItem : orderItems) {
            productMapper.increaseStock(orderItem.getProductId(), orderItem.getQuantity());
        }
    }

    @Override
    public void payOrder(Long userId, Long orderId, String paymentMethod) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() != 0) {
            throw new BusinessException("订单状态不允许支付");
        }

        order.setStatus(1);
        order.setPaymentMethod(paymentMethod);
        order.setPayTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmOrder(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() != 2) {
            throw new BusinessException("订单状态不允许确认收货");
        }

        order.setStatus(3);
        orderMapper.updateById(order);

        // 订单完成后增加积分
        pointsService.addPointsForOrder(userId, orderId, order.getPayAmount().doubleValue());
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
        orderVO.setStatusText(getStatusText(order.getStatus()));
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

    private String getStatusText(Integer status) {
        switch (status) {
            case 0: return "待支付";
            case 1: return "已支付";
            case 2: return "已发货";
            case 3: return "已完成";
            case 4: return "已取消";
            default: return "未知状态";
        }
    }
}