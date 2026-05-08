package org.ruikun.vo.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单列表项 VO（后台管理）
 */
@Data
public class AdminOrderPageVO {
    private Long id;
    private String orderNo;
    private Long userId;
    private String username;
    private String nickname;
    private BigDecimal totalAmount;
    private BigDecimal payAmount;
    private Integer status;
    private String paymentMethod;
    private LocalDateTime createTime;
}
