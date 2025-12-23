package org.ruikun.vo.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单详情 VO（后台管理）
 */
@Data
public class AdminOrderVO {
    private Long id;
    private String orderNo;
    private Long userId;
    private String username;
    private String nickname;
    private String phone;
    private BigDecimal totalAmount;
    private BigDecimal payAmount;
    private Integer status;
    private String paymentMethod;
    private LocalDateTime payTime;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    private List<OrderItemVO> items;

    @Data
    public static class OrderItemVO {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal subtotal;
    }
}
