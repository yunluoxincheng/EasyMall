## ADDED Requirements

### Requirement: Publish order completed event
The system SHALL publish an `OrderCompletedEvent` after an order is successfully transitioned to `COMPLETED`.

#### Scenario: Completed order publishes event
- **WHEN** order ID 1001 transitions to `COMPLETED`
- **THEN** the system publishes an `OrderCompletedEvent` after the transaction commits

### Requirement: Asynchronous points issuing
The system SHALL consume `OrderCompletedEvent` messages and issue order-completion points asynchronously.

#### Scenario: Order completion issues points
- **WHEN** the points consumer receives an `OrderCompletedEvent` for order ID 1001
- **THEN** the system issues the configured points to the order user

### Requirement: Points issuing idempotency
The system SHALL ensure order-completion points are issued at most once for the same order, even if the same event is consumed multiple times or replayed with a different `messageId`. This SHALL be enforced with a business idempotency key such as `points_record(type = ORDER, source_id = orderId)` with a unique constraint or equivalent atomic guard.

#### Scenario: Duplicate order completed event does not duplicate points
- **WHEN** the points consumer receives the same `OrderCompletedEvent` twice
- **THEN** the user receives points only once for that order

#### Scenario: Replayed order completed event with new message ID does not duplicate points
- **WHEN** the points consumer receives two `OrderCompletedEvent` messages with different `messageId` values but the same order ID
- **THEN** the user receives order-completion points only once
