package org.ruikun.enums;

import lombok.Getter;

/**
 * 优惠券状态枚举
 */
@Getter
public enum CouponStatus {

    /**
     * 未使用
     */
    UNUSED(0, "未使用"),

    /**
     * 已使用
     */
    USED(1, "已使用"),

    /**
     * 已过期
     */
    EXPIRED(2, "已过期");

    private final Integer code;
    private final String desc;

    CouponStatus(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static CouponStatus getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (CouponStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
