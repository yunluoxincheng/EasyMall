package org.ruikun.enums;

import lombok.Getter;

@Getter
public enum PaymentChannel {

    MOCK("MOCK", "模拟支付"),
    ALIPAY("ALIPAY", "支付宝"),
    WECHAT("WECHAT", "微信支付");

    private final String code;
    private final String description;

    PaymentChannel(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public static PaymentChannel fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (PaymentChannel channel : values()) {
            if (channel.getCode().equals(code)) {
                return channel;
            }
        }
        return null;
    }
}
