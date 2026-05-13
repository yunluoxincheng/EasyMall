## ADDED Requirements

### Requirement: Timeout-driven order cancellation
The system SHALL allow the delayed order-close consumer to transition an order from `PENDING_PAYMENT` to `CANCELLED` through the existing `OrderStateMachine`.

#### Scenario: Timeout transition uses state machine
- **WHEN** the delayed close consumer cancels a `PENDING_PAYMENT` order
- **THEN** the transition is validated by `OrderStateMachine` and the order status becomes `CANCELLED`

#### Scenario: Timeout transition rejects non-pending order
- **WHEN** the delayed close consumer attempts to cancel an order whose status is `PAID`
- **THEN** the consumer does not perform the `CANCELLED` transition and leaves the order unchanged
