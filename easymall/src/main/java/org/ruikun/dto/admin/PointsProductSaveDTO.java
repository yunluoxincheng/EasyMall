package org.ruikun.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 积分兑换商品保存 DTO（后台管理）
 */
@Data
public class PointsProductSaveDTO {
    @NotBlank(message = "商品名称不能为空")
    private String name;

    private String description;

    private String image;

    @NotNull(message = "所需积分不能为空")
    @Min(value = 1, message = "所需积分必须大于0")
    private Integer pointsRequired;

    @NotNull(message = "库存不能为空")
    @Min(value = 0, message = "库存不能为负数")
    private Integer stock;

    private Integer sortOrder;
}
