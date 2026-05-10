package org.ruikun.modules.order.service;

import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.modules.order.dto.OrderCreateDTO;
import org.ruikun.modules.order.entity.Order;
import org.ruikun.modules.order.vo.OrderCreateVO;
import org.ruikun.modules.order.vo.OrderVO;
import org.ruikun.modules.payment.vo.PaymentVO;

public interface IOrderService {
    OrderCreateVO createOrder(Long userId, OrderCreateDTO orderCreateDTO);

    PageResult<OrderVO> getOrderPage(Long userId, PageRequest pageRequest);

    OrderVO getOrderDetail(Long userId, Long orderId);

    void cancelOrder(Long userId, Long orderId);

    PaymentVO getPaymentInfo(Long userId, Long orderId);

    void confirmOrder(Long userId, Long orderId);

    void cancelOrderInternal(Order order);
}