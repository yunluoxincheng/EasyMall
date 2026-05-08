package org.ruikun.service;

import java.math.BigDecimal;

/**
 * 价格计算服务接口
 */
public interface IPriceService {

    /**
     * 计算商品的会员折扣价
     *
     * @param userId 用户ID
     * @param originalPrice 原价
     * @return 折后价格
     */
    BigDecimal calculateMemberDiscountPrice(Long userId, BigDecimal originalPrice);

    /**
     * 获取用户折扣率
     *
     * @param userId 用户ID
     * @return 折扣率（例如：0.85表示85折）
     */
    Double getMemberDiscountRate(Long userId);

    /**
     * 应用会员折扣到订单总金额
     *
     * @param userId 用户ID
     * @param totalAmount 订单总金额
     * @return 折后金额
     */
    BigDecimal applyMemberDiscountToOrder(Long userId, BigDecimal totalAmount);
}
