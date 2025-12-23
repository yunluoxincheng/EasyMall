package org.ruikun.vo.admin;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分兑换商品列表项 VO（后台管理）
 */
@Data
public class AdminPointsProductPageVO {
    private Long id;
    private String name;
    private String description;
    private String image;
    private Integer pointsRequired;
    private Integer stock;
    private Integer exchangeCount;
    private Integer status;
    private Integer sortOrder;
    private LocalDateTime createTime;
}
