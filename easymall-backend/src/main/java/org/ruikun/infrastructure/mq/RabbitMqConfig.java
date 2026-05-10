package org.ruikun.infrastructure.mq;

import com.alibaba.fastjson2.JSON;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.AbstractMessageConverter;
import org.springframework.amqp.support.converter.MessageConversionException;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.ruikun.infrastructure.mq.MqConstants.*;

@Configuration
public class RabbitMqConfig {

    @Value("${easymall.order.timeout-minutes:30}")
    private int orderTimeoutMinutes;

    // --- Exchanges ---

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE, true, false);
    }

    @Bean
    public TopicExchange productExchange() {
        return new TopicExchange(PRODUCT_EXCHANGE, true, false);
    }

    @Bean
    public DirectExchange orderDlx() {
        return new DirectExchange(ORDER_DLX, true, false);
    }

    @Bean
    public DirectExchange consumerDlx() {
        return new DirectExchange(CONSUMER_DLX, true, false);
    }

    // --- Delay Queue (TTL + DLX for order timeout) ---

    @Bean
    public Queue orderTimeoutDelayQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", ORDER_DLX);
        args.put("x-dead-letter-routing-key", ORDER_TIMEOUT_ROUTING_KEY);
        return QueueBuilder.durable(ORDER_TIMEOUT_DELAY_QUEUE).withArguments(args).build();
    }

    // --- Consumer Queues (with DLX for retry/DLQ) ---

    @Bean
    public Queue orderTimeoutQueue() {
        return QueueBuilder.durable(ORDER_TIMEOUT_QUEUE)
                .withArgument("x-dead-letter-exchange", CONSUMER_DLX)
                .withArgument("x-dead-letter-routing-key", ORDER_TIMEOUT_QUEUE)
                .build();
    }

    @Bean
    public Queue orderCompletedQueue() {
        return QueueBuilder.durable(ORDER_COMPLETED_QUEUE)
                .withArgument("x-dead-letter-exchange", CONSUMER_DLX)
                .withArgument("x-dead-letter-routing-key", ORDER_COMPLETED_QUEUE)
                .build();
    }

    @Bean
    public Queue productChangedQueue() {
        return QueueBuilder.durable(PRODUCT_CHANGED_QUEUE)
                .withArgument("x-dead-letter-exchange", CONSUMER_DLX)
                .withArgument("x-dead-letter-routing-key", PRODUCT_CHANGED_QUEUE)
                .build();
    }

    // --- Dead-Letter Queues ---

    @Bean
    public Queue orderTimeoutDlq() {
        return QueueBuilder.durable(ORDER_TIMEOUT_DLQ).build();
    }

    @Bean
    public Queue orderCompletedDlq() {
        return QueueBuilder.durable(ORDER_COMPLETED_DLQ).build();
    }

    @Bean
    public Queue productChangedDlq() {
        return QueueBuilder.durable(PRODUCT_CHANGED_DLQ).build();
    }

    // --- Bindings ---

    @Bean
    public Binding orderTimeoutDelayBinding() {
        return BindingBuilder.bind(orderTimeoutDelayQueue())
                .to(orderExchange())
                .with(ORDER_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding orderTimeoutDlxBinding() {
        return BindingBuilder.bind(orderTimeoutQueue())
                .to(orderDlx())
                .with(ORDER_TIMEOUT_ROUTING_KEY);
    }

    @Bean
    public Binding orderCompletedBinding() {
        return BindingBuilder.bind(orderCompletedQueue())
                .to(orderExchange())
                .with(ORDER_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding productChangedBinding() {
        return BindingBuilder.bind(productChangedQueue())
                .to(productExchange())
                .with(PRODUCT_CHANGED_ROUTING_KEY);
    }

    // DLQ bindings
    @Bean
    public Binding orderTimeoutDlqBinding() {
        return BindingBuilder.bind(orderTimeoutDlq())
                .to(consumerDlx())
                .with(ORDER_TIMEOUT_QUEUE);
    }

    @Bean
    public Binding orderCompletedDlqBinding() {
        return BindingBuilder.bind(orderCompletedDlq())
                .to(consumerDlx())
                .with(ORDER_COMPLETED_QUEUE);
    }

    @Bean
    public Binding productChangedDlqBinding() {
        return BindingBuilder.bind(productChangedDlq())
                .to(consumerDlx())
                .with(PRODUCT_CHANGED_QUEUE);
    }

    // --- JSON Message Converter (for outbound only) ---

    @Bean
    public MessageConverter fastJsonMessageConverter() {
        return new AbstractMessageConverter() {
            @Override
            protected Message createMessage(Object object,
                                            org.springframework.amqp.core.MessageProperties messageProperties) {
                byte[] bytes = JSON.toJSONString(object)
                        .getBytes(StandardCharsets.UTF_8);
                messageProperties.setContentType("application/json");
                messageProperties.setContentEncoding("UTF-8");
                messageProperties.setContentLength(bytes.length);
                return new Message(bytes, messageProperties);
            }

            @Override
            public Object fromMessage(Message message) throws MessageConversionException {
                return message;
            }
        };
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter fastJsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(fastJsonMessageConverter);
        return template;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter fastJsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(fastJsonMessageConverter);
        factory.setAcknowledgeMode(org.springframework.amqp.core.AcknowledgeMode.MANUAL);
        factory.setPrefetchCount(10);
        return factory;
    }

    public int getOrderTimeoutMinutes() {
        return orderTimeoutMinutes;
    }
}
