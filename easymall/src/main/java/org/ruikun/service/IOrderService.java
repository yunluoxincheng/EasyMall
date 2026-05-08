package org.ruikun.service;

import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.dto.OrderCreateDTO;
import org.ruikun.vo.OrderVO;

public interface IOrderService {
    String createOrder(Long userId, OrderCreateDTO orderCreateDTO);

    PageResult<OrderVO> getOrderPage(Long userId, PageRequest pageRequest);

    OrderVO getOrderDetail(Long userId, Long orderId);

    void cancelOrder(Long userId, Long orderId);

    void payOrder(Long userId, Long orderId, String paymentMethod);

    void confirmOrder(Long userId, Long orderId);
}