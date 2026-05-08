package org.ruikun.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 分类保存 DTO（后台管理）
 */
@Data
public class CategorySaveDTO {
    /** 分类名称 */
    @NotBlank(message = "分类名称不能为空")
    private String name;

    /** 图标 */
    private String icon;

    /** 父分类ID */
    private Long parentId;

    /** 级别 */
    @NotNull(message = "级别不能为空")
    private Integer level;

    /** 排序 */
    private Integer sort;

    /** 状态 */
    @NotNull(message = "状态不能为空")
    private Integer status;
}
