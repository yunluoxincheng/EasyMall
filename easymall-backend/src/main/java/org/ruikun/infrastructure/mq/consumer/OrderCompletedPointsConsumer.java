package org.ruikun.infrastructure.mq.consumer;

import com.rabbitmq.client.Channel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.enums.PointsTypeEnum;
import org.ruikun.infrastructure.mq.DomainEvent;
import org.ruikun.infrastructure.mq.MessageDeserializer;
import org.ruikun.infrastructure.mq.MqConstants;
import org.ruikun.infrastructure.mq.consumelog.ConsumeTemplate;
import org.ruikun.infrastructure.mq.event.OrderCompletedPayload;
import org.ruikun.modules.points.entity.PointsRecord;
import org.ruikun.modules.points.mapper.PointsRecordMapper;
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
    private final PointsRecordMapper pointsRecordMapper;

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

            // Business idempotency: check idempotency key
            String idempotencyKey = "order_points:" + orderId;
            Long existing = pointsRecordMapper.selectCount(
                    new LambdaQueryWrapper<PointsRecord>()
                            .eq(PointsRecord::getIdempotencyKey, idempotencyKey));
            if (existing != null && existing > 0) {
                log.info("Points already issued for order {}, skipping", orderId);
                return;
            }

            try {
                pointsService.addPointsForOrder(userId, orderId, payAmount);
            } catch (DuplicateKeyException e) {
                log.info("Duplicate points issue prevented by unique constraint for order {}", orderId);
            }
        });
    }
}
