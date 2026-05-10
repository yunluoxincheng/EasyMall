package org.ruikun.modules.payment.service;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import lombok.RequiredArgsConstructor;
import org.ruikun.modules.payment.entity.PaymentCallbackLog;
import org.ruikun.modules.payment.mapper.PaymentCallbackLogMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentCallbackLogServiceImpl implements IPaymentCallbackLogService {

    private final PaymentCallbackLogMapper paymentCallbackLogMapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public Long saveLog(String paymentNo, String channel, String callbackRaw, String result) {
        PaymentCallbackLog log = new PaymentCallbackLog();
        log.setPaymentNo(paymentNo);
        log.setChannel(channel);
        log.setCallbackRaw(callbackRaw);
        log.setResult(result);
        paymentCallbackLogMapper.insert(log);
        return log.getId();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void updateResult(Long logId, String result) {
        paymentCallbackLogMapper.update(null,
                new LambdaUpdateWrapper<PaymentCallbackLog>()
                        .eq(PaymentCallbackLog::getId, logId)
                        .set(PaymentCallbackLog::getResult, result)
        );
    }
}
