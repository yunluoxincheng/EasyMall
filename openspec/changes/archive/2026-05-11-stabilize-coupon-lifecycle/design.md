## Context

EasyMall already has coupon templates, user coupons, coupon calculation, coupon usage logs, order coupon fields, payment callbacks, and MQ delayed order close. The current order creation flow calls `useCoupon` before the order is persisted, immediately marks the coupon as used, and later tries to return it during cancellation. Stage 4 intentionally left coupon confirmation out of payment callback handling, and stage 5 reused the existing cancellation behavior for timeout close.

This change solidifies coupons as a two-phase resource in the transaction flow. The user coupon is locked during order creation, confirmed as used after payment succeeds, and returned only while the order is still unpaid and cancellable.

## Goals / Non-Goals

**Goals:**
- Introduce an explicit coupon lifecycle that includes locked and returned states.
- Replace immediate coupon usage during order creation with atomic coupon locking.
- Confirm locked coupons exactly once from the successful payment callback path.
- Return locked coupons from manual pending-order cancellation and MQ timeout cancellation.
- Keep coupon discount calculation deterministic by storing `userCouponId` and `couponDiscount` on the order.
- Preserve admin usage statistics by recording lifecycle operations in coupon logs.
- Add business idempotency so retries and duplicate messages do not double-confirm or double-return coupons.

**Non-Goals:**
- No complex promotion engine.
- No multi-coupon stacking.
- No campaign scheduling redesign.
- No real third-party payment provider integration.
- No distributed transaction framework or transactional outbox.
- No points ledger redesign; that is handled by the next stage 6 proposal.

## Decisions

### Use a Two-Phase Coupon Lifecycle

Coupons move through `UNUSED -> LOCKED -> USED` for successful orders and `UNUSED -> LOCKED -> UNUSED` for cancelled unpaid orders that are still valid. The return operation is recorded as a `RETURNED`/return lifecycle log action, while the reusable user-coupon row is restored to `UNUSED` so the customer can select it again. `EXPIRED` and `INVALID` remain terminal business states for unavailable coupons.

Alternatives considered:
- Keep immediate `USED` at order creation. This is simpler but makes an unpaid order look like a completed coupon redemption and complicates payment/cancellation races.
- Add a separate coupon reservation table. This is useful for heavier promotion systems, but the current single-coupon order flow can be handled by adding lifecycle states and CAS updates to `user_coupon`.

### Lock Coupon After Order Amount Calculation and Before Payment Creation

Order creation calculates the member-discounted amount, validates the selected user coupon, calculates the coupon discount, then locks the coupon with the new order ID/order number and persists the discount amount on the order. If order creation later fails, the transaction rolls back the coupon lock.

Alternatives considered:
- Lock before calculating order totals. This would hold a coupon before proving the order amount and member-level rules are valid.
- Confirm as used during order creation. This is the old behavior and is no longer aligned with payment idempotency.

### Confirm Coupon in the Payment Callback Transaction

Payment callback already owns the transition from `PENDING_PAYMENT` to `PAID` and inventory confirmation. It should also confirm a locked coupon as `USED` in the same successful local transaction, after payment amount and status validation pass.

Alternatives considered:
- Confirm coupon asynchronously from an `OrderPaidEvent`. This decouples modules but introduces eventual consistency for a core monetary side effect. Keep it synchronous until an outbox/retry pattern exists.
- Confirm coupon in `POST /api/payment/{paymentNo}/pay` before callback logic. That endpoint is only a simulated payment initiator; the callback path should remain the source of truth.

### Return Only Locked Coupons During Unpaid Cancellation

Manual cancellation and timeout cancellation only return coupons for orders that are still `PENDING_PAYMENT` and whose coupon status is `LOCKED` for that order. Paid orders keep `USED` coupons attached to the order.

Alternatives considered:
- Allow `USED -> UNUSED` return for any cancellation. This risks returning a coupon after payment has already succeeded.
- Store `RETURNED` permanently on the user-coupon row. This is more explicit for audit, but it makes valid returned coupons unavailable unless another transition restores them to `UNUSED`. This design restores the row to `UNUSED` and relies on the lifecycle log for audit.

### Use CAS-Style Mapper Updates for Idempotency

Lock, confirm, and return operations should update by current status and order identity:
- lock: `UNUSED -> LOCKED`
- confirm: `LOCKED -> USED` for the same order
- return: `LOCKED -> UNUSED` for still-valid coupons, or `LOCKED -> EXPIRED` when the coupon has passed its end time, for the same order

If the affected row count is zero, the service reloads the coupon and decides whether the operation is already complete or invalid. This protects duplicate payment callbacks, duplicate timeout messages, and cancellation retries.

Alternatives considered:
- Rely only on Java-level status checks before update. This is race-prone under concurrent callback and timeout handling.
- Use table locks. This is heavier than necessary for a single-row state transition.

### Reuse and Extend `coupon_usage_log`

The existing `coupon_usage_log` table can be extended from "use/return" into a lifecycle operation log. Add action codes for lock, confirm, return, expire, and invalidate. If a migration is needed, preserve old action values and map them to the new action semantics.

Alternatives considered:
- Add a new `coupon_operation_log` table. This is cleaner naming but duplicates the already-existing admin usage-log surface.

## Risks / Trade-offs

- [Risk] Existing data contains status values only for `UNUSED`, `USED`, and `EXPIRED`. -> Mitigation: add new enum values without changing existing numeric meanings, and only migrate future behavior to new states.
- [Risk] Payment callback and timeout cancellation can race. -> Mitigation: both flows already use guarded order transitions; coupon operations also use status-and-order CAS updates.
- [Risk] Returning a coupon after its validity window has expired could allow invalid reuse. -> Mitigation: return flow checks `end_time`; expired locked coupons become `EXPIRED` instead of `UNUSED`.
- [Risk] Template `used_count` can drift under retries. -> Mitigation: increment only on successful `LOCKED -> USED` confirmation and decrement or avoid increment during return depending on when the count is updated.
- [Risk] Admin statistics currently expect action `1=使用` and `2=返还`. -> Mitigation: update query code and VO display text to understand the expanded action enum while preserving historical rows.

## Migration Plan

1. Add coupon status enum values for `LOCKED`, `RETURNED`, and `INVALID` while preserving existing `UNUSED`, `USED`, and `EXPIRED` codes.
2. Add or extend coupon log action enum values for lock, confirm used, return, expire, and invalidate.
3. Add database migration for any missing indexes needed by lifecycle CAS updates, especially `user_coupon(id, status)` and `user_coupon(order_id, status)`.
4. Replace `useCoupon` with lifecycle methods such as `lockCoupon`, `confirmCouponUsed`, and `returnLockedCoupon`, keeping compatibility wrappers only if needed.
5. Update order creation to lock coupons and store coupon discount fields before payment order creation.
6. Update payment callback success workflow to confirm the locked coupon after the order is marked paid and inventory is confirmed.
7. Update manual cancellation and timeout cancellation to return only locked coupons for unpaid orders.
8. Update expiration task to expire both `UNUSED` and expired `LOCKED` coupons that are no longer attached to active pending orders.
9. Add tests for lifecycle transitions, idempotency, and integration with payment callback and delayed close.

Rollback strategy: because database changes are additive, rollback can restore the old order creation/cancellation behavior while leaving new enum values and log action values unused. Existing `USED` and `EXPIRED` rows remain valid.

## Resolved Questions

- Returned coupons are logged with a return lifecycle action, while still-valid user-coupon rows are restored to `UNUSED` for customer reuse. `RETURNED` remains available as an enum/logging vocabulary value but is not the final persisted state for reusable coupons.
- Template `used_count` represents confirmed paid usage only, not locked usage attempts.
