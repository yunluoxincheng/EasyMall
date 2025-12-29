package org.ruikun.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券使用记录实体类
 */
@Data
@TableName("coupon_usage_log")
public class CouponUsageLog {

    @TableId(type = IdType.AUTO)
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
     * 操作时间
     */
    private LocalDateTime createTime;
}
