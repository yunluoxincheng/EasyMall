package org.ruikun.infrastructure.mq;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONReader;
import org.springframework.amqp.core.Message;

import java.nio.charset.StandardCharsets;

public final class MessageDeserializer {

    private MessageDeserializer() {}

    public static DomainEvent<Object> deserialize(Message message) {
        String json = new String(message.getBody(), StandardCharsets.UTF_8);
        return JSON.parseObject(json, DomainEvent.class);
    }

    public static <T> DomainEvent<T> deserialize(Message message, Class<T> dataClass) {
        String json = new String(message.getBody(), StandardCharsets.UTF_8);
        // Two-pass: first extract eventType, then deserialize data field to correct type
        DomainEvent<?> raw = JSON.parseObject(json, DomainEvent.class);
        if (raw == null || raw.getData() == null) {
            @SuppressWarnings("unchecked")
            DomainEvent<T> result = (DomainEvent<T>) raw;
            return result;
        }

        // Re-parse the data field to the specific type
        String dataJson = JSON.toJSONString(raw.getData());
        T typedData = JSON.parseObject(dataJson, dataClass);

        @SuppressWarnings("unchecked")
        DomainEvent<T> typed = (DomainEvent<T>) raw;
        typed.setData(typedData);
        return typed;
    }
}
