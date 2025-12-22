package org.ruikun.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CategoryVO {
    private Long id;
    private String name;
    private String icon;
    private Long parentId;
    private Integer level;
    private Integer sort;
    private Integer status;
    private LocalDateTime createTime;
    private List<CategoryVO> children;
}