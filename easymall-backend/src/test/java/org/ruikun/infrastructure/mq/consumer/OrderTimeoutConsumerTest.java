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
import org.ruikun.infrastructure.mq.event.OrderCreatedPayload;
import org.ruikun.modules.order.service.IOrderService;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderTimeoutConsumerTest {

    @Mock private ConsumeLogService consumeLogService;
    @Mock private IOrderService orderService;
    @Mock private Channel channel;

    private ConsumeTemplate consumeTemplate;
    private OrderTimeoutConsumer consumer;

    @BeforeEach
    void setUp() {
        consumeTemplate = new ConsumeTemplate(consumeLogService);
        consumer = new OrderTimeoutConsumer(consumeTemplate, orderService);
    }

    private Message createSerializedMessage(Long orderId) {
        OrderCreatedPayload payload = new OrderCreatedPayload();
        payload.setOrderId(orderId);
        payload.setOrderNo("ORD123");
        payload.setUserId(1L);
        DomainEvent<OrderCreatedPayload> event = DomainEvent.of(
                MqConstants.ORDER_CREATED_EVENT,
                MqConstants.AGGREGATE_TYPE_ORDER,
                orderId, payload);
        byte[] body = JSON.toJSONString(event).getBytes(StandardCharsets.UTF_8);
        return new Message(body, new MessageProperties());
    }

    private Message createMaxRetryMessage(Long orderId) {
        MessageProperties props = new MessageProperties();
        Map<String, Object> xDeathEntry = new HashMap<>();
        xDeathEntry.put("count", MqConstants.MAX_RETRY_COUNT);
        props.getHeaders().put("x-death", java.util.List.of(xDeathEntry));

        OrderCreatedPayload payload = new OrderCreatedPayload();
        payload.setOrderId(orderId);
        payload.setOrderNo("ORD123");
        payload.setUserId(1L);
        DomainEvent<OrderCreatedPayload> event = DomainEvent.of(
                MqConstants.ORDER_CREATED_EVENT,
                MqConstants.AGGREGATE_TYPE_ORDER,
                orderId, payload);
        byte[] body = JSON.toJSONString(event).getBytes(StandardCharsets.UTF_8);
        return new Message(body, props);
    }

    @Nested
    @DisplayName("Order timeout cancellation")
    class TimeoutCancel {

        @Test
        @DisplayName("7.2 Unpaid order is cancelled after timeout")
        void unpaidOrderCancelled() throws Exception {
            when(consumeLogService.tryStart(anyString(), anyString()))
                    .thenReturn(new ConsumeLogService.StartResult("PROCESSING", null));
            when(orderService.cancelOrderByTimeout(1001L)).thenReturn(true);

            consumer.onOrderTimeout(createSerializedMessage(1001L), channel);

            verify(orderService).cancelOrderByTimeout(1001L);
            verify(channel).basicAck(anyLong(), anyBoolean());
        }

        @Test
        @DisplayName("7.3 Paid order ignores delayed close")
        void paidOrderNotCancelled() throws Exception {
            when(consumeLogService.tryStart(anyString(), anyString()))
                    .thenReturn(new ConsumeLogService.StartResult("PROCESSING", null));
            when(orderService.cancelOrderByTimeout(1001L)).thenReturn(false);

            consumer.onOrderTimeout(createSerializedMessage(1001L), channel);

            verify(orderService).cancelOrderByTimeout(1001L);
            verify(channel).basicAck(anyLong(), anyBoolean());
        }

        @Test
        @DisplayName("7.5 Duplicate timeout message is skipped")
        void duplicateMessageSkipped() throws Exception {
            when(consumeLogService.tryStart(anyString(), anyString()))
                    .thenReturn(new ConsumeLogService.StartResult("SUCCESS", null));

            consumer.onOrderTimeout(createSerializedMessage(1001L), channel);

            verify(orderService, never()).cancelOrderByTimeout(anyLong());
            verify(channel).basicAck(anyLong(), anyBoolean());
        }

        @Test
        @DisplayName("7.4 Concurrency: CAS failure means payment won")
        void casFailurePaymentWon() throws Exception {
            when(consumeLogService.tryStart(anyString(), anyString()))
                    .thenReturn(new ConsumeLogService.StartResult("PROCESSING", null));
            when(orderService.cancelOrderByTimeout(1001L)).thenReturn(false);

            consumer.onOrderTimeout(createSerializedMessage(1001L), channel);

            verify(orderService).cancelOrderByTimeout(1001L);
            verify(channel).basicAck(anyLong(), anyBoolean());
        }

        @Test
        @DisplayName("Consumer failure retries with requeue on first attempt")
        void consumerFailureRetries() throws Exception {
            when(consumeLogService.tryStart(anyString(), anyString()))
                    .thenReturn(new ConsumeLogService.StartResult("PROCESSING", null));
            when(orderService.cancelOrderByTimeout(1001L))
                    .thenThrow(new RuntimeException("DB error"));

            consumer.onOrderTimeout(createSerializedMessage(1001L), channel);

            verify(consumeLogService).markFailed(anyString(), anyString());
            verify(channel).basicNack(anyLong(), eq(false), eq(true));
        }

        @Test
        @DisplayName("Max retries exceeded sends to DLQ")
        void maxRetriesExceeded() throws Exception {
            when(consumeLogService.tryStart(anyString(), anyString()))
                    .thenReturn(new ConsumeLogService.StartResult("PROCESSING", null));
            when(orderService.cancelOrderByTimeout(1001L))
                    .thenThrow(new RuntimeException("Persistent error"));

            consumer.onOrderTimeout(createMaxRetryMessage(1001L), channel);

            verify(consumeLogService).markFailed(anyString(), anyString());
            verify(channel).basicReject(anyLong(), eq(false));
        }
    }
}
