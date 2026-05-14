## MODIFIED Requirements

### Requirement: Points issuing idempotency
The system SHALL ensure order-completion points are issued at most once for the same order, even if the same event is consumed multiple times or replayed with a different `messageId`. This SHALL be enforced by `IPointsService.addPointsIdempotent` using `PointsBizType.ORDER_COMPLETED` + `{orderId}` unique constraint. The consumer SHALL NOT perform its own idempotency check against `points_record.idempotencyKey`; idempotency SHALL be owned by the service layer via the `biz_type` + `biz_id` unique index.

#### Scenario: Duplicate order completed event does not duplicate points
- **WHEN** the points consumer receives the same `OrderCompletedEvent` twice
- **THEN** the user receives points only once for that order

#### Scenario: Replayed order completed event with new message ID does not duplicate points
- **WHEN** the points consumer receives two `OrderCompletedEvent` messages with different `messageId` values but the same order ID
- **THEN** the user receives order-completion points only once

#### Scenario: Consumer delegates idempotency to service
- **WHEN** the points consumer processes an `OrderCompletedEvent`
- **THEN** the consumer calls `pointsService.addPointsIdempotent` with `PointsBizType.ORDER_COMPLETED` and the order ID as biz_id
- **AND** the consumer does NOT query `points_record.idempotencyKey` directly
- **AND** the consumer catches `DuplicateKeyException` from the service and treats it as idempotent success (ACK with INFO log)

#### Scenario: Idempotent conflict does not modify user points
- **WHEN** `addPointsIdempotent` INSERT into `points_record` hits the unique index on `(ORDER_COMPLETED, {orderId})`
- **THEN** the method throws `DuplicateKeyException`
- **AND** `user.points` is not modified
- **AND** member level is not modified

