package org.ruikun.infrastructure.mq;

public final class MqConstants {

    private MqConstants() {}

    // --- Exchanges ---
    public static final String ORDER_EXCHANGE = "easymall.order";
    public static final String PRODUCT_EXCHANGE = "easymall.product";
    public static final String ORDER_DLX = "easymall.order.dlx";
    public static final String CONSUMER_DLX = "easymall.consumer.dlx";

    // --- Queues ---
    public static final String ORDER_TIMEOUT_DELAY_QUEUE = "easymall.order.timeout.delay";
    public static final String ORDER_TIMEOUT_QUEUE = "easymall.order.timeout";
    public static final String ORDER_COMPLETED_QUEUE = "easymall.order.completed";
    public static final String PRODUCT_CHANGED_QUEUE = "easymall.product.changed";

    // --- DLQ (dead-letter queues for failed consumers) ---
    public static final String ORDER_TIMEOUT_DLQ = "easymall.order.timeout.dlq";
    public static final String ORDER_COMPLETED_DLQ = "easymall.order.completed.dlq";
    public static final String PRODUCT_CHANGED_DLQ = "easymall.product.changed.dlq";

    // --- Routing Keys ---
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String ORDER_TIMEOUT_ROUTING_KEY = "order.timeout";
    public static final String ORDER_COMPLETED_ROUTING_KEY = "order.completed";
    public static final String PRODUCT_CHANGED_ROUTING_KEY = "product.changed";

    // --- Event Types ---
    public static final String ORDER_CREATED_EVENT = "OrderCreatedEvent";
    public static final String ORDER_COMPLETED_EVENT = "OrderCompletedEvent";
    public static final String PRODUCT_CHANGED_EVENT = "ProductChangedEvent";

    // --- Aggregate Types ---
    public static final String AGGREGATE_TYPE_ORDER = "ORDER";
    public static final String AGGREGATE_TYPE_PRODUCT = "PRODUCT";

    // --- Retry ---
    public static final int MAX_RETRY_COUNT = 3;
    public static final String HEADER_X_RETRY_COUNT = "x-retry-count";
}
