package org.ruikun.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 商品保存 DTO（后台管理）
 */
@Data
public class ProductSaveDTO {
    @NotBlank(message = "商品名称不能为空")
    private String name;

    private String subtitle;

    private String description;

    @DecimalMin(value = "0", message = "原价不能为负数")
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
}
