package org.ruikun.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;



@Data
public class CategoryDTO {
    private Long id;

    @NotBlank(message = "分类名称不能为空")
    private String name;

    private String icon;

    private Long parentId;

    private Integer level;

    private Integer sort;

    @NotNull(message = "状态不能为空")
    private Integer status;
}