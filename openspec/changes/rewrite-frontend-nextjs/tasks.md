## 1. Migration Baseline

- [ ] 1.1 Record whether the existing dirty Vue frontend diff is committed, reverted, or used only as rewrite reference before deleting Vue/Vite files
- [ ] 1.2 Inventory current Vue/Vite routes, API calls, stores, and page-level workflows that must be preserved in the Next.js rewrite
- [ ] 1.3 Replace frontend package scripts and dependencies with Next.js, React, TypeScript, Tailwind CSS, UI primitives, and lucide-react
- [ ] 1.4 Remove or quarantine Vue/Vite entrypoints so the frontend package has one clear Next.js runtime path
- [ ] 1.5 Configure frontend environment variables for backend API base URL and local development proxy behavior

## 2. Next.js Platform Foundation

- [ ] 2.1 Create App Router structure for storefront routes, admin routes, shared providers, loading states, and error boundaries
- [ ] 2.2 Implement shared design tokens, Tailwind theme, base typography, responsive containers, cards, buttons, forms, dialogs, tables, badges, and navigation primitives
- [ ] 2.3 Implement a typed API client that unwraps backend `Result<T>` responses and normalizes error handling
- [ ] 2.4 Implement session utilities for token storage, current user state, role checks, and protected route behavior
- [ ] 2.5 Add shared formatting utilities for currency, dates, status labels, order states, and payment states

## 3. Unified Auth And Layouts

- [ ] 3.1 Rebuild the unified login and registration pages in Next.js
- [ ] 3.2 Ensure normal users login to the storefront and administrators login through the same flow
- [ ] 3.3 Implement admin route guards that allow only authenticated administrator users
- [ ] 3.4 Redirect `/admin/login` to the unified login flow with redirect support
- [ ] 3.5 Build the storefront shell with top navigation, search, cart badge, user menu, footer, and responsive behavior
- [ ] 3.6 Add the administrator-only management entry in the user center and keep it out of the storefront top navigation

## 4. Storefront Experience

- [ ] 4.1 Build the modern storefront home page with search, category discovery, carousel/focus banners, service promises, promotional modules, and recommendation sections
- [ ] 4.2 Add fallback category and recommendation states for temporary product/category API failures
- [ ] 4.3 Rebuild product listing with category filtering, keyword search, pagination, modern product cards, empty states, and responsive grids
- [ ] 4.4 Rebuild product detail with gallery, price, stock, description, cart actions, buy-now action, favorites, and comments
- [ ] 4.5 Rebuild coupon center, points mall entry, and member-related storefront navigation links
- [ ] 4.6 Verify storefront visual quality on desktop, tablet, and mobile breakpoints with browser screenshots

## 5. Commerce Flows

- [ ] 5.1 Rebuild cart management with quantity updates, selection, totals, and checkout entry
- [ ] 5.2 Rebuild checkout with address/order confirmation, coupon/member discount display, and order creation
- [ ] 5.3 Rebuild order list and order detail with correct status labels, pay-again entry, confirmation, cancellation, and review entry points
- [ ] 5.4 Rebuild profile and password-change pages
- [ ] 5.5 Rebuild favorites and personal comments pages
- [ ] 5.6 Rebuild personal coupons and points history pages
- [ ] 5.7 Rebuild member center and daily sign-in pages

## 6. Payment Provider Model

- [ ] 6.1 Define frontend payment provider metadata for MOCK, Alipay, WeChat Pay, UnionPay/Cloud QuickPass, Stripe, PayPal, Apple Pay, and Google Pay
- [ ] 6.2 Rebuild payment page with provider selection, provider availability states, payment amount, order context, and status feedback
- [ ] 6.3 Keep mock payment executable for local development and full order-flow verification
- [ ] 6.4 Prevent unconfigured real providers from initiating payment and show clear unavailable states
- [ ] 6.5 Add frontend adapter boundaries for redirect, QR code, wallet-sheet, and mock payment execution modes
- [ ] 6.6 Identify and document backend API gaps required for real payment provider initiation, provider availability, channel enum alignment, and callback handling

## 7. Admin Console

- [ ] 7.1 Build dashboard-first admin shell with side navigation, top bar, breadcrumbs, return-to-store action, and logout-from-admin behavior
- [ ] 7.2 Build admin dashboard summary modules using available backend data and explicit empty/todo states for missing metrics
- [ ] 7.3 Rebuild product management with dense tables, filters, status chips, forms, upload fields, and clear action areas
- [ ] 7.4 Rebuild category management with tree/table navigation, status controls, and create/edit forms
- [ ] 7.5 Rebuild order management with filters, status display, detail drawer/page, shipment action, and payment/order state visibility
- [ ] 7.6 Rebuild user management with role display, search/filter controls, and role update workflows
- [ ] 7.7 Rebuild coupon management with table filters, create/edit forms, issue controls, and status display
- [ ] 7.8 Rebuild comment moderation with review states, product/user context, and moderation actions
- [ ] 7.9 Rebuild member level management with level rules, discount display, and edit flows
- [ ] 7.10 Rebuild points product management with exchange stock, points price, status controls, and edit flows
- [ ] 7.11 Verify admin pages favor dense SaaS ergonomics over marketing-style cards and hero sections

## 8. Cleanup And Verification

- [ ] 8.1 Remove obsolete Vue components, Pinia stores, Naive UI usage, Vite config, and Vue-specific type declarations
- [ ] 8.2 Update frontend README or project documentation with Next.js development, build, and environment instructions
- [ ] 8.3 Run frontend typecheck and production build successfully
- [ ] 8.4 Run backend compile if backend API changes are made
- [ ] 8.5 Use browser verification for storefront home, login/admin entry, product browsing, cart/checkout/payment, orders, and admin dashboard
- [ ] 8.6 Review final git diff to ensure the replacement is scoped to the frontend rewrite and any explicitly required additive backend/API docs
