package org.ruikun.vo;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 优惠券计算结果 VO
 */
@Data
public class CouponCalculateResultVO {

    /**
     * 用户优惠券ID
     */
    private Long userCouponId;

    /**
     * 优惠券名称
     */
    private String couponName;

    /**
     * 优惠券类型
     */
    private Integer type;

    /**
     * 优惠券类型描述
     */
    private String typeDesc;

    /**
     * 原订单金额
     */
    private BigDecimal originalAmount;

    /**
     * 优惠金额
     */
    private BigDecimal discountAmount;

    /**
     * 优惠后金额
     */
    private BigDecimal finalAmount;

    /**
     * 是否可用
     */
    private Boolean available;

    /**
     * 不可用原因
     */
    private String unavailableReason;
}
