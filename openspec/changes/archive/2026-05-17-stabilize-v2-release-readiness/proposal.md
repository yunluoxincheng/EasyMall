## Why

EasyMall has completed the planned v2 roadmap across backend transaction flow, frontend apps, testing, documentation, and Docker deployment, but the completed work now needs one release-readiness pass to prove it is coherent as a runnable, demonstrable project.

This change creates a single acceptance boundary for the v2 modular-monolith release before starting larger follow-up work such as refund/after-sales workflows or microservice evaluation.

## What Changes

- Add a v2 release readiness checklist that verifies the repository can be built, started, tested, and demonstrated end to end.
- Validate CI workflow definitions and their consistency with local backend/frontend verification commands.
- Define demo data prerequisites and reset steps so admin/user demo flows are repeatable from a clean environment.
- Validate the Docker Compose one-command startup path for frontend, backend, MySQL, Redis, RabbitMQ, Nginx proxying, and uploaded assets.
- Validate the user storefront demo path: register/login, product browsing, cart, checkout, simulated payment, order history, coupons, points, favorites, comments, and profile pages.
- Validate the admin console demo path: admin login, product/category management, order management, coupon management, user/member management, points product management, and comment moderation.
- Reconcile documentation with the current implementation so README, deployment, demo, API, and business design docs do not describe stale behavior.
- Capture known v2 boundaries and follow-up candidates, including mock payment, refund TODOs, local dev defaults, and microservice migration timing.
- No breaking API or database changes are intended.

## Capabilities

### New Capabilities

- `v2-release-readiness`: Defines the release-readiness requirements for EasyMall v2, including verification evidence, demo flows, documentation consistency, and known limitation tracking.

### Modified Capabilities

- None.

## Impact

- Affected artifacts: root README, docs under `docs/`, demo checklist, deployment notes, and optional verification notes.
- Affected systems for validation: backend Maven tests, frontend typecheck/build, Docker Compose stack, GitHub Actions workflows, MySQL, Redis, RabbitMQ, frontend Nginx, and local upload static file serving.
- Affected code only if verification finds small defects that block the v2 release demo; this change is primarily a stabilization and release-readiness pass, not a new feature build.
