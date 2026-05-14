package org.ruikun.infrastructure.mq.consumer;

import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.infrastructure.mq.DomainEvent;
import org.ruikun.infrastructure.mq.MessageDeserializer;
import org.ruikun.infrastructure.mq.MqConstants;
import org.ruikun.infrastructure.mq.consumelog.ConsumeTemplate;
import org.ruikun.infrastructure.mq.event.OrderCompletedPayload;
import org.ruikun.modules.points.service.IPointsService;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCompletedPointsConsumer {

    private final ConsumeTemplate consumeTemplate;
    private final IPointsService pointsService;

    @RabbitListener(queues = MqConstants.ORDER_COMPLETED_QUEUE)
    public void onOrderCompleted(Message message, Channel channel) throws Exception {
        DomainEvent<OrderCompletedPayload> event =
                MessageDeserializer.deserialize(message, OrderCompletedPayload.class);

        log.info("Received order completed event: messageId={}, orderId={}",
                event.getMessageId(), event.getData().getOrderId());

        consumeTemplate.consume(message, channel, event, payload -> {
            Long orderId = payload.getOrderId();
            Long userId = payload.getUserId();
            Double payAmount = payload.getPayAmount();

            try {
                pointsService.addPointsForOrder(userId, orderId, payAmount);
            } catch (DuplicateKeyException e) {
                log.info("Duplicate points issue prevented by unique constraint for order {}", orderId);
            }
        });
    }
}
