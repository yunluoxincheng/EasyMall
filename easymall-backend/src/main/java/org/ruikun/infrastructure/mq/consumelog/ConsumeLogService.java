package org.ruikun.infrastructure.mq.consumelog;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsumeLogService {

    private final MessageConsumeLogMapper consumeLogMapper;

    /**
     * Attempt to start consuming a message. Returns:
     * - a new PROCESSING record if this is the first consumption attempt
     * - an existing SUCCESS record if the message was already consumed successfully
     * - an existing FAILED record if the message previously failed
     * - null if another consumer is currently processing
     */
    public StartResult tryStart(String messageId, String eventType) {
        MessageConsumeLog existing = consumeLogMapper.selectOne(
                new LambdaQueryWrapper<MessageConsumeLog>()
                        .eq(MessageConsumeLog::getMessageId, messageId));

        if (existing != null) {
            return new StartResult(existing.getStatus(), existing);
        }

        MessageConsumeLog record = new MessageConsumeLog();
        record.setMessageId(messageId);
        record.setEventType(eventType);
        record.setStatus(MessageConsumeLog.STATUS_PROCESSING);

        try {
            consumeLogMapper.insert(record);
            return new StartResult(MessageConsumeLog.STATUS_PROCESSING, record);
        } catch (DuplicateKeyException e) {
            existing = consumeLogMapper.selectOne(
                    new LambdaQueryWrapper<MessageConsumeLog>()
                            .eq(MessageConsumeLog::getMessageId, messageId));
            return existing != null
                    ? new StartResult(existing.getStatus(), existing)
                    : new StartResult(MessageConsumeLog.STATUS_PROCESSING, null);
        }
    }

    public void markSuccess(String messageId) {
        consumeLogMapper.update(null,
                new LambdaUpdateWrapper<MessageConsumeLog>()
                        .eq(MessageConsumeLog::getMessageId, messageId)
                        .set(MessageConsumeLog::getStatus, MessageConsumeLog.STATUS_SUCCESS));
    }

    public void markFailed(String messageId, String errorMessage) {
        consumeLogMapper.update(null,
                new LambdaUpdateWrapper<MessageConsumeLog>()
                        .eq(MessageConsumeLog::getMessageId, messageId)
                        .set(MessageConsumeLog::getStatus, MessageConsumeLog.STATUS_FAILED)
                        .set(MessageConsumeLog::getErrorMessage, errorMessage));
    }

    public record StartResult(String status, MessageConsumeLog record) {
        public boolean alreadySuccess() {
            return MessageConsumeLog.STATUS_SUCCESS.equals(status);
        }

        public boolean isProcessing() {
            return MessageConsumeLog.STATUS_PROCESSING.equals(status);
        }

        public boolean isFailed() {
            return MessageConsumeLog.STATUS_FAILED.equals(status);
        }
    }
}
