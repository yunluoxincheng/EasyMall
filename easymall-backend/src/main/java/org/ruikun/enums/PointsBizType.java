package org.ruikun.enums;

import lombok.Getter;

/**
 * 积分业务类型枚举 — 用于幂等标识和流水追踪
 */
@Getter
public enum PointsBizType {
    ORDER_COMPLETED("订单完成获得积分", "{orderId}"),
    COMMENT_CREATED("评价获得积分", "comment:{orderId}:{productId}"),
    DAILY_SIGN_IN("签到获得积分", "sign:{userId}:{yyyy-MM-dd}"),
    POINTS_EXCHANGE("兑换消耗积分", "exchange:{exchangeNo}"),
    ADMIN_ADJUST("管理员手动调整", "admin:{UUID}"),
    REFUND_DEDUCT("退款扣除积分", "refund:{orderId}");

    private final String description;
    private final String bizIdFormat;

    PointsBizType(String description, String bizIdFormat) {
        this.description = description;
        this.bizIdFormat = bizIdFormat;
    }
}
