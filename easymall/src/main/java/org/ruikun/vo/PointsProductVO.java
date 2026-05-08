package org.ruikun.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分兑换商品VO
 */
@Data
public class PointsProductVO {
    /**
     * 商品ID
     */
    private Long id;

    /**
     * 商品名称
     */
    private String name;

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
     * 状态
     */
    private Integer status;

    /**
     * 是否可兑换（用户积分是否足够）
     */
    private Boolean canExchange;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}
