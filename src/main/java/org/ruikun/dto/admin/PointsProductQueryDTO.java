package org.ruikun.dto.admin;

import lombok.Data;

/**
 * 积分兑换商品查询条件 DTO（后台管理）
 */
@Data
public class PointsProductQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String name;           // 商品名称（模糊搜索）
    private Integer status;        // 上架状态（0=下架，1=上架）
}
