# Design: Refactor Project Structure and Configuration

## Current State

### Repository Layout

```text
EasyMall/
├── easymall/              # Spring Boot backend
│   ├── src/main/java/org/ruikun/
│   │   ├── common/        # ErrorDetail, PageRequest, PageResult, ResponseCode, Result
│   │   ├── config/        # FileUploadProperties, MyBatisPlusConfig
│   │   ├── controller/    # 13 controllers
│   │   │   └── admin/     # 8 admin controllers
│   │   ├── dto/           # 13 DTOs
│   │   │   └── admin/     # 11 admin DTOs
│   │   ├── entity/        # 16 entities
│   │   ├── enums/         # 6 enums
│   │   ├── exception/     # BusinessException, GlobalExceptionHandler
│   │   ├── mapper/        # 16 mappers
│   │   ├── security/      # JwtAuthenticationFilter, SecurityConfig
│   │   ├── service/       # 15 interfaces
│   │   ├── service/impl/  # 15 implementations
│   │   ├── task/          # CouponScheduledTask
│   │   ├── util/          # TraceIdUtil
│   │   ├── utils/         # JwtUtil
│   │   ├── vo/            # 20 VOs
│   │   │   └── admin/     # 13 admin VOs
│   │   └── EasyMallApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application.properties    # redundant — only spring.application.name
│   │   ├── mapper/                   # MyBatis XML
│   │   └── db/                       # SQL init scripts
│   ├── Dockerfile
│   ├── Dockerfile.production
│   ├── docker-compose.yml
│   ├── docker-dev.yml
│   ├── mysql/
│   ├── uploads/
│   └── pom.xml
├── openspec/
├── docs/
├── CLAUDE.md
├── README.md
└── AGENTS.md
```

### Current Entities (16)

| Entity | Current Package |
|--------|----------------|
| User | entity |
| UserSign | entity |
| MemberLevel | entity |
| Product | entity |
| Category | entity |
| Order | entity |
| OrderItem | entity |
| Cart | entity |
| CouponTemplate | entity |
| UserCoupon | entity |
| CouponUsageLog | entity |
| PointsRecord | entity |
| PointsProduct | entity |
| PointsExchange | entity |
| Comment | entity |
| Favorite | entity |

Note: There is **no** Address entity in the current codebase.

### Wildcard Imports (Must Be Expanded)

Two files use wildcard imports on `org.ruikun` packages:

| File | Wildcard Imports |
|------|-----------------|
| `OrderServiceImpl.java` | `org.ruikun.entity.*`, `org.ruikun.mapper.*` |
| `CouponServiceImpl.java` | `org.ruikun.entity.*`, `org.ruikun.mapper.*` |

These MUST be expanded to explicit imports before module reorganization, because the wildcard will silently stop resolving classes that move to new packages.

## Target State

### Repository Layout

```text
EasyMall/
├── easymall-backend/              # renamed from easymall/
│   ├── src/main/java/org/ruikun/
│   │   ├── EasyMallApplication.java
│   │   ├── common/                # ErrorDetail, PageRequest, PageResult, ResponseCode, Result
│   │   ├── enums/                 # shared enums (UserRole, ImageType, etc.)
│   │   ├── exception/             # GlobalExceptionHandler, BusinessException
│   │   ├── infrastructure/
│   │   ├── config/                # FileUploadProperties, MyBatisPlusConfig
│   │   ├── security/              # JwtAuthenticationFilter, SecurityConfig, JwtUtil
│   │   └── TraceIdUtil.java       # request tracing utility
│   │   ├── modules/
│   │   │   ├── user/
│   │   │   │   ├── controller/    # UserController, MemberController, SignInController
│   │   │   │   ├── dto/           # UserLoginDTO, UserRegisterDTO, UserUpdateDTO
│   │   │   │   ├── entity/        # User, UserSign, MemberLevel
│   │   │   │   ├── mapper/        # UserMapper, UserSignMapper, MemberLevelMapper
│   │   │   │   ├── service/       # IUserService, IMemberService, ISignInService, IPriceService
│   │   │   │   └── vo/            # UserVO, LoginVO, MemberLevelVO, SignInResultVO
│   │   │   ├── product/
│   │   │   │   ├── controller/    # ProductController, CategoryController
│   │   │   │   ├── dto/           # ProductDTO, CategoryDTO
│   │   │   │   ├── entity/        # Product, Category
│   │   │   │   ├── mapper/        # ProductMapper, CategoryMapper
│   │   │   │   ├── service/       # IProductService, ICategoryService
│   │   │   │   └── vo/            # ProductVO, CategoryVO
│   │   │   ├── order/
│   │   │   │   ├── controller/    # OrderController, CartController
│   │   │   │   ├── dto/           # OrderCreateDTO, CartAddDTO, CartUpdateDTO
│   │   │   │   ├── entity/        # Order, OrderItem, Cart
│   │   │   │   ├── mapper/        # OrderMapper, OrderItemMapper, CartMapper
│   │   │   │   ├── service/       # IOrderService, ICartService
│   │   │   │   └── vo/            # OrderVO, OrderItemVO, CartVO
│   │   │   ├── coupon/
│   │   │   │   ├── controller/    # CouponController
│   │   │   │   ├── dto/           # CouponTemplateDTO, CouponTemplateQueryDTO, CouponCalculateDTO
│   │   │   │   ├── entity/        # CouponTemplate, UserCoupon, CouponUsageLog
│   │   │   │   ├── mapper/        # CouponTemplateMapper, UserCouponMapper, CouponUsageLogMapper
│   │   │   │   ├── service/       # ICouponService, ICouponAdminService
│   │   │   │   ├── task/          # CouponScheduledTask
│   │   │   │   └── vo/            # CouponTemplateVO, UserCouponVO, CouponCalculateResultVO, CouponUsageLogVO
│   │   │   ├── points/
│   │   │   │   ├── controller/    # PointsController, PointsExchangeController
│   │   │   │   ├── dto/           # PointsExchangeDTO
│   │   │   │   ├── entity/        # PointsRecord, PointsProduct, PointsExchange
│   │   │   │   ├── mapper/        # PointsRecordMapper, PointsProductMapper, PointsExchangeMapper
│   │   │   │   ├── service/       # IPointsService, IPointsExchangeService
│   │   │   │   └── vo/            # PointsRecordVO, PointsProductVO, PointsExchangeVO
│   │   │   ├── comment/
│   │   │   │   ├── controller/    # CommentController
│   │   │   │   ├── dto/           # CommentCreateDTO
│   │   │   │   ├── entity/        # Comment
│   │   │   │   ├── mapper/        # CommentMapper
│   │   │   │   ├── service/       # ICommentService
│   │   │   │   └── vo/            # CommentVO
│   │   │   ├── favorite/
│   │   │   │   ├── controller/    # FavoriteController
│   │   │   │   ├── entity/        # Favorite
│   │   │   │   ├── mapper/        # FavoriteMapper
│   │   │   │   ├── service/       # IFavoriteService
│   │   │   │   └── vo/            # FavoriteVO
│   │   │   └── upload/
│   │   │       ├── controller/    # FileUploadController
│   │   │       ├── service/       # FileStorageService
│   │   │       └── vo/            # ImageUploadVO, MultiImageUploadVO
│   │   └── modules/admin/         # all admin controllers, DTOs, VOs
│   │       ├── controller/        # AdminUserController, AdminProductController, etc.
│   │       ├── dto/               # all admin DTOs
│   │       └── vo/                # all admin VOs
│   ├── src/main/resources/
│   │   ├── application.yml        # base config only
│   │   ├── application-dev.yml    # dev defaults (SQL logging, localhost, dev secrets)
│   │   ├── application-prod.yml   # env variables, no defaults for secrets
│   │   ├── mapper/                # MyBatis XML (may keep flat or mirror modules)
│   │   └── db/                    # SQL init scripts
│   └── pom.xml
├── easymall-frontend/             # placeholder for Vue3 frontend
│   └── .gitkeep
├── docker/
│   ├── mysql/                     # MySQL init scripts
│   ├── Dockerfile
│   ├── Dockerfile.production
│   ├── docker-compose.yml         # base (MySQL + Redis)
│   ├── docker-compose.dev.yml     # dev overrides
│   └── docker-compose.prod.yml    # production config
├── docs/
├── openspec/
├── .env.example
├── CLAUDE.md
├── AGENTS.md
└── README.md
```

### Module Mapping — Complete

| Module | Entities | Mappers | Services | Controllers (User) | Controllers (Admin) |
|--------|----------|---------|----------|--------------------|--------------------|
| user | User, UserSign, MemberLevel | UserMapper, UserSignMapper, MemberLevelMapper | IUserService, IMemberService, ISignInService, IPriceService | UserController, MemberController, SignInController | AdminUserController, AdminMemberLevelController |
| product | Product, Category | ProductMapper, CategoryMapper | IProductService, ICategoryService | ProductController, CategoryController | AdminProductController, AdminCategoryController |
| order | Order, OrderItem, Cart | OrderMapper, OrderItemMapper, CartMapper | IOrderService, ICartService | OrderController, CartController | AdminOrderController |
| coupon | CouponTemplate, UserCoupon, CouponUsageLog | CouponTemplateMapper, UserCouponMapper, CouponUsageLogMapper | ICouponService, ICouponAdminService | CouponController | CouponAdminController |
| points | PointsRecord, PointsProduct, PointsExchange | PointsRecordMapper, PointsProductMapper, PointsExchangeMapper | IPointsService, IPointsExchangeService | PointsController, PointsExchangeController | AdminPointsProductController |
| comment | Comment | CommentMapper | ICommentService | CommentController | AdminCommentController |
| favorite | Favorite | FavoriteMapper | IFavoriteService | FavoriteController | — |
| upload | — (uses MultipartFile) | — | FileStorageService | FileUploadController | — |

### IPriceService Rationale

`IPriceService` calculates member discount prices by looking up a user's member level and applying a discount rate. Since it primarily depends on `User` and `MemberLevel`, it belongs in the **user** module.

### Admin Controller/DTO/VO Placement

Admin is a cross-cutting adapter module. In this structure-only change, admin controllers may continue depending on business module services, entities, and mappers to avoid business logic rewrite. For example, `AdminMemberLevelController` directly uses `MemberLevelMapper` and `MemberLevel`; `AdminProductController` uses `ProductMapper`, `CategoryMapper`, and their entities; `AdminOrderController` uses `OrderMapper`, `OrderItemMapper`, `UserMapper`. A later cleanup can move direct mapper access behind admin services.

### Module Dependency Graph

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

Key dependency edges:
- `order` → `user` (user info, member discount via IPriceService)
- `order` → `product` (stock deduction, product info)
- `order` → `coupon` (coupon validation and usage)
- `order` → `points` (add points on order completion)
- `coupon` → `user` (UserMapper for coupon ownership)
- `user` → `coupon` (UserServiceImpl/MemberServiceImpl: issue new-user/member coupons)
- `user` → `points` (SignInServiceImpl: add sign-in points)
- `points` → `user` (UserMapper for points balance)
- `points` → `coupon` (PointsExchangeServiceImpl: exchange points for coupons)
- `comment` → `user` (user info)
- `comment` → `order` (validate order ownership and completion before commenting)
- `comment` → `points` (award points for commenting)
- `favorite` → `user`, `product`
- `admin` → all business modules (directly accesses services, entities, and mappers — see Admin section)

Known existing cycles:
- `user` ↔ `coupon` (user issues coupons on signup/member upgrade; coupon validates user ownership)
- `user` ↔ `points` (sign-in adds points; points service reads user balance)
- `user` → `points` → `coupon` → `user` (transitive cycle)

This is a package-level modular monolith within a single Maven module. These service-level cycles are inherited from existing behavior and do not block compilation. This change does not attempt to break them; they should be addressed in a later domain cleanup.

### Configuration Split

**application.yml** (base — no environment-specific values):
```yaml
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}

server:
  port: ${SERVER_PORT:8080}

spring:
  application:
    name: EasyMall
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: GMT+8
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: org.ruikun.modules.user.entity,org.ruikun.modules.product.entity,org.ruikun.modules.order.entity,org.ruikun.modules.coupon.entity,org.ruikun.modules.points.entity,org.ruikun.modules.comment.entity,org.ruikun.modules.favorite.entity
  configuration:
    map-underscore-to-camel-case: true
  global-config:
    db-config:
      id-type: auto
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0

file:
  upload:
    max-size: 5242880
    allowed-types:
      - image/jpeg
      - image/jpg
      - image/png
      - image/gif

logging:
  level:
    org.ruikun: ${LOG_LEVEL:info}
    org.springframework.security: ${LOG_LEVEL_SECURITY:warn}
```

**application-dev.yml**:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/easymall?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: 123456
  data:
    redis:
      host: localhost
      port: 6379
      password:
      database: 0
      lettuce:
        pool:
          max-active: 8
          max-wait: -1ms
          max-idle: 8
          min-idle: 0
      timeout: 30000ms
  devtools:
    restart:
      enabled: true
    livereload:
      enabled: true

mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

jwt:
  secret: easymall-jwt-secret-key-2023-very-long-secret-key-for-hmac-sha256-algorithm-requirement-256-bits
  expiration: 86400000

file:
  upload:
    base-path: /data/easymall/uploads
    base-url: http://localhost:8080/uploads
```

**application-prod.yml**:
```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
  data:
    redis:
      host: ${SPRING_DATA_REDIS_HOST}
      port: ${SPRING_DATA_REDIS_PORT}
      password: ${SPRING_DATA_REDIS_PASSWORD}
      database: ${SPRING_DATA_REDIS_DATABASE:0}
      timeout: ${SPRING_DATA_REDIS_TIMEOUT:30000ms}
      lettuce:
        pool:
          max-active: ${SPRING_DATA_REDIS_LETTUCE_POOL_MAX_ACTIVE:8}
          max-wait: ${SPRING_DATA_REDIS_LETTUCE_POOL_MAX_WAIT:-1ms}
          max-idle: ${SPRING_DATA_REDIS_LETTUCE_POOL_MAX_IDLE:8}
          min-idle: ${SPRING_DATA_REDIS_LETTUCE_POOL_MIN_IDLE:0}

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:86400000}

file:
  upload:
    base-path: ${FILE_UPLOAD_BASE_PATH}
    base-url: ${FILE_UPLOAD_BASE_URL}
```

Note: `application-prod.yml` has **no default values** for secrets — they MUST come from environment variables.

## Migration Strategy

1. Expand all wildcard imports on `org.ruikun.*` to explicit imports (2 files).
2. Rename directory: `easymall/` → `easymall-backend/`.
3. Create module directories under `modules/`.
4. Move files module by module (one commit per module for easy rollback):
   - **Leaf/simple modules first**: product, favorite, upload (standalone or only depend on other modules)
   - **Tightly coupled batch**: coupon, points, user (these have mutual dependencies — move as a batch and update imports together)
   - order module (depends on user, product, coupon, points)
   - comment module (depends on user, order, points)
   - admin group last (depends on all)
   > Note: Because this is a single Maven module, cross-module package references are valid Java. Each move must update all imports globally, not just within the moved module.
5. Move infrastructure files (Redis config, security, utils).
6. Update `@MapperScan` in `EasyMallApplication` from `org.ruikun.mapper` to all module mapper packages (or `org.ruikun.modules.**.mapper`).
7. Update MyBatis XML mapper `namespace` values to new mapper FQCNs (e.g. `org.ruikun.modules.product.mapper.ProductMapper`).
8. Update MyBatis XML resultMap `type` values to new entity FQCNs (e.g. `org.ruikun.modules.product.entity.Product`).
9. Split configuration files; delete `application.properties`.
10. Move Docker files to `docker/`; rename compose files.
11. Create `easymall-frontend/` placeholder.
12. Create `.env.example`.
13. Verify build and startup.

## Risks

- **Package rename**: We keep `org.ruikun` base package to avoid breaking MyBatis aliases, component scans, and imports.
- **MyBatis type-aliases-package**: MUST be updated to list all module entity packages. If a new module is added later, this list must be updated. Alternative: use `org.ruikun.modules` with recursive scanning if MyBatis Plus supports it.
- **Wildcard imports**: `OrderServiceImpl` and `CouponServiceImpl` use `import org.ruikun.entity.*` and `import org.ruikun.mapper.*`. These MUST be expanded to explicit imports before moving files, or they will silently resolve to empty sets.
- **Git history**: Moving files makes `git blame` harder. Use `git log --follow` for individual files.
- **IDE indexing**: Full reimport may be needed after restructuring.
- **Docker paths**: Build context, volume mounts, and compose file names need updating.
- **Mapper XML location**: If XML mapper files are reorganized, `mapper-locations` in `application.yml` must be updated. Keeping them flat under `mapper/` is simpler.
- **MyBatis XML namespace/type**: XML mapper files reference mapper interfaces and entity classes by FQCN. After package reorganization, `namespace` and `resultMap type` values MUST be updated to new FQCNs or MyBatis binding will fail at startup.
- **@MapperScan**: Currently `@MapperScan("org.ruikun.mapper")`. After module reorganization, mappers are under `org.ruikun.modules.{module}.mapper`. This annotation MUST be updated.
- **Spring profile activation**: Base `application.yml` defaults to `profiles.active: ${SPRING_PROFILES_ACTIVE:dev}`. Docker Compose files must explicitly set `SPRING_PROFILES_ACTIVE`. Dev Compose uses `dev`; prod Compose uses `prod`.
- **Environment variable naming**: File upload env vars must be consistent across all config files, Docker Compose, and `.env.example`. Use `FILE_UPLOAD_BASE_PATH` and `FILE_UPLOAD_BASE_URL` (matching Docker Compose naming).
- **Devtools**: `spring.devtools.restart.enabled` and `spring.devtools.livereload.enabled` are dev-only settings and must only appear in `application-dev.yml` and `docker-compose.dev.yml`, not in base/prod configs.
