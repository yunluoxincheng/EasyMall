package org.ruikun.vo.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品列表项 VO（后台管理）
 */
@Data
public class AdminProductPageVO {
    private Long id;
    private String name;
    private String subtitle;
    private BigDecimal price;
    private Integer stock;
    private Integer sales;
    private String image;
    private Long categoryId;
    private String categoryName;
    private Integer status;
    private LocalDateTime createTime;
}
