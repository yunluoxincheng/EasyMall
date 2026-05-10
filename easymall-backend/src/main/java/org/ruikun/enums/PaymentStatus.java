package org.ruikun.enums;

import lombok.Getter;

@Getter
public enum PaymentStatus {

    WAITING_PAY("WAITING_PAY", "待支付"),
    PAYING("PAYING", "支付中"),
    PAID("PAID", "已支付"),
    CLOSED("CLOSED", "已关闭"),
    FAILED("FAILED", "支付失败");

    private final String code;
    private final String description;

    PaymentStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public static PaymentStatus fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (PaymentStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
