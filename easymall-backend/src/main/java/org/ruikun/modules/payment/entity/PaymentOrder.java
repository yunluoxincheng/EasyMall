package org.ruikun.modules.payment.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("payment_order")
public class PaymentOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String paymentNo;

    private Long orderId;

    private String orderNo;

    private Long userId;

    private BigDecimal amount;

    private String channel;

    private String status;

    private String thirdTradeNo;

    private LocalDateTime paidTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
