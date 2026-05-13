## ADDED Requirements

### Requirement: Delayed close does not cancel paid orders
The delayed order-close consumer SHALL check the current order and payment state before cancellation so paid orders are never cancelled by timeout messages.

#### Scenario: Paid payment protects order from timeout
- **WHEN** the delayed close message is consumed for an order whose payment order is `PAID`
- **THEN** the order is not cancelled and the payment order remains `PAID`

### Requirement: Timeout cancellation closes active payment order
When an unpaid order is cancelled by delayed order close, the system SHALL close the associated active payment order whose status is `WAITING_PAY` or `PAYING`.

#### Scenario: Waiting payment order is closed after timeout
- **WHEN** a `PENDING_PAYMENT` order with a `WAITING_PAY` payment order is cancelled by timeout
- **THEN** the payment order status becomes `CLOSED`
