# Refactor Project Structure and Configuration

## Why

EasyMall has grown beyond the original course project structure. The current codebase uses a traditional layer-based package layout (`controller/`, `service/`, `mapper/`, `entity/` etc.) and while most configuration already supports environment variables, the project needs a cleaner modular structure before introducing order state machine, inventory locking, payment idempotency, MQ, and frontend integration.

The backend code currently lives under `easymall/` with package `org.ruikun` using a flat layer-based layout. This change reorganizes it into business-module packages and prepares the repository structure for the full roadmap.

## What Changes

- Rename `easymall/` directory to `easymall-backend/` for clarity.
- Create `easymall-frontend/` placeholder directory for the future Vue3 frontend.
- Move deployment-related files (`mysql/`, Dockerfiles, docker-compose files, start scripts) into a `docker/` directory.
- Reorganize backend packages from layer-based to module-based:
  - `modules/user/` — user, member level, sign-in, price (member discount)
  - `modules/product/` — product, category
  - `modules/order/` — order, order item, cart
  - `modules/coupon/` — coupon template, user coupon, coupon usage log, coupon scheduled task
  - `modules/points/` — points record, points product, points exchange
  - `modules/comment/` — comment
  - `modules/favorite/` — favorite
  - `modules/upload/` — file upload, file storage service
  - `common/` — Result, ResponseCode, ErrorDetail, PageRequest, PageResult
  - `infrastructure/` — file config, MyBatisPlus config, security (JwtAuthenticationFilter, SecurityConfig, JwtUtil), TraceIdUtil
- Split `application.yml` into `application.yml` (base) + `application-dev.yml` + `application-prod.yml`.
- Delete `application.properties` (redundant with `application.yml`).
- Move dev defaults (SQL logging via StdOutImpl, default password `123456`) into `application-dev.yml` only.
- Ensure `application-prod.yml` has no default secrets (env variables without defaults).
- Use `FILE_UPLOAD_BASE_PATH` / `FILE_UPLOAD_BASE_URL` consistently across all config files, Docker Compose, and `.env.example`.
- Add `spring.profiles.active: ${SPRING_PROFILES_ACTIVE:dev}` to base `application.yml`.
- Add `.env.example` at repository root.
- Update `@MapperScan` in `EasyMallApplication.java` from `"org.ruikun.mapper"` to all module mapper packages.
- Update MyBatis XML mapper `namespace` and resultMap `type` values to new FQCNs after package move.
- Update `type-aliases-package` in MyBatis Plus config to scan all module entity packages.
- Replace all wildcard imports on `org.ruikun.entity.*` and `org.ruikun.mapper.*` with explicit imports.
- Add devtools config (`spring.devtools.restart.enabled`, `spring.devtools.livereload.enabled`) only to `application-dev.yml` and dev Docker Compose, not base/prod.
- Rename Docker Compose files for consistency (`docker-compose.dev.yml`, `docker-compose.prod.yml`).
- Update Docker Compose to reflect new directory layout.
- Update README to document new project structure.

## Non-Goals

- No business logic rewrite.
- No database schema redesign.
- No MQ introduction.
- No microservice split.
- No frontend implementation beyond directory scaffold.
- No package rename (keep `org.ruikun` base package — renaming is high-risk with low value).

## Module Dependency Graph

```text
order   → user, product, coupon, points
coupon  → user
user    → coupon, points
points  → user, coupon
comment → user, order, points
favorite→ user, product
upload  → (standalone)
product → (standalone)
admin   → user, product, order, coupon, points, comment (services/entities/mappers)
```

All modules may depend on `common/` and `infrastructure/`.

Known existing cycles:
- `user` ↔ `coupon` (user issues coupons on signup/member upgrade; coupon validates user ownership)
- `user` ↔ `points` (sign-in adds points; points service reads user balance)
- `user` → `points` → `coupon` → `user` (transitive cycle)

This is a single Maven module; these package-level cycles do not block compilation. This change preserves existing behavior and does not attempt to break them.

## Impact

- **Project structure**: `easymall/` renamed to `easymall-backend/`; new `easymall-frontend/` and `docker/` directories
- **Backend packages**: reorganized from layer-based to module-based within `org.ruikun`
- **Configuration**: split into Spring profiles; verify env variable usage
- **Docker**: updated build contexts, paths, and file names
- **API paths**: no changes — all endpoints remain the same
