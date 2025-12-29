package org.ruikun.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 优惠券计算 DTO
 */
@Data
public class CouponCalculateDTO {

    /**
     * 用户优惠券ID
     */
    @NotNull(message = "优惠券ID不能为空")
    private Long userCouponId;

    /**
     * 订单金额
     */
    @NotNull(message = "订单金额不能为空")
    private BigDecimal orderAmount;
}
