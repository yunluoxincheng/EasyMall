package org.ruikun.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


import java.math.BigDecimal;

@Data
public class ProductDTO {
    private Long id;

    @NotBlank(message = "商品名称不能为空")
    private String name;

    private String subtitle;

    private String description;

    @DecimalMin(value = "0.01", message = "原价必须大于0")
    private BigDecimal originalPrice;

    @DecimalMin(value = "0.01", message = "售价必须大于0")
    private BigDecimal price;

    @NotNull(message = "库存不能为空")
    private Integer stock;

    private String image;

    private String images;

    @NotNull(message = "商品分类不能为空")
    private Long categoryId;

    private String brand;

    @NotNull(message = "状态不能为空")
    private Integer status;
}