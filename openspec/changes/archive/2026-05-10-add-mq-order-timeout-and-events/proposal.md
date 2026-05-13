## Why

EasyMall currently handles order timeout cancellation, points issuing, and cache invalidation through synchronous or manually triggered flows. Introducing RabbitMQ-based domain events will decouple these workflows and move the modular monolith closer to a production e-commerce architecture.

## What Changes

- Add RabbitMQ as the first MQ implementation, including backend dependency, application configuration, and Docker Compose service.
- Introduce domain event contracts for order lifecycle and product changes.
- Publish a delayed order-close message after order creation and consume it to cancel unpaid orders after the configured timeout.
- Publish order-completed events so points can be issued asynchronously and idempotently.
- Publish product-changed events so product-related Redis caches can be invalidated asynchronously.
- Add message consume logging so consumers can safely ignore duplicate messages and record failures.
- Keep the event model provider-neutral enough for a later RocketMQ migration, while implementing RabbitMQ in this change.

## Capabilities

### New Capabilities
- `mq-domain-events`: Defines domain event structure, event publishing, RabbitMQ exchanges, queues, routing keys, and serialization rules.
- `delayed-order-close`: Defines delayed order-close messaging and the behavior for automatically cancelling unpaid orders.
- `async-order-side-effects`: Defines asynchronous side effects triggered by order completion, including idempotent points issuing.
- `async-cache-invalidation`: Defines asynchronous product cache invalidation triggered by product changes.
- `message-consume-idempotency`: Defines message consume logs and duplicate-message handling for all MQ consumers.

### Modified Capabilities
- `order-state-machine`: Adds timeout-driven transition from `PENDING_PAYMENT` to `CANCELLED` through the existing state machine.
- `inventory-locking`: Ensures timeout cancellation releases locked stock through the existing inventory release behavior.
- `payment-callback-idempotency`: Ensures timeout cancellation closes active payment orders and paid orders are not cancelled by delayed messages.
- `coupon-system`: Ensures timeout cancellation returns coupons through the existing order cancellation behavior.

## Impact

- Backend: adds RabbitMQ dependency/configuration, event model classes, publisher/consumer services, consume-log persistence, and integration points in order, payment, inventory, points, product, and coupon modules.
- Database: adds `message_consume_log` table for consumer idempotency and diagnostics.
- Configuration: adds RabbitMQ settings and order timeout settings to dev/prod profile configuration.
- Docker: adds RabbitMQ service to the local development Docker Compose stack.
- Tests: adds coverage for delayed close, paid-order protection, duplicate consumption, async points issuing, and product cache invalidation.
