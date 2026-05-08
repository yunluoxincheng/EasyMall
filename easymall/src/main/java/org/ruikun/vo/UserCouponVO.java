package org.ruikun.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户优惠券 VO
 */
@Data
public class UserCouponVO {

    /**
     * 用户优惠券ID
     */
    private Long id;

    /**
     * 优惠券模板ID
     */
    private Long templateId;

    /**
     * 优惠券编码
     */
    private String couponCode;

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
     * 优惠金额
     */
    private BigDecimal discountAmount;

    /**
     * 折扣比例
     */
    private BigDecimal discountPercentage;

    /**
     * 使用门槛
     */
    private BigDecimal minAmount;

    /**
     * 最大优惠金额
     */
    private BigDecimal maxDiscount;

    /**
     * 有效期开始时间
     */
    private LocalDateTime startTime;

    /**
     * 有效期结束时间
     */
    private LocalDateTime endTime;

    /**
     * 状态
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusDesc;

    /**
     * 使用时间
     */
    private LocalDateTime useTime;

    /**
     * 订单ID
     */
    private Long orderId;

    /**
     * 订单号
     */
    private String orderNo;

    /**
     * 领取时间
     */
    private LocalDateTime receiveTime;

    /**
     * 是否即将过期（3天内）
     */
    private Boolean expiringSoon;
}
