package org.ruikun.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 会员等级配置表
 */
@Data
@TableName("member_level")
public class MemberLevel {
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 等级
     */
    private Integer level;

    /**
     * 等级名称
     */
    private String levelName;

    /**
     * 所需最小积分
     */
    private Integer minPoints;

    /**
     * 所需最大积分
     */
    private Integer maxPoints;

    /**
     * 折扣率(0.85表示85折)
     */
    private BigDecimal discount;

    /**
     * 等级图标
     */
    private String icon;

    /**
     * 会员权益描述
     */
    private String benefits;

    /**
     * 排序
     */
    private Integer sortOrder;

    /**
     * 状态 0-禁用 1-启用
     */
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;
}
