package org.ruikun.infrastructure.mq.event;

import lombok.Data;

import java.io.Serializable;

@Data
public class OrderCompletedPayload implements Serializable {
    private Long orderId;
    private Long userId;
    private Double payAmount;
}
