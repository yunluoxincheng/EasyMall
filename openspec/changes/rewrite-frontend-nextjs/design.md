## Context

EasyMall currently has a Spring Boot backend and a Vue 3/Vite/Naive UI frontend. The backend already provides most commerce primitives: user auth, products, categories, cart, checkout, orders, coupons, points, member levels, comments, payment orders, and admin CRUD modules. The frontend is functional but visually inconsistent and difficult to evolve into a polished commerce product because the storefront and admin console were built as separate page-level additions rather than from a shared experience system.

The rewrite will directly replace the Vue/Vite frontend with a Next.js application in `easymall-frontend/`. The target experience is not a marketing landing page: the storefront must retain the information density expected from Taobao/JD-style commerce while using Apple-inspired whitespace, premium cards, product imagery, and restrained motion. The admin console must feel like a modern SaaS workspace: dense, structured, fast to scan, and optimized for repeated operations.

## Goals / Non-Goals

**Goals:**

- Replace the current Vue/Vite frontend with a Next.js App Router frontend.
- Establish a coherent design system for storefront and admin surfaces.
- Reuse existing Spring Boot APIs where practical, adding backend endpoints only when current APIs cannot support the target behavior.
- Provide a storefront home page with search, category discovery, carousel/focus banners, promotional modules, recommendation sections, service promises, and product browsing.
- Use one customer login flow for both customers and administrators, exposing admin access only after role detection.
- Build a dashboard-first admin console with dense tables, filters, bulk-friendly interactions, and predictable forms.
- Introduce a payment provider model that can represent domestic and international providers while keeping mock payment executable for local development.
- Preserve a clear migration path: remove Vue-specific code, update scripts/dependencies, and verify replacement behavior end-to-end.

**Non-Goals:**

- Rewriting the Spring Boot backend from scratch.
- Implementing every real payment gateway in the first implementation pass.
- Creating a separate mobile app.
- Keeping the Vue/Vite frontend available in parallel after the replacement is complete.
- Building a purely Apple-style low-density showcase site that sacrifices commerce navigation and product discovery.

## Decisions

### Use Next.js App Router as the frontend foundation

Use Next.js App Router with TypeScript for route groups, nested layouts, server-aware data loading, and clean separation of storefront/admin surfaces.

Alternatives considered:

- Keep Vue/Vite and refactor in place: lower migration cost, but preserves the current fragmented architecture and visual system.
- Next.js Pages Router: stable but less aligned with modern Next.js layouts, route groups, and server/client composition.

Rationale: App Router supports a clean route structure for `(storefront)` and `(admin)`, shared layouts, loading states, error boundaries, and future SEO improvements for product pages.

### Use Tailwind CSS, shadcn/ui-style primitives, and lucide-react

Use Tailwind CSS for the design system, shadcn/ui-style component primitives for accessible UI patterns, and lucide-react for icons.

Alternatives considered:

- Continue Naive UI: familiar to the existing frontend, but tied to Vue and less suitable for a React/Next.js rewrite.
- Use a full React component suite such as Ant Design: strong tables, but harder to create a premium storefront aesthetic without fighting defaults.

Rationale: Tailwind plus composable primitives gives enough control to create the Apple-inspired storefront and dense SaaS admin console from one token system.

### Replace in place under `easymall-frontend/`

The implementation will replace the existing Vue/Vite package rather than creating a parallel `easymall-web` package.

Alternatives considered:

- Parallel app folder: safer for teams, but creates duplicate frontend build/runtime paths.

Rationale: This is a personal project, and the user explicitly prefers direct replacement. The implementation should still keep commits reviewable and avoid unrelated backend churn.

### Keep the Spring Boot API as the first backend contract

The Next.js app will consume current `/api/**` endpoints first. Backend changes should be additive and targeted.

Expected additive gaps:

- Payment provider list and payment initiation metadata.
- Admin dashboard summary metrics.
- Optional storefront content metadata for carousel/focus modules if static frontend configuration is not enough.

Rationale: Reusing backend APIs keeps the rewrite focused on frontend architecture and experience while still allowing precise backend improvements where required.

### Use client-side API calls for the first Next.js implementation

The first implementation will use browser-side API calls for authenticated storefront, order, payment, profile, and admin workflows. Server-side data fetching can be introduced later for public product/category pages when SEO or cache strategy becomes a priority.

Alternatives considered:

- Server-side fetching first: improves SEO potential, but complicates JWT/session handling because the current backend and frontend auth model are already browser-token oriented.
- Hybrid from day one: more flexible, but adds migration risk before the replacement frontend is stable.

Rationale: Client-side fetching matches the existing Spring Boot API and token behavior, keeps the direct replacement tractable, and leaves a clean upgrade path for public product SEO.

### Model authentication as one user session with role-aware capabilities

There will be one login screen and one user session. Admin access is unlocked when the authenticated user has the admin role. Admin routes must be guarded by role checks and must not require a separate admin login page.

Rationale: This matches the desired product behavior, removes confusing duplicated login surfaces, and keeps the storefront/admin transition natural.

### Separate payment provider selection from payment execution

The frontend will present a provider selection model and call backend payment APIs through a provider abstraction. Mock payment remains executable for development. Real providers can be displayed as available only when configuration and backend initiation support exist; otherwise they must render as unavailable or "coming soon" instead of pretending to process payment.

Provider families:

- Domestic: Alipay, WeChat Pay, UnionPay/Cloud QuickPass.
- International: Stripe, PayPal, Apple Pay, Google Pay.
- Development: Mock.

Rationale: Payment gateways differ in redirect, QR code, wallet sheet, callback, and verification behavior. A provider model keeps the UI consistent while allowing provider-specific execution.

### Design system direction

Storefront:

- Apple-inspired cleanliness, whitespace, high-quality product cards, restrained gradients, subtle shadows, and polished media treatment.
- JD/Taobao-inspired commerce density: prominent search, category discovery, carousel/focus banners, service promises, promotional modules, and product grids.
- Responsive by default, with mobile storefront treated as a first-class browsing experience.

Admin:

- Modern SaaS console, not marketing style.
- Dense scan-friendly pages with tables, filters, status chips, compact actions, side navigation, and dashboard summaries.
- Desktop first; tablet usable; phone layout must not break but does not need full power-user ergonomics.

## Risks / Trade-offs

- **[Risk] Direct replacement can temporarily remove working frontend behavior** -> Mitigation: keep the implementation task list ordered by shell, auth, storefront, commerce flows, admin, payment, verification; run typecheck/build frequently.
- **[Risk] Existing APIs may not support the desired dashboard or payment UI cleanly** -> Mitigation: start with adapter layers, static provider metadata, and honest empty/unavailable states; add backend endpoints only when required by a concrete UI flow.
- **[Risk] Payment scope can explode across providers** -> Mitigation: implement provider selection and mock execution first, define provider contracts, then add real providers in phased tasks.
- **[Risk] Storefront may become too sparse if Apple inspiration is over-applied** -> Mitigation: require category, carousel, recommendation, promotional, and product modules on the first screen/early scroll.
- **[Risk] Admin console may become too decorative** -> Mitigation: enforce dense SaaS patterns: compact tables, filters, status chips, stable action areas, and predictable forms.
- **[Risk] Next.js server/client boundaries may complicate auth token access** -> Mitigation: define a small auth/session layer early and use explicit client components where browser storage or interactive guards are required.

## Migration Plan

1. Snapshot current frontend features and routes that must be replaced.
2. Replace Vue/Vite dependencies and scripts with Next.js, React, Tailwind, component primitives, and tooling.
3. Create the Next.js route structure, layouts, design tokens, API client, auth session layer, and base providers.
4. Rebuild storefront browsing and commerce flows against existing backend APIs.
5. Rebuild admin console routes and CRUD flows against existing backend APIs.
6. Add payment provider selection and mock execution; render unconfigured real providers as unavailable and document real-provider extension points.
7. Remove Vue/Vite-only files and obsolete Naive UI code.
8. Run frontend typecheck/build, browser visual checks, and backend compile if backend changes are made.

Rollback strategy: use git to revert the replacement commit or branch if the new frontend fails acceptance. No database migration is required unless backend payment/dashboard additions are implemented.

## Open Questions

- Should carousel and promotional content be managed from the admin console in this change, or can the first Next.js implementation use static/configured modules?
- Which real payment provider should be implemented first after the mock/provider abstraction is working?
