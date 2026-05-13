## ADDED Requirements

### Requirement: Timeout cancellation releases locked stock
When an order is cancelled by delayed order close, the system SHALL release locked inventory by calling the existing locked-stock release behavior for every order item.

#### Scenario: Delayed close releases stock
- **WHEN** an unpaid order containing product ID 2001 with quantity 2 is cancelled by timeout
- **THEN** `InventoryService.releaseLockedStock(2001, 2, orderId)` is executed and the product's locked stock decreases while available stock increases

#### Scenario: Paid order delayed message does not release stock
- **WHEN** a delayed close message is consumed for a paid order
- **THEN** the system does not call locked-stock release for that order
