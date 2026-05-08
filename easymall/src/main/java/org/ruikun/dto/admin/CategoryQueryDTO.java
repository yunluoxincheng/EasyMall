package org.ruikun.dto.admin;

import lombok.Data;

/**
 * 分类查询 DTO（后台管理）
 */
@Data
public class CategoryQueryDTO {
    /** 页码 */
    private Integer pageNum = 1;

    /** 页大小 */
    private Integer pageSize = 10;

    /** 分类名称 */
    private String name;

    /** 父分类ID */
    private Long parentId;

    /** 级别 */
    private Integer level;

    /** 状态 */
    private Integer status;
}
