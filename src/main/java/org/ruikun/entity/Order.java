package org.ruikun.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("orders")
public class Order {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long userId;

    private BigDecimal totalAmount;

    private BigDecimal payAmount;

    private Integer status; // 0-待支付 1-已支付 2-已发货 3-已完成 4-已取消

    /**
     * 使用的用户优惠券ID
     */
    private Long userCouponId;

    /**
     * 优惠券优惠金额
     */
    private BigDecimal couponDiscount;

    private String paymentMethod;

    private LocalDateTime payTime;

    private String receiverName;

    private String receiverPhone;

    private String receiverAddress;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;
}