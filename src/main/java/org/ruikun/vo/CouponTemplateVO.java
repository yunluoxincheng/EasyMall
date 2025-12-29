package org.ruikun.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券模板 VO
 */
@Data
public class CouponTemplateVO {

    /**
     * 优惠券模板ID
     */
    private Long id;

    /**
     * 优惠券名称
     */
    private String name;

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
     * 发行总数量
     */
    private Integer totalCount;

    /**
     * 已领取数量
     */
    private Integer receivedCount;

    /**
     * 已使用数量
     */
    private Integer usedCount;

    /**
     * 剩余数量
     */
    private Integer remainingCount;

    /**
     * 领取率
     */
    private Double receiveRate;

    /**
     * 使用率
     */
    private Double usageRate;

    /**
     * 会员等级限制
     */
    private Integer memberLevel;

    /**
     * 有效天数
     */
    private Integer validDays;

    /**
     * 有效期开始时间
     */
    private LocalDateTime startTime;

    /**
     * 有效期结束时间
     */
    private LocalDateTime endTime;

    /**
     * 排序
     */
    private Integer sortOrder;

    /**
     * 状态
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusDesc;

    /**
     * 使用说明
     */
    private String description;

    /**
     * 是否可领取（用户端）
     */
    private Boolean canReceive;

    /**
     * 已领取数量（用户端）
     */
    private Integer receivedByUser;
}
