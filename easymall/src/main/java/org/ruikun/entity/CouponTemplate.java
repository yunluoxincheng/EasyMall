package org.ruikun.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券模板实体类
 */
@Data
@TableName("coupon_template")
public class CouponTemplate {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 优惠券名称
     */
    private String name;

    /**
     * 优惠券类型 1-固定金额 2-百分比折扣 3-新人专享 4-会员专属
     */
    private Integer type;

    /**
     * 优惠金额（固定金额券专用）
     */
    private BigDecimal discountAmount;

    /**
     * 折扣比例（百分比券专用，如85表示85折）
     */
    private BigDecimal discountPercentage;

    /**
     * 使用门槛（最低消费金额）
     */
    private BigDecimal minAmount;

    /**
     * 最大优惠金额（百分比券专用，0表示无限制）
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
     * 会员等级限制（0表示不限制，1-5对应会员等级）
     */
    private Integer memberLevel;

    /**
     * 有效天数（领取后N天有效，0表示使用固定时间）
     */
    private Integer validDays;

    /**
     * 有效期开始时间（固定有效期时使用）
     */
    private LocalDateTime startTime;

    /**
     * 有效期结束时间（固定有效期时使用）
     */
    private LocalDateTime endTime;

    /**
     * 排序
     */
    private Integer sortOrder;

    /**
     * 状态 0-下架 1-上架
     */
    private Integer status;

    /**
     * 使用说明
     */
    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;
}
