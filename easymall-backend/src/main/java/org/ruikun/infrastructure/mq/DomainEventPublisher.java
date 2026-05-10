package org.ruikun.infrastructure.mq;

import com.alibaba.fastjson2.JSON;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageBuilder;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class DomainEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishAfterCommit(String exchange, String routingKey, Object event) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    doPublish(exchange, routingKey, event);
                }
            });
        } else {
            doPublish(exchange, routingKey, event);
        }
    }

    public void publish(String exchange, String routingKey, Object event) {
        doPublish(exchange, routingKey, event);
    }

    public void publishDelayedAfterCommit(String exchange, String routingKey, Object event,
                                          long expirationMillis) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    doPublishDelayed(exchange, routingKey, event, expirationMillis);
                }
            });
        } else {
            doPublishDelayed(exchange, routingKey, event, expirationMillis);
        }
    }

    private void doPublish(String exchange, String routingKey, Object event) {
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, event);
            log.info("Published event to exchange={}, routingKey={}, event={}",
                    exchange, routingKey, event.getClass().getSimpleName());
        } catch (Exception e) {
            log.error("Failed to publish event to exchange={}, routingKey={}: {}",
                    exchange, routingKey, e.getMessage(), e);
        }
    }

    private void doPublishDelayed(String exchange, String routingKey, Object event,
                                  long expirationMillis) {
        try {
            byte[] body = JSON.toJSONString(event)
                    .getBytes(StandardCharsets.UTF_8);
            MessageProperties props = new MessageProperties();
            props.setContentType("application/json");
            props.setContentEncoding("UTF-8");
            props.setExpiration(String.valueOf(expirationMillis));
            // pass event type for deserialization
            if (event instanceof DomainEvent<?> de) {
                props.setHeader("__TypeId__", de.getEventType());
            }
            Message message = MessageBuilder.withBody(body).andProperties(props).build();
            rabbitTemplate.send(exchange, routingKey, message);
            log.info("Published delayed event to exchange={}, routingKey={}, expiration={}ms",
                    exchange, routingKey, expirationMillis);
        } catch (Exception e) {
            log.error("Failed to publish delayed event to exchange={}, routingKey={}: {}",
                    exchange, routingKey, e.getMessage(), e);
        }
    }
}
