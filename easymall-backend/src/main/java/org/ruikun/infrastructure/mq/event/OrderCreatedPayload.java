package org.ruikun.infrastructure.mq.event;

import lombok.Data;

import java.io.Serializable;

@Data
public class OrderCreatedPayload implements Serializable {
    private Long orderId;
    private String orderNo;
    private Long userId;
}
