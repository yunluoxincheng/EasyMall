package org.ruikun.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券模板 DTO（管理员保存/更新）
 */
@Data
public class CouponTemplateDTO {

    /**
     * 优惠券ID（更新时需要）
     */
    private Long id;

    /**
     * 优惠券名称
     */
    @NotBlank(message = "优惠券名称不能为空")
    @Size(max = 100, message = "优惠券名称长度不能超过100个字符")
    private String name;

    /**
     * 优惠券类型
     */
    @NotNull(message = "优惠券类型不能为空")
    @Min(value = 1, message = "优惠券类型不合法")
    @Max(value = 4, message = "优惠券类型不合法")
    private Integer type;

    /**
     * 优惠金额（固定金额券专用）
     */
    @DecimalMin(value = "0.00", message = "优惠金额不能为负数")
    private BigDecimal discountAmount;

    /**
     * 折扣比例（百分比券专用，如85表示85折）
     */
    @DecimalMin(value = "1.00", message = "折扣比例不能小于1")
    @DecimalMax(value = "99.00", message = "折扣比例不能大于99")
    private BigDecimal discountPercentage;

    /**
     * 使用门槛（最低消费金额）
     */
    @DecimalMin(value = "0.00", message = "使用门槛不能为负数")
    private BigDecimal minAmount;

    /**
     * 最大优惠金额（百分比券专用，0表示无限制）
     */
    @DecimalMin(value = "0.00", message = "最大优惠金额不能为负数")
    private BigDecimal maxDiscount;

    /**
     * 发行总数量
     */
    @NotNull(message = "发行数量不能为空")
    @Min(value = 1, message = "发行数量至少为1")
    private Integer totalCount;

    /**
     * 会员等级限制（0表示不限制，1-5对应会员等级）
     */
    @Min(value = 0, message = "会员等级限制不合法")
    @Max(value = 5, message = "会员等级限制不合法")
    private Integer memberLevel;

    /**
     * 有效天数（领取后N天有效，0表示使用固定时间）
     */
    @Min(value = 0, message = "有效天数不能为负数")
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
    @Min(value = 0, message = "排序值不能为负数")
    private Integer sortOrder;

    /**
     * 状态 0-下架 1-上架
     */
    @Min(value = 0, message = "状态不合法")
    @Max(value = 1, message = "状态不合法")
    private Integer status;

    /**
     * 使用说明
     */
    @Size(max = 500, message = "使用说明长度不能超过500个字符")
    private String description;
}
