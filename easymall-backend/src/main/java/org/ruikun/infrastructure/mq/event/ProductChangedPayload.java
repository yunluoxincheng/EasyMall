package org.ruikun.infrastructure.mq.event;

import lombok.Data;

import java.io.Serializable;

@Data
public class ProductChangedPayload implements Serializable {
    private Long productId;
    private String changeType;
}
