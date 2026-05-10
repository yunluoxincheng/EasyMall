package org.ruikun.modules.payment.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("payment_callback_log")
public class PaymentCallbackLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String paymentNo;

    private String channel;

    private String callbackRaw;

    private String result;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
