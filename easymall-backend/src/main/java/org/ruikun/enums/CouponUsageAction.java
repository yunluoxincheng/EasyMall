package org.ruikun.enums;

import lombok.Getter;

/**
 * 优惠券生命周期操作枚举
 */
@Getter
public enum CouponUsageAction {

    /**
     * 确认使用，保留历史 1-使用 语义
     */
    CONFIRM_USED(1, "确认使用"),

    /**
     * 返还，保留历史 2-返还 语义
     */
    RETURN(2, "返还"),

    /**
     * 锁定
     */
    LOCK(3, "锁定"),

    /**
     * 过期
     */
    EXPIRE(4, "过期"),

    /**
     * 失效
     */
    INVALIDATE(5, "失效");

    private final Integer code;
    private final String desc;

    CouponUsageAction(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static CouponUsageAction getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (CouponUsageAction action : values()) {
            if (action.getCode().equals(code)) {
                return action;
            }
        }
        return null;
    }
}
