package org.ruikun.dto.admin;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 订单查询条件 DTO（后台管理）
 */
@Data
public class OrderQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String orderNo;        // 订单号
    private Long userId;           // 用户 ID
    private Integer status;        // 订单状态
    private LocalDateTime startTime; // 开始时间
    private LocalDateTime endTime;   // 结束时间
}
