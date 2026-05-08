package org.ruikun.vo.admin;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 分类详情 VO（后台管理）
 */
@Data
public class AdminCategoryVO {
    private Long id;
    private String name;
    private String icon;
    private Long parentId;
    private String parentName;
    private Integer level;
    private Integer sort;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
