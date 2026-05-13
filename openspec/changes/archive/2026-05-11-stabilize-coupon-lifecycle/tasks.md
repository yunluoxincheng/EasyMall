## 1. Database and Enums

- [x] 1.1 Add coupon lifecycle status values `LOCKED`, `RETURNED`, and `INVALID` to `CouponStatus` without changing existing `UNUSED`, `USED`, and `EXPIRED` codes
- [x] 1.2 Add coupon lifecycle action enum values for lock, confirm used, return, expire, and invalidate
- [x] 1.3 Add SQL migration for any required coupon lifecycle indexes, including status/order lookup indexes on `user_coupon`
- [x] 1.4 Extend `coupon_usage_log` action documentation and entity/VO display mapping for lifecycle actions
- [x] 1.5 Confirm existing `orders.user_coupon_id` and `orders.coupon_discount` fields are sufficient for lifecycle integration

## 2. Coupon Lifecycle Service

- [x] 2.1 Replace direct `useCoupon` behavior with `lockCoupon(userId, userCouponId, orderId, orderNo, orderAmount)` or equivalent lifecycle method
- [x] 2.2 Implement coupon validation for ownership, `UNUSED` status, validity window, order threshold, and member level before locking
- [x] 2.3 Implement atomic `UNUSED -> LOCKED` update scoped by user coupon ID and current status
- [x] 2.4 Implement `confirmCouponUsed(userId, userCouponId, orderId)` with atomic `LOCKED -> USED` update scoped by order identity
- [x] 2.5 Implement `returnLockedCoupon(userId, userCouponId, orderId)` with atomic return behavior scoped by order identity
- [x] 2.6 Ensure returned coupons become reusable only when still within their validity window
- [x] 2.7 Ensure expired locked coupons become `EXPIRED` instead of reusable during return
- [x] 2.8 Write lifecycle logs for lock, confirm used, return, expire, and invalid operations
- [x] 2.9 Ensure duplicate confirm and duplicate return paths are idempotent and do not repeat statistics or logs

## 3. Order Integration

- [x] 3.1 Update order creation to calculate coupon discount and lock the coupon after order amount calculation
- [x] 3.2 Persist `user_coupon_id` and `coupon_discount` on the order before creating the payment order
- [x] 3.3 Ensure order creation transaction rolls back the coupon lock when later order creation steps fail
- [x] 3.4 Update manual pending-order cancellation to return only coupons locked by that order
- [x] 3.5 Ensure cancellation of non-pending or already-paid orders does not return `USED` coupons

## 4. Payment and Timeout Integration

- [x] 4.1 Update payment callback success workflow to confirm locked coupons after successful order paid transition
- [x] 4.2 Ensure duplicate payment callbacks do not repeat coupon confirmation
- [x] 4.3 Ensure payment callback failure paths do not confirm coupons
- [x] 4.4 Update timeout cancellation to return only `LOCKED` coupons associated with the timed-out order
- [x] 4.5 Ensure delayed messages for paid orders leave `USED` coupons unchanged
- [x] 4.6 Verify payment callback and timeout cancellation race paths cannot both confirm and return the same coupon

## 5. Queries and Admin Statistics

- [x] 5.1 Update user coupon list and available-coupon queries so only `UNUSED` and valid coupons are selectable
- [x] 5.2 Ensure locked coupons are hidden from available coupon results
- [x] 5.3 Update coupon status description mapping in user-facing and admin-facing VOs
- [x] 5.4 Update admin usage-log queries to display expanded lifecycle action labels
- [x] 5.5 Ensure coupon template `used_count` represents confirmed paid usage only

## 6. Tests and Verification

- [x] 6.1 Add tests for successful coupon lock during order creation
- [x] 6.2 Add tests rejecting coupon lock when coupon belongs to another user
- [x] 6.3 Add tests rejecting coupon lock when coupon is not `UNUSED`
- [x] 6.4 Add tests rejecting expired coupons and unmet threshold/member-level coupons
- [x] 6.5 Add tests confirming locked coupon as `USED` after payment callback success
- [x] 6.6 Add tests proving duplicate payment callback does not duplicate coupon confirmation
- [x] 6.7 Add tests returning locked coupon after manual pending-order cancellation
- [x] 6.8 Add tests returning locked coupon after timeout cancellation
- [x] 6.9 Add tests proving paid-order timeout messages do not return used coupons
- [x] 6.10 Add tests for expired locked coupon becoming `EXPIRED` during return
- [x] 6.11 Run `mvn compile` from `easymall-backend`
- [x] 6.12 Run targeted backend tests for coupon lifecycle, payment callback, order cancellation, and delayed close
