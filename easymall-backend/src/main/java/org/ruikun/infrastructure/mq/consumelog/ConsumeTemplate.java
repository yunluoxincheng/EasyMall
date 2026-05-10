package org.ruikun.infrastructure.mq.consumelog;

import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.infrastructure.mq.DomainEvent;
import org.ruikun.infrastructure.mq.MqConstants;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.function.Consumer;

@Slf4j
@Component
@RequiredArgsConstructor
public class ConsumeTemplate {

    private final ConsumeLogService consumeLogService;

    public <T> void consume(Message message, Channel channel,
                            DomainEvent<T> event,
                            Consumer<T> businessLogic) throws IOException {
        String messageId = event.getMessageId();
        String eventType = event.getEventType();
        long deliveryTag = message.getMessageProperties().getDeliveryTag();

        ConsumeLogService.StartResult startResult =
                consumeLogService.tryStart(messageId, eventType);

        if (startResult.alreadySuccess()) {
            log.info("Duplicate successful message skipped: messageId={}, eventType={}",
                    messageId, eventType);
            channel.basicAck(deliveryTag, false);
            return;
        }

        if (!startResult.isProcessing() && !startResult.isFailed()) {
            log.warn("Message in unexpected state, skipping: messageId={}, status={}",
                    messageId, startResult.status());
            channel.basicAck(deliveryTag, false);
            return;
        }

        try {
            businessLogic.accept(event.getData());
            consumeLogService.markSuccess(messageId);
            channel.basicAck(deliveryTag, false);
            log.info("Message consumed successfully: messageId={}, eventType={}",
                    messageId, eventType);
        } catch (Exception e) {
            log.error("Message consumption failed: messageId={}, eventType={}, error={}",
                    messageId, eventType, e.getMessage(), e);
            consumeLogService.markFailed(messageId, truncate(e.getMessage(), 2000));

            int retryCount = getRetryCount(message);
            if (retryCount < MqConstants.MAX_RETRY_COUNT) {
                // Requeue for retry
                log.info("Retrying message: messageId={}, retryCount={}/{}",
                        messageId, retryCount + 1, MqConstants.MAX_RETRY_COUNT);
                channel.basicNack(deliveryTag, false, true);
            } else {
                // Max retries exceeded, reject to DLQ
                log.warn("Max retries exceeded, sending to DLQ: messageId={}, eventType={}",
                        messageId, eventType);
                channel.basicReject(deliveryTag, false);
            }
        }
    }

    private int getRetryCount(Message message) {
        MessageProperties props = message.getMessageProperties();
        if (props == null) return 0;
        Map<String, Object> headers = props.getHeaders();
        if (headers == null) return 0;
        Object count = headers.get(MqConstants.HEADER_X_RETRY_COUNT);
        if (count instanceof Number) return ((Number) count).intValue();
        if (count instanceof String) {
            try { return Integer.parseInt((String) count); } catch (NumberFormatException e) { return 0; }
        }
        // Check x-death header from DLX re-delivery
        Object xDeath = headers.get("x-death");
        if (xDeath instanceof java.util.List<?> list && !list.isEmpty()) {
            Object first = list.get(0);
            if (first instanceof java.util.Map<?, ?> map) {
                Object count2 = map.get("count");
                if (count2 instanceof Number) return ((Number) count2).intValue();
            }
        }
        return 0;
    }

    private static String truncate(String s, int maxLen) {
        if (s == null) return null;
        return s.length() <= maxLen ? s : s.substring(0, maxLen);
    }
}
