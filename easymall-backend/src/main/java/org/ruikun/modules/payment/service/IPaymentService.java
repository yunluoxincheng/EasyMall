package org.ruikun.modules.payment.service;

import org.ruikun.modules.payment.entity.PaymentOrder;
import org.ruikun.modules.payment.vo.PaymentVO;

import java.math.BigDecimal;

public interface IPaymentService {

    PaymentOrder createPayment(Long orderId, String orderNo, Long userId, BigDecimal amount);

    PaymentVO getByPaymentNo(String paymentNo, Long userId);

    PaymentVO getByOrderId(Long orderId, Long userId);

    PaymentVO pay(String paymentNo, Long userId);

    void processCallback(String paymentNo, BigDecimal amount, String channel);

    void closeByOrderId(Long orderId);
}
