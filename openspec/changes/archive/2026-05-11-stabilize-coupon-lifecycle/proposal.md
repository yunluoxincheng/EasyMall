## Why

EasyMall currently treats coupon usage as a one-step deduction during order creation, which makes unpaid order cancellation, payment confirmation, and duplicate side effects harder to reason about. After order state machine, inventory locking, payment idempotency, and MQ delayed close are in place, coupons should follow the same two-phase transaction lifecycle as inventory: lock on order creation, confirm on payment success, and return on cancellation.

## What Changes

- Define an explicit user-coupon lifecycle with `UNUSED`, `LOCKED`, `USED`, `EXPIRED`, `RETURNED`, and `INVALID` states.
- Change order creation to lock a selected coupon instead of immediately marking it used.
- Persist the selected `userCouponId` and calculated discount amount on the order so payment and cancellation flows can finish coupon side effects safely.
- Confirm locked coupons as used only after payment callback succeeds.
- Return locked coupons when pending-payment orders are cancelled manually or by delayed close.
- Add coupon lifecycle operation logs or equivalent trace records for lock, confirm, return, expire, and invalid operations.
- Make coupon lock, confirm, and return operations idempotent under duplicate cancellation messages, duplicate payment callbacks, and retry paths.
- Add tests for coupon validation, lifecycle transitions, payment confirmation, order cancellation, timeout cancellation, and duplicate side effects.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `coupon-system`: Changes order coupon usage from immediate use to a lock/confirm/return lifecycle with explicit states, validation, operation logs, and idempotent transitions.
- `payment-callback-idempotency`: Payment callback success now confirms a locked coupon exactly once after payment succeeds.
- `delayed-order-close`: Timeout cancellation now returns locked coupons through the coupon lifecycle instead of relying on the old used-coupon return behavior.

## Impact

- Backend: updates coupon, order, payment, and delayed-order-close integration points; adds or refines coupon lifecycle services, enums, mapper methods, and validation.
- Database: may add order coupon reference fields and coupon operation log storage; may migrate existing user-coupon status values to the explicit lifecycle model.
- API behavior: order creation stores coupon discount details but does not mark coupons used until payment succeeds.
- Tests: adds lifecycle and idempotency coverage around order creation, payment callback, manual cancellation, timeout cancellation, and duplicate events.
