package org.ruikun.vo.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 商品详情 VO（后台管理）
 */
@Data
public class AdminProductVO {
    private Long id;
    private String name;
    private String subtitle;
    private String description;
    private BigDecimal originalPrice;
    private BigDecimal price;
    private Integer stock;
    private Integer sales;
    private String image;
    private List<String> images;
    private Long categoryId;
    private String categoryName;
    private String brand;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
