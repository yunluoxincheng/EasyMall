package org.ruikun.infrastructure.mq.consumer;

import com.rabbitmq.client.Channel;
import com.alibaba.fastjson2.JSON;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.infrastructure.mq.DomainEvent;
import org.ruikun.infrastructure.mq.MqConstants;
import org.ruikun.infrastructure.mq.consumelog.ConsumeLogService;
import org.ruikun.infrastructure.mq.consumelog.ConsumeTemplate;
import org.ruikun.infrastructure.mq.event.OrderCompletedPayload;
import org.ruikun.modules.points.service.IPointsService;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.dao.DuplicateKeyException;

import java.nio.charset.StandardCharsets;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderCompletedPointsConsumerTest {

    @Mock private ConsumeLogService consumeLogService;
    @Mock private IPointsService pointsService;
    @Mock private Channel channel;

    private ConsumeTemplate consumeTemplate;
    private OrderCompletedPointsConsumer consumer;

    @BeforeEach
    void setUp() {
        consumeTemplate = new ConsumeTemplate(consumeLogService);
        consumer = new OrderCompletedPointsConsumer(consumeTemplate, pointsService);
    }

    private Message createSerializedMessage(Long orderId, Long userId, Double amount) {
        OrderCompletedPayload payload = new OrderCompletedPayload();
        payload.setOrderId(orderId);
        payload.setUserId(userId);
        payload.setPayAmount(amount);
        DomainEvent<OrderCompletedPayload> event = DomainEvent.of(
                MqConstants.ORDER_COMPLETED_EVENT,
                MqConstants.AGGREGATE_TYPE_ORDER,
                orderId, payload);
        byte[] body = JSON.toJSONString(event).getBytes(StandardCharsets.UTF_8);
        return new Message(body, new MessageProperties());
    }

    @Nested
    @DisplayName("Async points issuing")
    class PointsIssuing {

        @Test
        @DisplayName("Issues points on first event")
        void issuesPointsOnFirstEvent() throws Exception {
            when(consumeLogService.tryStart(anyString(), anyString()))
                    .thenReturn(new ConsumeLogService.StartResult("PROCESSING", null));

            consumer.onOrderCompleted(createSerializedMessage(1001L, 1L, 199.0), channel);

            verify(pointsService).addPointsForOrder(1L, 1001L, 199.0);
            verify(channel).basicAck(anyLong(), anyBoolean());
        }

        @Test
        @DisplayName("Duplicate event (already consumed) does not issue points twice")
        void duplicateEventSkips() throws Exception {
            when(consumeLogService.tryStart(anyString(), anyString()))
                    .thenReturn(new ConsumeLogService.StartResult("SUCCESS", null));

            consumer.onOrderCompleted(createSerializedMessage(1001L, 1L, 199.0), channel);

            verify(pointsService, never()).addPointsForOrder(anyLong(), anyLong(), anyDouble());
            verify(channel).basicAck(anyLong(), anyBoolean());
        }

        @Test
        @DisplayName("6.6 Duplicate key exception from unique constraint is treated as idempotent success")
        void duplicateKeyHandledAsIdempotentSuccess() throws Exception {
            when(consumeLogService.tryStart(anyString(), anyString()))
                    .thenReturn(new ConsumeLogService.StartResult("PROCESSING", null));
            doThrow(new DuplicateKeyException("uk_biz"))
                    .when(pointsService).addPointsForOrder(anyLong(), anyLong(), anyDouble());

            consumer.onOrderCompleted(createSerializedMessage(1001L, 1L, 199.0), channel);

            verify(channel).basicAck(anyLong(), anyBoolean());
        }
    }
}
