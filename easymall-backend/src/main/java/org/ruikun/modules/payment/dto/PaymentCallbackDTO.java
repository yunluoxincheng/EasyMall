package org.ruikun.modules.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentCallbackDTO {
    @NotBlank(message = "支付单号不能为空")
    private String paymentNo;

    @NotNull(message = "支付金额不能为空")
    private BigDecimal amount;

    @NotBlank(message = "支付渠道不能为空")
    private String channel;
}
