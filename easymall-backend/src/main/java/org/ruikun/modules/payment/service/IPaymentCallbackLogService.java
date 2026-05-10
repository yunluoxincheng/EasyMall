package org.ruikun.modules.payment.service;

public interface IPaymentCallbackLogService {

    Long saveLog(String paymentNo, String channel, String callbackRaw, String result);

    void updateResult(Long logId, String result);
}
