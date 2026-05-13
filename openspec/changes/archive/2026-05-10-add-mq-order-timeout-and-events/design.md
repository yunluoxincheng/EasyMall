## Context

EasyMall is a modular monolith with Spring Boot, MyBatis Plus, MySQL, Redis, and Docker Compose. Earlier refactor phases introduced clearer order state transitions, inventory locking, and payment idempotency, but time-based order cancellation, points issuing, and product cache cleanup are still tightly coupled to synchronous flows or manual triggers.

This change introduces RabbitMQ as the first message broker implementation. The immediate goal is not to split services; it is to make selected cross-module workflows event-driven while keeping local database transactions and existing module boundaries understandable.

## Goals / Non-Goals

**Goals:**
- Use RabbitMQ to support delayed order close, asynchronous points issuing, and asynchronous product cache invalidation.
- Define a small domain event model with stable event names, message IDs, aggregate references, occurrence time, and payload data.
- Add consumer idempotency through `message_consume_log`.
- Integrate delayed close with the existing order state machine, inventory locking, coupon return, and payment close behavior.
- Keep Docker Compose capable of starting MySQL, Redis, and RabbitMQ for local development.

**Non-Goals:**
- No microservice split.
- No distributed transaction framework such as Seata.
- No event sourcing or outbox implementation in this phase.
- No RocketMQ migration.
- No real third-party payment integration.
- No comment approval event behavior beyond leaving room for future event expansion.

## Decisions

### Use RabbitMQ Topic Exchanges Plus TTL and DLX for Delayed Close

RabbitMQ is already the roadmap's recommended first MQ and fits the current Spring Boot monolith. Use topic exchanges for normal domain events. For delayed order close, use a TTL queue plus dead-letter exchange (DLX): order-created timeout messages enter a delay queue with per-message expiration or configured queue TTL, then dead-letter to the order-timeout consumer queue when the timeout expires.

This avoids requiring the RabbitMQ delayed-message exchange plugin in local Docker. The Docker Compose service can use the standard RabbitMQ management image, and tests can verify queue arguments and consumer behavior without plugin-specific exchange types.

Alternatives considered:
- RocketMQ: stronger delayed-message support for some production workloads, but it adds more operational complexity and is reserved for a later microservice phase.
- RabbitMQ delayed-message exchange plugin: convenient API, but it requires a plugin-enabled broker image and extra local setup.
- In-process scheduler: simpler, but it does not demonstrate MQ-driven architecture and is harder to reuse across event flows.

### Keep Domain Events Provider-Neutral

Event classes should live under backend infrastructure or shared domain-event packages and avoid RabbitMQ-specific annotations. RabbitMQ adapters handle exchange, routing, serialization, and publish details.

Alternatives considered:
- Put RabbitMQ details directly in each module service. This is faster initially but spreads broker coupling across business modules.

### Consumer Idempotency Uses `message_consume_log`

Every consumer checks `message_id` and consumer/event type before executing business logic. Duplicate successfully consumed messages are acknowledged without repeating side effects.

Alternatives considered:
- Rely only on business status checks. Status checks are still required, but a consume log provides cross-consumer diagnostics and a consistent duplicate-message guard.

### Delayed Close Reuses Existing Cancellation Flow

The delayed order-close consumer loads the current order and only cancels when the order is still `PENDING_PAYMENT`. Cancellation must go through the order state machine and reuse existing release behavior for inventory, coupon, and payment order closure.

The cancellation decision must be atomic with respect to payment callback handling. The implementation should use a conditional update such as `WHERE id = ? AND status = PENDING_PAYMENT`, or use a row lock and re-check both order and payment order state inside the same transaction before executing side effects. If the conditional transition fails because payment completed first, the consumer acknowledges the message without releasing stock, returning coupons, or closing a paid payment order.

Alternatives considered:
- Direct SQL status update in the consumer. This would bypass existing invariants and create inconsistent side effects.
- Read-then-update without a condition. This is vulnerable to payment callback races and can cancel an order that has just been paid.

### Points Issuing Requires Business Idempotency

`message_consume_log` only deduplicates by `messageId`. Points issuing must also be idempotent by business key so a second `OrderCompletedEvent` with a different message ID cannot issue duplicate points. Add a unique constraint or equivalent atomic guard for order-completion points, such as `points_record(type = ORDER, source_id = orderId)`.

Alternatives considered:
- Rely only on MQ message ID. This does not protect against republished events or manual replays with new message IDs.

### Product Cache Keys Are Centralized Behind ProductCacheService

Product cache reads and invalidation should use a single `ProductCacheService` or equivalent helper that owns key names for product detail, hot products, new products, and product search cache. The event consumer deletes keys through that service so tests can verify exact keys and existing services do not duplicate key-building logic.

Alternatives considered:
- Hard-code Redis keys inside the consumer. This is quicker but makes cache contracts hard to test and easy to drift from writers.

### Event Publishing Is Transaction-Aware Where Needed

Events that depend on successful database updates should publish after the local transaction commits. The implementation can use Spring transaction synchronization or an application service wrapper so messages are not emitted for rolled-back operations.

Alternatives considered:
- Publish inside the transaction immediately. This can create orphan messages when the transaction rolls back.
- Full transactional outbox. More robust, but it is intentionally out of scope for this phase.

## Risks / Trade-offs

- [Risk] Message published after database commit can still fail if RabbitMQ is unavailable. -> Mitigation: log publish failures clearly, keep operations locally consistent, and leave outbox/retry as a future hardening step.
- [Risk] TTL + DLX gives queue-level or per-message expiration semantics rather than plugin-style arbitrary delay exchange behavior. -> Mitigation: use it only for order timeout messages and keep timeout configuration externalized.
- [Risk] Duplicate messages or concurrent consumers can repeat side effects. -> Mitigation: combine consume-log idempotency with business-level status checks and CAS-style updates where relevant.
- [Risk] Payment callback and delayed close can race. -> Mitigation: use conditional order status updates or row-level locking with state re-checks before side effects.
- [Risk] Replayed order-completed events with new message IDs can duplicate points. -> Mitigation: enforce business idempotency by order ID in the points ledger.
- [Risk] Coupon lifecycle is not yet fully two-phase. -> Mitigation: route timeout cancellation through the existing cancellation behavior and keep deeper coupon lifecycle changes for the later coupon phase.

## Migration Plan

1. Add RabbitMQ dependency, configuration properties, Docker Compose service, topic exchanges, TTL delay queue, DLX bindings, and routing key constants.
2. Add domain event classes and publishing services.
3. Add `message_consume_log` table and related mapper/service.
4. Publish delayed order-close messages after order creation commits.
5. Add order-timeout consumer and reuse existing cancellation behavior.
6. Add atomic timeout cancellation guard against payment callback races.
7. Publish order-completed and product-changed events from existing services after successful state changes.
8. Add points business idempotency and product cache key ownership.
9. Add points and product-cache consumers with idempotent handling.
10. Add tests for timeout cancellation, payment/timeout races, paid-order protection, duplicate consumption, async points, and cache invalidation.

Rollback strategy: RabbitMQ can be disabled by not starting the broker and not enabling consumers, while the core synchronous order/payment/inventory flows remain intact. Database migration for `message_consume_log` is additive and can remain harmless if the feature is rolled back.

## Open Questions

- What exact default unpaid-order timeout should development use? The implementation should choose a short development-friendly value and keep production configurable through environment variables.
- Should publish-failure retries be added immediately or deferred to a future outbox/retry change?
