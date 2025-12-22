package org.ruikun.enums;

import lombok.Getter;

/**
 * 积分类型枚举
 */
@Getter
public enum PointsTypeEnum {
    ORDER(1, "订单获得"),
    COMMENT(2, "评价获得"),
    SIGN(3, "签到获得"),
    SYSTEM(4, "系统赠送"),
    EXCHANGE(5, "兑换消耗"),
    REFUND(6, "退款扣除");

    private final Integer code;
    private final String desc;

    PointsTypeEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static PointsTypeEnum getByCode(Integer code) {
        for (PointsTypeEnum typeEnum : values()) {
            if (typeEnum.code.equals(code)) {
                return typeEnum;
            }
        }
        return null;
    }
}
