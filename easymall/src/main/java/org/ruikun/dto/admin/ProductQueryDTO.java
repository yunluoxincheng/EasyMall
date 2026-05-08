package org.ruikun.dto.admin;

import lombok.Data;

/**
 * 商品查询条件 DTO（后台管理）
 */
@Data
public class ProductQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String name;           // 商品名称（模糊搜索）
    private Long categoryId;       // 分类 ID
    private Integer status;        // 上架状态（0=下架，1=上架）
}
