package org.ruikun.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("product")
public class Product {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String subtitle;

    private String description;

    private BigDecimal originalPrice;

    private BigDecimal price;

    private Integer stock;

    private Integer sales;

    private String image;

    private String images; // 多个图片，逗号分隔

    private Long categoryId;

    private String brand;

    private Integer status; // 0-下架 1-上架

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    @TableField(exist = false)
    private String categoryName;
}