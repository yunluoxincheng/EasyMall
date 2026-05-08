package org.ruikun.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分兑换记录VO
 */
@Data
public class PointsExchangeVO {
    /**
     * 兑换记录ID
     */
    private Long id;

    /**
     * 兑换单号
     */
    private String exchangeNo;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * 商品名称
     */
    private String productName;

    /**
     * 使用的积分
     */
    private Integer pointsUsed;

    /**
     * 状态
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusText;

    /**
     * 收货人姓名
     */
    private String receiverName;

    /**
     * 收货人电话
     */
    private String receiverPhone;

    /**
     * 收货地址
     */
    private String receiverAddress;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}
