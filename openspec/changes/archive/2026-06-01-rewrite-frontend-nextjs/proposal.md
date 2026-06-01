## Why

The current Vue/Vite frontend has grown through incremental patches and no longer presents a cohesive commerce experience: individual pages can be improved, but the overall storefront, admin console, and role-based navigation still feel inconsistent. Rewriting the frontend with Next.js creates a clean foundation for a modern shopping UI, a dense SaaS-style admin console, and extensible payment flows.

## What Changes

- **BREAKING**: Replace the existing `easymall-frontend` Vue/Vite application with a Next.js frontend rather than maintaining both in parallel.
- Introduce a Next.js App Router frontend architecture with TypeScript, reusable layouts, shared API client, route guards, and environment-based backend configuration.
- Introduce a cohesive design system for the storefront and admin console using an Apple-inspired clean visual language, commerce-oriented density, high-quality cards, consistent spacing, and responsive behavior.
- Redesign the storefront home page around search, category discovery, carousel/focus banners, promotional modules, recommendation sections, service promises, and product browsing.
- Keep admin authentication unified with the storefront login: administrators sign in through the normal customer login flow and receive a management entry in the user center.
- Redesign the admin console as a modern SaaS management workspace with a dashboard, dense tables, clear filters, efficient form workflows, and consistent navigation.
- Extend the payment experience to support a provider selection model for domestic and international mainstream payment methods; first implementation MUST keep mock payment fully executable and treat real providers as configured/available channels rather than unconditional gateway integrations.
- Preserve compatibility with the existing Spring Boot backend where feasible, while identifying required API adjustments for payment providers, dashboard data, and frontend-friendly response shapes.

## Capabilities

### New Capabilities

- `nextjs-frontend-platform`: Next.js application architecture, shared design system, routing, layouts, API client, auth integration, and migration expectations for replacing the Vue/Vite frontend.

### Modified Capabilities

- `user-auth`: Unified storefront/admin login behavior and administrator entry exposure from the user center.
- `user-layout`: Customer-facing navigation, storefront shell, responsive layout behavior, and admin entry placement.
- `product-browsing`: Storefront home page, category discovery, carousel/focus content, search/filter UX, and product list presentation.
- `payment-order-management`: Payment provider selection and extensible domestic/international payment channel behavior.
- `admin-layout`: Admin console shell, dashboard-first navigation, dense SaaS layout, and return-to-store behavior.

## Impact

- Frontend application code under `easymall-frontend/` will be replaced by a Next.js implementation and dependency set.
- Frontend build/run commands will change from Vite scripts to Next.js scripts while preserving the project-level expectation of a separate frontend package.
- Backend APIs remain the initial source of truth, but implementation may require additive backend endpoints or fields for payment provider metadata, dashboard summaries, and better frontend state handling.
- Authentication storage, request token selection, protected routes, and admin route access will be redesigned around a single user session with role-aware capabilities.
- Payment work will introduce frontend abstractions for providers such as mock, Alipay, WeChat Pay, UnionPay/Cloud QuickPass, Stripe, PayPal, Apple Pay, and Google Pay; only configured providers SHALL be executable, and real provider settlement/callback verification may be phased by provider readiness.
- Existing Vue-specific components, Naive UI usage, and Vite-specific configuration will be removed during implementation.
