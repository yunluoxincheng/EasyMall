package org.ruikun.modules.payment.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentVO {
    private Long id;
    private String paymentNo;
    private Long orderId;
    private String orderNo;
    private BigDecimal amount;
    private String channel;
    private String status;
    private String statusText;
    private String thirdTradeNo;
    private LocalDateTime paidTime;
    private LocalDateTime createTime;
}
