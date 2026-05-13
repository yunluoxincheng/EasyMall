# Spec: Project Restructure

## Overview

Reorganize the EasyMall repository from a flat course-project layout into a modular monolith structure with clear business boundaries, preparing for the full refactoring roadmap.

## Repository Structure

```text
EasyMall/
├── easymall-backend/       # Spring Boot application (renamed from easymall/)
├── easymall-frontend/      # Vue3 frontend placeholder (future Phase 7)
├── docker/                 # Docker and deployment files
├── docs/                   # Documentation
├── openspec/               # OpenSpec change management
├── .env.example            # Environment variable template
├── CLAUDE.md
├── AGENTS.md
└── README.md
```

## Backend Package Structure

Base package: `org.ruikun` (unchanged)

```text
org.ruikun/
├── EasyMallApplication.java
├── common/                 # Result, ResponseCode, ErrorDetail, PageRequest, PageResult
├── enums/                  # Shared enums (UserRole, OrderStatus, CouponStatus, CouponType, ImageType, PointsTypeEnum)
├── exception/              # GlobalExceptionHandler, BusinessException
├── infrastructure/
│   ├── config/             # FileUploadProperties, MyBatisPlusConfig
│   └── security/           # JwtAuthenticationFilter, SecurityConfig, JwtUtil
│   TraceIdUtil.java        # request tracing utility (in infrastructure root)
├── modules/
│   ├── user/               # User, UserSign, MemberLevel + IPriceService
│   ├── product/            # Product, Category
│   ├── order/              # Order, OrderItem, Cart
│   ├── coupon/             # CouponTemplate, UserCoupon, CouponUsageLog, CouponScheduledTask
│   ├── points/             # PointsRecord, PointsProduct, PointsExchange
│   ├── comment/            # Comment
│   ├── favorite/           # Favorite
│   ├── upload/             # FileUploadController, FileStorageService
│   └── admin/              # All admin controllers, DTOs, VOs
```

Each business module contains:
```text
modules/{module}/
├── controller/
├── dto/
├── entity/
├── mapper/
├── service/
└── vo/
```

### Module Entity Mapping

| Module | Entities |
|--------|----------|
| user | User, UserSign, MemberLevel |
| product | Product, Category |
| order | Order, OrderItem, Cart |
| coupon | CouponTemplate, UserCoupon, CouponUsageLog |
| points | PointsRecord, PointsProduct, PointsExchange |
| comment | Comment |
| favorite | Favorite |
| upload | (no entity — uses MultipartFile) |

### Module Dependencies

```text
order   → user, product, coupon, points
coupon  → user
user    → coupon, points
points  → user, coupon
comment → user, order, points
favorite→ user, product
product → (standalone)
upload  → (standalone)
admin   → user, product, order, coupon, points, comment (services/entities/mappers)
```

Known existing cycles (inherited from current behavior, do not block compilation in a single Maven module):
- `user` ↔ `coupon`
- `user` ↔ `points`
- `user` → `points` → `coupon` → `user`

## Configuration Profiles

- `application.yml` — base config (server port, Jackson, MyBatis Plus base settings, logging, file upload constraints, `driver-class-name`, default profile `dev`)
- `application-dev.yml` — local dev defaults (localhost MySQL/Redis, dev JWT secret, SQL logging enabled, devtools enabled)
- `application-prod.yml` — production (env variables only, NO default values for secrets, full Redis pool config, file upload uses `FILE_UPLOAD_BASE_PATH`/`FILE_UPLOAD_BASE_URL`)

`application.properties` is deleted (redundant).

Spring profile activation:
- Base `application.yml` sets `spring.profiles.active: ${SPRING_PROFILES_ACTIVE:dev}`
- Docker dev compose sets `SPRING_PROFILES_ACTIVE=dev`
- Docker prod compose sets `SPRING_PROFILES_ACTIVE=prod`

### MyBatis type-aliases-package

Must list all module entity packages explicitly:
```yaml
type-aliases-package: org.ruikun.modules.user.entity,org.ruikun.modules.product.entity,org.ruikun.modules.order.entity,org.ruikun.modules.coupon.entity,org.ruikun.modules.points.entity,org.ruikun.modules.comment.entity,org.ruikun.modules.favorite.entity
```

### MyBatis XML Mapper References

After package reorganization, XML mapper files MUST have their `namespace` and resultMap `type` updated:
- `namespace`: `org.ruikun.mapper.XxxMapper` → `org.ruikun.modules.{module}.mapper.XxxMapper`
- `type`: `org.ruikun.entity.Xxx` → `org.ruikun.modules.{module}.entity.Xxx`

### @MapperScan Update

`EasyMallApplication.java` must update `@MapperScan` from `"org.ruikun.mapper"` to all module mapper packages.

### Environment Variable Naming

File upload env vars use `FILE_UPLOAD_BASE_PATH` and `FILE_UPLOAD_BASE_URL` consistently across all config files, Docker Compose, and `.env.example`.

## Constraints

- API paths MUST NOT change — all endpoints remain under their current paths
- Base package `org.ruikun` MUST NOT change
- No business logic changes
- No database schema changes
- All wildcard imports on `org.ruikun.entity.*` and `org.ruikun.mapper.*` MUST be expanded to explicit imports before file moves
