package org.ruikun.enums;

import lombok.Getter;

/**
 * 优惠券类型枚举
 */
@Getter
public enum CouponType {

    /**
     * 固定金额券
     */
    FIXED_AMOUNT(1, "固定金额券"),

    /**
     * 百分比折扣券
     */
    PERCENTAGE(2, "百分比折扣券"),

    /**
     * 新人专享券
     */
    NEWCOMER(3, "新人专享券"),

    /**
     * 会员专属券
     */
    MEMBER_EXCLUSIVE(4, "会员专属券");

    private final Integer code;
    private final String desc;

    CouponType(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static CouponType getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (CouponType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}
