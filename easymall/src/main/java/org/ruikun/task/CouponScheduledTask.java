package org.ruikun.task;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.service.ICouponService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 优惠券定时任务
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CouponScheduledTask {

    private final ICouponService couponService;

    /**
     * 优惠券过期检查任务
     * 每5分钟执行一次
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void updateExpiredCoupons() {
        try {
            log.debug("开始执行优惠券过期检查任务");
            couponService.updateExpiredCoupons();
            log.debug("优惠券过期检查任务执行完成");
        } catch (Exception e) {
            log.error("优惠券过期检查任务执行失败", e);
        }
    }
}
