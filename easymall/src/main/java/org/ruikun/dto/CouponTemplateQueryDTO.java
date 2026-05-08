package org.ruikun.dto;

import lombok.Data;

/**
 * 优惠券模板查询 DTO（管理员查询）
 */
@Data
public class CouponTemplateQueryDTO {

    /**
     * 优惠券名称（模糊查询）
     */
    private String name;

    /**
     * 优惠券类型
     */
    private Integer type;

    /**
     * 状态 0-下架 1-上架
     */
    private Integer status;

    /**
     * 页码
     */
    private Integer pageNum = 1;

    /**
     * 页大小
     */
    private Integer pageSize = 10;
}
