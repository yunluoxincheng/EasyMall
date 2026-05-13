# delayed-order-close Specification

## Purpose
TBD - created by archiving change add-mq-order-timeout-and-events. Update Purpose after archive.
## Requirements
### Requirement: Publish delayed order-close message
The system SHALL publish a delayed order-close message after an order is created successfully. The message SHALL identify the order and expire after the configured unpaid-order timeout.

#### Scenario: Order creation schedules timeout close
- **WHEN** a user creates order ID 1001 successfully
- **THEN** the system publishes a delayed order-close message containing order ID 1001 after the order transaction commits

### Requirement: Timeout consumer cancels unpaid orders
The system SHALL consume delayed order-close messages and cancel the order only when the current order status is `PENDING_PAYMENT`. The cancellation SHALL use a conditional status update or row-level lock with re-checks in the same transaction so payment callback and timeout cancellation cannot both win.

#### Scenario: Unpaid order is cancelled after timeout
- **WHEN** the delayed close message for order ID 1001 is consumed and the order status is `PENDING_PAYMENT`
- **THEN** the system transitions the order to `CANCELLED` through the order state machine

#### Scenario: Payment callback wins timeout race
- **WHEN** the delayed close consumer starts for order ID 1001 while the payment callback has already changed or is changing the order to `PAID`
- **THEN** the timeout cancellation conditional update or locked re-check fails and the order remains paid

#### Scenario: Timeout wins payment callback race
- **WHEN** the delayed close consumer atomically transitions order ID 1001 from `PENDING_PAYMENT` to `CANCELLED` before payment completes
- **THEN** the payment callback does not transition the cancelled order to paid and returns the existing business error or idempotent failure path

### Requirement: Timeout consumer protects paid orders
The system SHALL NOT cancel orders that are already paid or otherwise no longer pending payment when a delayed close message is consumed.

#### Scenario: Paid order ignores delayed close
- **WHEN** the delayed close message for order ID 1001 is consumed and the order status is `PAID`
- **THEN** the system acknowledges the message and leaves the order status unchanged

### Requirement: Timeout cancellation side effects

When timeout cancellation succeeds, the system SHALL release locked inventory, return the locked coupon when applicable, and close the active payment order. Coupon return SHALL only apply to coupons that are still locked by the timed-out order.

#### Scenario: Timeout cancellation releases related resources
- **WHEN** an unpaid order with locked stock, a locked coupon, and a waiting payment order is cancelled by timeout
- **THEN** locked stock is released, the coupon is returned through the coupon lifecycle service, and the payment order is closed

#### Scenario: Timeout cancellation returns only locked coupon
- **WHEN** an unpaid order using coupon ID 3001 is cancelled by timeout
- **AND** coupon ID 3001 is still `LOCKED` by that order
- **THEN** coupon ID 3001 becomes available for the user again if it is still valid

#### Scenario: Timeout cancellation expires outdated locked coupon
- **WHEN** an unpaid order using coupon ID 3001 is cancelled by timeout
- **AND** coupon ID 3001 is still `LOCKED` by that order
- **AND** coupon ID 3001 has passed its end time
- **THEN** coupon ID 3001 becomes `EXPIRED`
- **AND** it is not available for reuse

#### Scenario: Paid order delayed message does not return used coupon
- **WHEN** a delayed close message is consumed for a paid order that used a coupon
- **THEN** the coupon remains associated with the paid order as `USED` and is not returned
