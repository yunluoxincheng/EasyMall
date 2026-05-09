package org.ruikun.modules.inventory.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("inventory_log")
public class InventoryLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long productId;

    private Long orderId;

    private String changeType;

    private Integer changeQuantity;

    private Integer beforeAvailable;

    private Integer afterAvailable;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
