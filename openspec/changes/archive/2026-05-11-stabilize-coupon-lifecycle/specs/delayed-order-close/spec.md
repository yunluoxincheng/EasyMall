## MODIFIED Requirements

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
