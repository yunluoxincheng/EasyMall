
# AGENTS.md - EasyMall

B2C e-commerce: Spring Boot 4.0.1 (JDK 17) backend + Vue 3 / TypeScript frontend.

## Build & Run

```bash
# Backend (from easymall/)
mvn compile                         # compile
mvn test                            # all tests
mvn test -Dtest=ClassName#method    # single test
mvn spring-boot:run                 # run app (needs MySQL + Redis running)
mvn clean package -DskipTests       # package jar

# Frontend (from easymall-web/)
npm install
npm run dev                         # dev server on :5173, proxies /api → :8080
npm run typecheck                   # vue-tsc --noEmit (run before build)
npm run build                       # vue-tsc && vite build
```

**Verification order:** `typecheck` → `build` (frontend), `compile` → `test` (backend).

## Architecture

Two separate projects in one repo:
- **`easymall/`** — Spring Boot backend. Package: `org.ruikun`. Port 8080.
- **`easymall-web/`** — Vue 3 + Vite + TypeScript + **Naive UI** (not Element Plus) + Pinia. Port 5173.

Backend layers: `controller/` → `service/` → `mapper/` (MyBatis Plus). Entities → `entity/`, response DTOs → `vo/`, request DTOs → `dto/`.

**Quirk:** Two util packages exist — `org.ruikun.util` (TraceIdUtil) and `org.ruikun.utils` (JwtUtil).

### Docker

`docker-compose.yml` is in **`easymall/`**, not repo root. `.env` is also there.

```bash
cd easymall
docker-compose up -d                           # MySQL :3307, Redis :6379, App :8080
docker-compose -f docker-compose.yml -f docker-dev.yml up -d  # with hot reload
```

Production Dockerfile: `easymall/Dockerfile.production`. Docker Hub: `yunluoxincheng/easymall:latest`, `yunluoxincheng/easymall-mysql:init`.

## Conventions

### Backend

- All API responses wrapped in `Result<T>` (`org.ruikun.common.Result`)
- Error codes: `ResponseCode` enum. Throw `BusinessException` for business errors.
- Service interfaces named `I*Service`, implementations `*ServiceImpl`
- Constructor injection via Lombok `@RequiredArgsConstructor`
- Entities: `@Data`, `@TableName`, `@TableId(type = IdType.AUTO)`, `@TableLogic` for soft delete
- All tables have `id`, `create_time`, `update_time`, `deleted`
- DB migrations are plain SQL in `src/main/resources/db/migration/` — loaded by Docker init, **not** Flyway

### API paths & security

| Path pattern | Auth |
|---|---|
| `/api/user/login`, `/api/user/register` | Public |
| `/api/product/**`, `/api/category/**` | Public |
| `/api/admin/**` | ADMIN role (`@PreAuthorize("hasRole('ADMIN')")`) |
| Everything else | JWT required |

Admin controllers live in `controller/admin/` subpackage.

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
| `easymall/pom.xml` | Dependencies (Spring Boot 4.0.1, MyBatis Plus 3.5.15, jjwt 0.11.5) |
| `easymall/src/main/resources/application.yml` | Config (env vars for DB/Redis/JWT/file upload) |
| `easymall/src/main/java/org/ruikun/common/Result.java` | API response wrapper |
| `easymall/src/main/java/org/ruikun/common/ResponseCode.java` | Error codes enum |
| `easymall/src/main/java/org/ruikun/security/SecurityConfig.java` | Auth rules |
| `easymall-web/vite.config.ts` | Vite config with proxy |

## Gotchas

- Default admin credentials: `admin` / `admin123`
- Default MySQL password: `123456` (dev only)
- Search uses **MySQL FULLTEXT index + Redis cache** (5 min TTL), not Elasticsearch
- File uploads go to local filesystem (`/data/easymall/uploads`), configured via `FILE_UPLOAD_PATH` / `FILE_UPLOAD_URL` env vars
- `application.yml` uses env var fallbacks extensively (e.g. `${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/...}`)
- All responses and error messages are in Chinese
