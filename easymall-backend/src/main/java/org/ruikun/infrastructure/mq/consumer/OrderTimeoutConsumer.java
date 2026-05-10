package org.ruikun.infrastructure.mq.consumer;

import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.infrastructure.mq.DomainEvent;
import org.ruikun.infrastructure.mq.MessageDeserializer;
import org.ruikun.infrastructure.mq.MqConstants;
import org.ruikun.infrastructure.mq.consumelog.ConsumeTemplate;
import org.ruikun.infrastructure.mq.event.OrderCreatedPayload;
import org.ruikun.modules.order.service.IOrderService;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderTimeoutConsumer {

    private final ConsumeTemplate consumeTemplate;
    private final IOrderService orderService;

    @RabbitListener(queues = MqConstants.ORDER_TIMEOUT_QUEUE)
    public void onOrderTimeout(Message message, Channel channel) throws Exception {
        DomainEvent<OrderCreatedPayload> event =
                MessageDeserializer.deserialize(message, OrderCreatedPayload.class);

        log.info("Received order timeout message: messageId={}, orderId={}",
                event.getMessageId(), event.getData().getOrderId());

        consumeTemplate.consume(message, channel, event, payload -> {
            boolean cancelled = orderService.cancelOrderByTimeout(payload.getOrderId());
            if (!cancelled) {
                log.info("Order {} not cancelled by timeout (already paid or status changed)",
                        payload.getOrderId());
            }
        });
    }
}
