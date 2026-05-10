package org.ruikun.infrastructure.mq.consumer;

import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.infrastructure.mq.DomainEvent;
import org.ruikun.infrastructure.mq.MessageDeserializer;
import org.ruikun.infrastructure.mq.MqConstants;
import org.ruikun.infrastructure.mq.consumelog.ConsumeTemplate;
import org.ruikun.infrastructure.mq.event.ProductChangedPayload;
import org.ruikun.modules.product.service.ProductCacheService;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductCacheInvalidationConsumer {

    private final ConsumeTemplate consumeTemplate;
    private final ProductCacheService productCacheService;

    @RabbitListener(queues = MqConstants.PRODUCT_CHANGED_QUEUE)
    public void onProductChanged(Message message, Channel channel) throws Exception {
        DomainEvent<ProductChangedPayload> event =
                MessageDeserializer.deserialize(message, ProductChangedPayload.class);

        log.info("Received product changed event: messageId={}, productId={}, changeType={}",
                event.getMessageId(),
                event.getData().getProductId(),
                event.getData().getChangeType());

        consumeTemplate.consume(message, channel, event, payload -> {
            productCacheService.invalidateAll(payload.getProductId());
            log.info("Invalidated caches for product {}", payload.getProductId());
        });
    }
}
