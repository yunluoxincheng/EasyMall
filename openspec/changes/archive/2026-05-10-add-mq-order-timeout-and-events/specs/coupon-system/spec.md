## ADDED Requirements

### Requirement: Timeout cancellation returns used coupon
When an unpaid order using a coupon is cancelled by delayed order close, the system SHALL return the coupon through the existing order-cancellation coupon return behavior.

#### Scenario: Delayed close returns coupon
- **WHEN** an unpaid order using coupon ID 3001 is cancelled by timeout
- **THEN** coupon ID 3001 becomes available for the user again if it is still valid

#### Scenario: Paid order delayed message does not return coupon
- **WHEN** a delayed close message is consumed for a paid order that used a coupon
- **THEN** the coupon remains associated with the paid order and is not returned
