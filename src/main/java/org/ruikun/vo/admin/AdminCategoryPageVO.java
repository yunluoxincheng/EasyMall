package org.ruikun.vo.admin;

import lombok.Data;

/**
 * 分类分页 VO（后台管理）
 */
@Data
public class AdminCategoryPageVO {
    private Long id;
    private String name;
    private String icon;
    private Long parentId;
    private String parentName;
    private Integer level;
    private Integer sort;
    private Integer status;
}
