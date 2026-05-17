## 1. Release Readiness Checklist

- [x] 1.1 Create a v2 release-readiness checklist document or section with backend, frontend, Docker, demo, docs, and limitation verification areas
- [x] 1.2 Record the supported verification environment, including Windows/PowerShell notes, JDK, Maven, Node, Docker, and Docker Compose assumptions
- [x] 1.3 Add expected commands, URLs, and pass/fail outcomes for every checklist item
- [x] 1.4 Add a release blocker table for failures discovered during verification
- [x] 1.5 Document demo data prerequisites and reset steps, including whether `test-data.sql` must be imported manually and where the default admin account comes from

## 2. Backend Verification

- [x] 2.1 Run backend compile/test verification from `easymall-backend/`
- [x] 2.2 Record Maven test result, total tests, failures, and any Testcontainers/Docker environment notes
- [x] 2.3 Investigate and fix small backend defects that block the existing v2 release flows
- [x] 2.4 Document any backend issue that is too large for this change as a follow-up proposal candidate

## 3. Frontend Verification

- [x] 3.1 Run frontend typecheck from `easymall-frontend/`
- [x] 3.2 Run frontend production build from `easymall-frontend/`
- [x] 3.3 Fix small TypeScript, route, API contract, or build defects that block the existing v2 demo
- [x] 3.4 Record frontend verification results and remaining risks

## 4. CI Verification

- [x] 4.1 Verify `.github/workflows/backend-ci.yml` exists and records the expected Maven test command
- [x] 4.2 Verify `.github/workflows/frontend-ci.yml` exists and records the expected frontend typecheck/build command sequence
- [x] 4.3 Verify backend and frontend workflow trigger conditions match the intended release-readiness coverage
- [x] 4.4 Record the most recent GitHub Actions backend/frontend workflow status when remote run history is available, or document why it cannot be checked locally

## 5. Docker Compose Verification

- [x] 5.1 Verify required environment variables against `.env.example` and `application-prod.yml`
- [x] 5.2 Run root Docker Compose build or document why a full build cannot be run in the current environment
- [x] 5.3 Start the root Docker Compose stack and verify frontend, backend, MySQL, Redis, and RabbitMQ health
- [x] 5.4 Verify frontend access through Nginx and API proxying through `/api/`
- [x] 5.5 Verify uploaded assets are served through `/uploads/` when an upload file exists
- [x] 5.6 Record Docker Compose verification commands, results, and any environment-specific notes

## 6. User Storefront Demo Verification

- [x] 6.1 Prepare or verify required demo data before storefront testing
- [x] 6.2 Verify user registration and login flow
- [x] 6.3 Verify product browsing, search/filter, product detail, and favorite actions
- [x] 6.4 Verify cart add/update/select/delete behavior
- [x] 6.5 Verify checkout, coupon selection, order creation, and simulated payment flow
- [x] 6.6 Verify order list/detail pages show the paid order state correctly
- [x] 6.7 Verify user center pages load for profile, coupons, points, member level, sign-in, favorites, and comments
- [x] 6.8 Record screenshots or concise evidence for the main storefront flow

## 7. Admin Console Demo Verification

- [x] 7.1 Prepare or verify required admin demo data before admin console testing
- [x] 7.2 Verify admin login with documented demo credentials
- [x] 7.3 Verify product and category management list/detail/form flows load correctly
- [x] 7.4 Verify order list/detail/status actions follow order state machine rules
- [x] 7.5 Verify user, coupon, member level, points product, and comment moderation pages load correctly
- [x] 7.6 Fix small admin frontend/backend mismatches that block the documented demo
- [x] 7.7 Record screenshots or concise evidence for the main admin flow

## 8. Documentation Reconciliation

- [x] 8.1 Review README for current project structure, stack names, startup commands, and v2 feature boundaries
- [x] 8.2 Review `docs/deployment.md` against the current root Docker Compose stack and environment variables
- [x] 8.3 Review `docs/demo.md` against the verified admin and user demo flows
- [x] 8.4 Review `docs/API.md` for payment, order, upload, and authentication examples that are stale or misleading
- [x] 8.5 Review business design docs for order, inventory, payment, MQ, coupon, and points consistency with current implementation
- [x] 8.6 Update docs with minimal corrections where verification finds drift

## 9. Known Boundaries and Next Proposals

- [x] 9.1 Document mock payment as the supported v2 payment channel and distinguish it from real third-party payment integration
- [x] 9.2 Document the current refund/after-sales boundary, including paid-order cancellation TODOs and recommended next proposal
- [x] 9.3 Document local development defaults such as dev database password and mock signature as non-production defaults
- [x] 9.4 Document Docker/Testcontainers assumptions for Windows local verification
- [x] 9.5 List recommended follow-up OpenSpec proposals with rationale, including refund/after-sales workflow and microservice migration evaluation

## 10. Final Status

- [x] 10.1 Run `openspec validate stabilize-v2-release-readiness --strict` and `openspec status --change stabilize-v2-release-readiness`
- [x] 10.2 Summarize verification results, fixes made, unresolved risks, and follow-up proposals
- [x] 10.3 Confirm EasyMall v2 release readiness state is documented and repeatable
