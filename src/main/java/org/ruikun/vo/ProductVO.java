package org.ruikun.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductVO {
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
}