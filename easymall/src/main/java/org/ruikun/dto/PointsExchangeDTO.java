package org.ruikun.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 积分兑换DTO
 */
@Data
public class PointsExchangeDTO {

    /**
     * 兑换商品ID
     */
    @NotNull(message = "商品ID不能为空")
    private Long productId;

    /**
     * 收货人姓名
     */
    @NotBlank(message = "收货人姓名不能为空")
    private String receiverName;

    /**
     * 收货人电话
     */
    @NotBlank(message = "收货人电话不能为空")
    private String receiverPhone;

    /**
     * 收货地址
     */
    @NotBlank(message = "收货地址不能为空")
    private String receiverAddress;

    /**
     * 备注
     */
    private String remark;
}
