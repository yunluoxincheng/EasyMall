package org.ruikun.service.impl;

import lombok.RequiredArgsConstructor;
import org.ruikun.service.IMemberService;
import org.ruikun.service.IPriceService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 价格计算服务实现类
 */
@Service
@RequiredArgsConstructor
public class PriceServiceImpl implements IPriceService {

    private final IMemberService memberService;

    @Override
    public BigDecimal calculateMemberDiscountPrice(Long userId, BigDecimal originalPrice) {
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return originalPrice;
        }

        Double discountRate = getMemberDiscountRate(userId);

        // 计算折后价格（保留2位小数，四舍五入）
        return originalPrice.multiply(BigDecimal.valueOf(discountRate))
                            .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public Double getMemberDiscountRate(Long userId) {
        try {
            return memberService.getMemberDiscount(userId);
        } catch (Exception e) {
            // 如果获取会员折扣失败，返回无折扣
            return 1.0;
        }
    }

    @Override
    public BigDecimal applyMemberDiscountToOrder(Long userId, BigDecimal totalAmount) {
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return totalAmount;
        }

        return calculateMemberDiscountPrice(userId, totalAmount);
    }
}
