# v2-release-readiness Specification

## Purpose
TBD - created by archiving change stabilize-v2-release-readiness. Update Purpose after archive.
## Requirements
### Requirement: Release verification checklist

The system SHALL provide a v2 release-readiness checklist that covers backend tests, frontend typecheck/build, Docker Compose startup, health checks, core demo flows, documentation consistency, and known limitation tracking.

#### Scenario: Checklist exists

- **WHEN** a maintainer prepares the EasyMall v2 release
- **THEN** the repository contains a release-readiness checklist that lists all required verification areas
- **AND** each checklist item has a clear pass/fail outcome

#### Scenario: Checklist can be repeated

- **WHEN** a maintainer repeats the v2 release-readiness pass after later changes
- **THEN** the checklist provides enough commands, URLs, environment assumptions, and expected outcomes to run the verification again

### Requirement: CI workflow verification

The system SHALL verify that GitHub Actions workflow definitions exist and remain consistent with the local v2 verification commands.

#### Scenario: Workflow files are present

- **WHEN** a maintainer reviews release readiness
- **THEN** `.github/workflows/backend-ci.yml` and `.github/workflows/frontend-ci.yml` are checked for existence
- **AND** their trigger conditions are recorded

#### Scenario: Workflow commands match local verification

- **WHEN** a maintainer compares CI workflows with local verification steps
- **THEN** backend CI runs the same Maven test path expected by backend verification
- **AND** frontend CI runs the same typecheck and build path expected by frontend verification

#### Scenario: Recent workflow status is recorded when available

- **WHEN** the repository has accessible GitHub Actions run history
- **THEN** the most recent relevant backend and frontend workflow result is recorded
- **AND** unavailable remote status is documented without blocking local release-readiness verification

### Requirement: Backend verification

The system SHALL verify that the backend compiles and its tests pass in the supported local development environment.

#### Scenario: Backend tests pass

- **WHEN** a maintainer runs the backend verification command from `easymall-backend/`
- **THEN** Maven test execution completes successfully
- **AND** failures caused by local Docker/Testcontainers setup are documented with the required environment configuration

#### Scenario: Backend release blockers are recorded

- **WHEN** backend verification fails
- **THEN** the failing module, command, error summary, and proposed resolution are recorded before the release is marked ready

### Requirement: Frontend verification

The system SHALL verify that the Vue frontend typechecks and builds successfully.

#### Scenario: Frontend typecheck passes

- **WHEN** a maintainer runs the frontend typecheck command from `easymall-frontend/`
- **THEN** TypeScript and Vue type checking complete without errors

#### Scenario: Frontend build passes

- **WHEN** a maintainer runs the frontend production build command from `easymall-frontend/`
- **THEN** the Vite production build completes successfully

### Requirement: Docker Compose verification

The system SHALL verify that the root Docker Compose stack can build, start, and expose the expected services.

#### Scenario: Root stack starts successfully

- **WHEN** a maintainer starts the root Docker Compose stack with the documented environment variables
- **THEN** frontend, backend, MySQL, Redis, and RabbitMQ services start successfully
- **AND** services with health checks become healthy

#### Scenario: Nginx routes frontend and API traffic

- **WHEN** a user opens the configured frontend URL
- **THEN** the Vue application is served by Nginx
- **AND** requests under `/api/` are proxied to the backend service

#### Scenario: Uploaded assets are served

- **WHEN** an uploaded asset exists in the configured upload volume
- **THEN** the asset is accessible through the documented `/uploads/` URL path

### Requirement: Demo data prerequisites

The system SHALL define the data prerequisites and reset steps required for repeatable admin and user demo verification.

#### Scenario: Demo data source is documented

- **WHEN** a maintainer prepares demo verification
- **THEN** the checklist identifies whether required demo data comes from Flyway migrations, default seed records, manual SQL import, or user-created records during the demo
- **AND** non-versioned SQL files such as `test-data.sql` are not assumed to load automatically unless the instructions explicitly import them

#### Scenario: Demo reset steps are documented

- **WHEN** a maintainer repeats the demo verification after a previous run
- **THEN** the checklist explains whether existing data can be reused
- **AND** any required cleanup or reset steps are documented before the demo is marked repeatable

### Requirement: User storefront demo verification

The system SHALL verify the user-facing storefront demo flow from account access through order payment and user center views.

#### Scenario: User shopping flow works

- **WHEN** a user registers or logs in, browses products, adds an item to the cart, creates an order, and completes simulated payment
- **THEN** the user can view the resulting order in order history
- **AND** the order status reflects the payment outcome

#### Scenario: User center flows are reachable

- **WHEN** a logged-in user opens coupons, points, member level, favorites, comments, profile, and sign-in pages
- **THEN** each page loads without route, authentication, or API contract errors

### Requirement: Admin console demo verification

The system SHALL verify the admin console demo flow across the major management modules.

#### Scenario: Admin management pages load

- **WHEN** an administrator logs in and opens product, category, order, user, coupon, member level, points product, and comment moderation pages
- **THEN** each page loads successfully
- **AND** list APIs return data or an empty state without frontend runtime errors

#### Scenario: Admin order operations remain state-machine safe

- **WHEN** an administrator performs supported order status operations
- **THEN** legal transitions succeed
- **AND** illegal transitions are rejected according to the order state machine

### Requirement: Documentation consistency

The system SHALL keep release-facing documentation consistent with the current implementation.

#### Scenario: Documentation matches current stack

- **WHEN** a maintainer reviews README and docs before the v2 release
- **THEN** the documentation names the current backend, frontend, database, Redis, RabbitMQ, Docker, CI, and UI technologies accurately
- **AND** no release-facing document describes outdated project structure or removed startup commands as the primary path

#### Scenario: Demo documentation is executable

- **WHEN** a maintainer follows the demo guide from a clean checkout using documented prerequisites
- **THEN** the guide leads to a working admin and user demo without requiring undocumented manual steps

### Requirement: Known limitation tracking

The system SHALL document v2 boundaries and follow-up candidates before marking the release ready.

#### Scenario: V2 limitations are explicit

- **WHEN** a reader reviews the release-readiness output
- **THEN** mock payment, refund/after-sales status, local development defaults, Docker/Testcontainers assumptions, and microservice migration timing are explicitly documented

#### Scenario: Follow-up proposals are identified

- **WHEN** the v2 release-readiness pass is complete
- **THEN** the next recommended OpenSpec proposal candidates are listed with short rationale

