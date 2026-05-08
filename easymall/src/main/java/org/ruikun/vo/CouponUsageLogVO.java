package org.ruikun.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券使用记录 VO
 */
@Data
public class CouponUsageLogVO {

    /**
     * 记录ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户优惠券ID
     */
    private Long userCouponId;

    /**
     * 优惠券模板ID
     */
    private Long templateId;

    /**
     * 优惠券名称
     */
    private String couponName;

    /**
     * 优惠券类型
     */
    private Integer couponType;

    /**
     * 优惠券类型描述
     */
    private String couponTypeDesc;

    /**
     * 订单ID
     */
    private Long orderId;

    /**
     * 订单号
     */
    private String orderNo;

    /**
     * 订单金额
     */
    private BigDecimal orderAmount;

    /**
     * 优惠金额
     */
    private BigDecimal discountAmount;

    /**
     * 操作类型 1-使用 2-返还
     */
    private Integer action;

    /**
     * 操作类型描述
     */
    private String actionDesc;

    /**
     * 操作时间
     */
    private LocalDateTime createTime;
}
