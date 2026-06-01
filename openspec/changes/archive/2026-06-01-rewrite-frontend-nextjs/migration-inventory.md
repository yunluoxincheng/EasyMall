# rewrite-frontend-nextjs migration inventory

## Task 1.1 baseline record

- `2026-05-17` workspace check: `git status --short` returned clean output.
- The existing Vue/Vite frontend is **not** represented by a dirty working tree diff.
- Migration approach for this rewrite:
  - keep the current Vue codebase as a reference while rebuilding the frontend;
  - replace package scripts/runtime with Next.js in `easymall-frontend/`;
  - quarantine obsolete Vue/Vite entrypoints after the Next.js app is in place.

## Task 1.2 route and workflow inventory

### Storefront routes to preserve

- `/login`: unified user login, supports redirect query.
- `/register`: user registration.
- `/`: user layout root, currently redirects to `/products`.
- `/products`: product listing, keyword search, category filtering, pagination, fallback category and hero states.
- `/products/:id`: product detail, gallery, add to cart, buy now, favorite toggle, comments.
- `/cart`: cart selection, quantity update, total calculation, checkout entry.
- `/checkout`: selected cart item confirmation, address capture, coupon calculation, order creation.
- `/payment/:paymentNo`: payment detail and mock payment execution.
- `/orders`: personal order list with status tabs and pay-again entry.
- `/orders/:id`: order detail, cancel, confirm receipt, review entry point.
- `/coupons`: coupon center / coupon receive flow.
- `/user`: profile, editable account info, admin entry for role `1`.
- `/user/password`: password update.
- `/user/favorites`: favorites list, remove favorite, add to cart.
- `/user/comments`: comment history, delete, merchant reply visibility.
- `/user/coupons`: personal coupons by status.
- `/user/points`: points balance and history.
- `/user/points/products`: points mall and exchange flow.
- `/user/member`: current member level and level ladder.
- `/user/signin`: daily sign-in.

### Admin routes to preserve

- `/admin/login`: redirects to unified `/login`.
- `/admin`: admin layout root, currently redirects to `/admin/product`.
- `/admin/product`: product CRUD, stock/status actions.
- `/admin/category`: category CRUD, level/status controls.
- `/admin/order`: order table, status filter, detail drawer, ship/cancel actions.
- `/admin/user`: user search, detail drawer, status/role/points actions.
- `/admin/coupon`: coupon templates, usage logs, statistics, create/edit.
- `/admin/comment`: moderation, approve/reject, reply, delete.
- `/admin/member-level`: member level CRUD and status controls.
- `/admin/points-product`: points product CRUD and status controls.

### Existing store/session model

- `src/stores/userAuth.ts`: primary user token storage in `user_token` and profile cache in `user_info`.
- `src/stores/auth.ts`: admin token mirror in `admin_token` with separate `role` key.
- Existing admin access can be derived from the user session when `userInfo.role === 1`.
- Router guards protect user pages by `requiresAuth` and admin pages by role checks plus redirect query support.

### Existing API surface by domain

- User auth/profile: `user-user.ts`
- Storefront catalog: `user-product.ts`, `user-category.ts`
- Cart and checkout: `user-cart.ts`, `user-order.ts`, `user-coupon.ts`
- Payment: `user-payment.ts`
- Favorites/comments/member/points/sign-in: `user-favorite.ts`, `user-comment.ts`, `user-member.ts`, `user-points.ts`, `user-points-exchange.ts`, `user-signin.ts`
- Admin product/category/order/user/coupon/comment/member/points: `product.ts`, `category.ts`, `order.ts`, `user.ts`, `coupon.ts`, `comment.ts`, `memberLevel.ts`, `pointsProduct.ts`

### Page-level workflows that must survive the rewrite

- Unified login should keep redirect support for both storefront and admin destinations.
- Admin access must stay role-aware and exposed from the personal center instead of the top navigation.
- Product detail buy-now flow relies on creating/finding a cart row and forwarding into checkout.
- Checkout depends on selected cart IDs from the query string, coupon calculation, and order creation returning `paymentNo`.
- Payment must keep mock payment executable while showing richer provider states for real channels.
- Order detail must keep cancel, confirm receipt, and pay-again entry points.
- Favorites, comments, coupons, points, points exchange, membership, and sign-in all have separate account pages that should stay reachable from the personal center.
- Admin pages favor table-heavy CRUD with compact actions rather than card-heavy marketing layouts.
