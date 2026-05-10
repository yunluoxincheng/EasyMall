package org.ruikun.infrastructure.mq;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class DomainEvent<T> implements Serializable {

    private String messageId;
    private String eventType;
    private String aggregateType;
    private Long aggregateId;
    private LocalDateTime occurredAt;
    private T data;

    public static <T> DomainEvent<T> of(String eventType, String aggregateType,
                                         Long aggregateId, T data) {
        DomainEvent<T> event = new DomainEvent<>();
        event.setMessageId(java.util.UUID.randomUUID().toString());
        event.setEventType(eventType);
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setOccurredAt(LocalDateTime.now());
        event.setData(data);
        return event;
    }
}
