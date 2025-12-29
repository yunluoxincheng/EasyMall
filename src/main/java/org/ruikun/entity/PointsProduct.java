package org.ruikun.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分兑换商品表
 */
@Data
@TableName("points_product")
public class PointsProduct {
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 商品名称
     */
    private String name;

    /**
     * 商品类型 1-实物商品 2-优惠券
     */
    private Integer productType;

    /**
     * 关联ID（优惠券时关联优惠券模板ID）
     */
    private Long relationId;

    /**
     * 商品描述
     */
    private String description;

    /**
     * 商品图片
     */
    private String image;

    /**
     * 所需积分
     */
    private Integer pointsRequired;

    /**
     * 库存
     */
    private Integer stock;

    /**
     * 已兑换数量
     */
    private Integer exchangeCount;

    /**
     * 状态 0-下架 1-上架
     */
    private Integer status;

    /**
     * 排序
     */
    private Integer sortOrder;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;
}
