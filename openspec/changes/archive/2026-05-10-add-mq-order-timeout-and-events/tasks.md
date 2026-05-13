## 1. RabbitMQ Infrastructure

- [x] 1.1 Add Spring AMQP/RabbitMQ dependency without upgrading unrelated dependencies
- [x] 1.2 Add RabbitMQ settings to `application-dev.yml` and environment-variable based settings to `application-prod.yml`
- [x] 1.3 Add order timeout configuration property with a development default
- [x] 1.4 Add RabbitMQ service to Docker Compose development setup
- [x] 1.5 Add RabbitMQ configuration for topic exchanges, TTL delay queue, DLX bindings, routing keys, and JSON serialization
- [x] 1.6 Add constants for event names, exchanges, queues, and routing keys

## 2. Domain Event Model

- [x] 2.1 Add provider-neutral domain event envelope with message metadata
- [x] 2.2 Add `OrderCreatedEvent`
- [x] 2.3 Add `OrderCompletedEvent`
- [x] 2.4 Add `ProductChangedEvent`
- [x] 2.5 Add event publishing service that publishes after successful transaction commit

## 3. Consume Idempotency

- [x] 3.1 Add SQL migration for `message_consume_log`
- [x] 3.2 Add consume-log entity, mapper, and service
- [x] 3.3 Add helper API for starting, completing, failing, and skipping duplicate message consumption
- [x] 3.4 Ensure successful duplicate messages are acknowledged without repeating side effects
- [x] 3.5 Ensure failed consumption records error details for diagnostics and retry handling

## 4. Delayed Order Close

- [x] 4.1 Publish delayed order-close message after order creation commits
- [x] 4.2 Add order-timeout consumer with consume-log idempotency
- [x] 4.3 Load current order status before cancellation
- [x] 4.4 Add conditional order status update or row-level lock so timeout cancellation and payment callback cannot both win
- [x] 4.5 Cancel only orders still in `PENDING_PAYMENT`
- [x] 4.6 Route timeout cancellation through the existing order state machine
- [x] 4.7 Reuse existing cancellation behavior to release locked inventory
- [x] 4.8 Reuse existing cancellation behavior to return coupons when applicable
- [x] 4.9 Close active payment orders when timeout cancellation succeeds
- [x] 4.10 Acknowledge delayed messages for paid or non-pending orders without side effects

## 5. Asynchronous Points

- [x] 5.1 Publish `OrderCompletedEvent` after an order transitions to `COMPLETED`
- [x] 5.2 Add points consumer with consume-log idempotency
- [x] 5.3 Issue order-completion points asynchronously from the consumer
- [x] 5.4 Add business idempotency for order-completion points by `type=ORDER` and `source_id=orderId` or equivalent atomic guard
- [x] 5.5 Prevent duplicate points issuing for the same order even when duplicate events use different message IDs

## 6. Product Cache Invalidation

- [x] 6.1 Publish `ProductChangedEvent` after product create, update, delete, on-shelf, off-shelf, and stock-display changes
- [x] 6.2 Add `ProductCacheService` or equivalent helper that owns product detail, hot product, new product, and search cache keys
- [x] 6.3 Add product-cache invalidation consumer with consume-log idempotency
- [x] 6.4 Delete product detail cache for the changed product through the shared cache helper
- [x] 6.5 Delete hot product and new product caches through the shared cache helper
- [x] 6.6 Delete or invalidate product search caches when affected through the shared cache helper
- [x] 6.7 Treat missing cache keys as successful idempotent invalidation

## 7. Tests and Verification

- [x] 7.1 Add tests for order creation publishing delayed close messages
- [x] 7.2 Add tests for timeout cancellation of unpaid orders
- [x] 7.3 Add tests proving paid orders are not cancelled by delayed messages
- [x] 7.4 Add concurrency tests for payment callback racing with timeout cancellation
- [x] 7.5 Add tests for duplicate timeout messages
- [x] 7.6 Add tests for async points issuing exactly once across duplicate business events
- [x] 7.7 Add tests for product cache key ownership and invalidation events
- [x] 7.8 Run `mvn compile` from `easymall-backend`
- [x] 7.9 Run targeted backend tests for MQ, order timeout, points, and cache consumers
