
# AGENTS.md - EasyMall

B2C e-commerce: Spring Boot 4.0.1 (JDK 17) backend + Vue 3 / TypeScript frontend.

## Build & Run

```bash
# Backend (from easymall-backend/)
cd easymall-backend
mvn compile                         # compile
mvn test                            # all tests
mvn test -Dtest=ClassName#method    # single test
mvn spring-boot:run                 # run app (needs MySQL + Redis running)
mvn clean package -DskipTests       # package jar

# Frontend (from easymall-frontend/)
npm install
npm run dev                         # dev server on :5173, proxies /api → :8080
npm run typecheck                   # vue-tsc --noEmit (run before build)
npm run build                       # vue-tsc && vite build
```

**Verification order:** `typecheck` → `build` (frontend), `compile` → `test` (backend).

## Architecture

Two separate projects in one repo:
- **`easymall-backend/`** — Spring Boot backend. Package: `org.ruikun`. Port 8080.
- **`easymall-frontend/`** — Vue 3 + Vite + TypeScript + **Naive UI** (not Element Plus) + Pinia. Port 5173.

Backend uses **module-based package structure** under `org.ruikun.modules.{module}/`:

```
modules/
├── user/         # controller, dto, entity, mapper, service, vo
├── product/      # controller, dto, entity, mapper, service, vo
├── order/        # controller, dto, entity, mapper, service, vo
├── coupon/       # controller, dto, entity, mapper, service, task, vo
├── points/       # controller, dto, entity, mapper, service, vo
├── comment/      # controller, dto, entity, mapper, service, vo
├── favorite/     # controller, entity, mapper, service, vo
├── upload/       # controller, service, vo
└── admin/        # controller, dto, vo
```

Each module contains: `controller/` → `service/` → `mapper/` (MyBatis Plus). Entities → `entity/`, response DTOs → `vo/`, request DTOs → `dto/`.

Shared packages:
- `common/` — Result, ResponseCode, ErrorDetail, PageRequest, PageResult
- `enums/` — UserRole, OrderStatus, CouponType, etc.
- `exception/` — BusinessException, GlobalExceptionHandler
- `infrastructure/` — config (FileUploadProperties, MyBatisPlusConfig), security (SecurityConfig, JwtAuthenticationFilter, JwtUtil), TraceIdUtil

### Configuration

Three Spring profiles:
- `application.yml` — base config only (no env-specific values)
- `application-dev.yml` — dev defaults (localhost MySQL/Redis, SQL logging, devtools)
- `application-prod.yml` — env variable references only (no hardcoded secrets)

Activate via `SPRING_PROFILES_ACTIVE` env var (defaults to `dev`).

### Docker

All Docker files are in **`docker/`**:

```bash
cd docker
docker compose up -d                           # MySQL + Redis
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d  # with app + hot reload
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d  # production
```

Production Dockerfile: `docker/Dockerfile.production`. Docker Hub: `yunluoxincheng/easymall:latest`, `yunluoxincheng/easymall-mysql:init`.

## Conventions

### Backend

- All API responses wrapped in `Result<T>` (`org.ruikun.common.Result`)
- Error codes: `ResponseCode` enum. Throw `BusinessException` for business errors.
- Service interfaces named `I*Service`, implementations `*ServiceImpl` (in same `service/` package)
- Constructor injection via Lombok `@RequiredArgsConstructor`
- Entities: `@Data`, `@TableName`, `@TableId(type = IdType.AUTO)`, `@TableLogic` for soft delete
- All tables have `id`, `create_time`, `update_time`, `deleted`
- DB migrations are plain SQL in `src/main/resources/db/migration/` — loaded by Docker init, **not** Flyway
- `@MapperScan` lists all module mapper packages explicitly
- `type-aliases-package` lists all module entity packages

### API paths & security

| Path pattern | Auth |
|---|---|
| `/api/user/login`, `/api/user/register` | Public |
| `/api/product/**`, `/api/category/**` | Public |
| `/api/admin/**` | ADMIN role (`@PreAuthorize("hasRole('ADMIN')")`) |
| Everything else | JWT required |

Admin controllers live in `modules/admin/controller/` package.

### Frontend

- `<script setup>` + Composition API
- All API calls in `src/api/index.ts` as typed objects (e.g. `productApi`, `userApi`)
- Axios instance in `src/utils/request.ts`
- Types in `src/types/`
- Stores in `src/stores/` (Pinia, `use*Store` naming)
- CORS allowed origins: `localhost:5173`, `localhost:5174`

## Key Files

| File | Purpose |
|---|---|
| `easymall-backend/pom.xml` | Dependencies (Spring Boot 4.0.1, MyBatis Plus 3.5.15, jjwt 0.11.5) |
| `easymall-backend/src/main/resources/application.yml` | Base config (no env-specific values) |
| `easymall-backend/src/main/resources/application-dev.yml` | Dev defaults |
| `easymall-backend/src/main/resources/application-prod.yml` | Prod config (env vars only) |
| `easymall-backend/src/main/java/org/ruikun/common/Result.java` | API response wrapper |
| `easymall-backend/src/main/java/org/ruikun/common/ResponseCode.java` | Error codes enum |
| `easymall-backend/src/main/java/org/ruikun/infrastructure/security/SecurityConfig.java` | Auth rules |
| `docker/docker-compose.yml` | Base Docker Compose (MySQL + Redis) |
| `docker/docker-compose.dev.yml` | Dev Docker Compose override |
| `docker/docker-compose.prod.yml` | Prod Docker Compose |
| `.env.example` | Environment variable reference |
| `easymall-frontend/vite.config.ts` | Vite config with proxy |

## Gotchas

- Default admin credentials: `admin` / `admin123`
- Default MySQL password: `123456` (dev only, in `application-dev.yml`)
- Search uses **MySQL FULLTEXT index + Redis cache** (5 min TTL), not Elasticsearch
- File uploads go to local filesystem (`/data/easymall/uploads`), configured via `FILE_UPLOAD_BASE_PATH` / `FILE_UPLOAD_BASE_URL` env vars
- `application-prod.yml` has **no default values** for secrets — all must come from environment variables
- All responses and error messages are in Chinese
