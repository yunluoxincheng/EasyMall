## 0. Prerequisites

- [x] 0.1 Expand `import org.ruikun.entity.*` in `OrderServiceImpl.java` to explicit imports
- [x] 0.2 Expand `import org.ruikun.mapper.*` in `OrderServiceImpl.java` to explicit imports
- [x] 0.3 Expand `import org.ruikun.entity.*` in `CouponServiceImpl.java` to explicit imports
- [x] 0.4 Expand `import org.ruikun.mapper.*` in `CouponServiceImpl.java` to explicit imports
- [x] 0.5 Verify project compiles after wildcard expansion

## 1. Repository Structure

- [x] 1.1 Rename `easymall/` to `easymall-backend/`
- [x] 1.2 Create `easymall-frontend/` directory with `.gitkeep`
- [x] 1.3 Create `docker/` directory
- [x] 1.4 Move `mysql/` into `docker/mysql/`
- [x] 1.5 Move `Dockerfile` and `Dockerfile.production` into `docker/`
- [x] 1.6 Move `docker-compose.yml` into `docker/docker-compose.yml` (base)
- [x] 1.7 Rename and move `docker-dev.yml` into `docker/docker-compose.dev.yml`
- [x] 1.8 Move `start.bat`, `start.sh` into `docker/`
- [x] 1.9 Move `push-docker-image.bat`, `push-docker-image.sh` into `docker/`
- [x] 1.10 Ensure backend `mvn spring-boot:run` starts from new location

## 2. Backend Package Structure

> **Migration order**: Move leaf/simple modules first, then the tightly-coupled batch (coupon/points/user), then order, comment, and admin last. Because this is a single Maven module, cross-module package references are valid Java — each move must update all imports globally, not just within the moved module.

### 2.1 Create directories

- [x] 2.1.1 Create `modules/` package under `org.ruikun`
- [x] 2.1.2 Create `modules/user/` with controller, dto, entity, mapper, service, vo subdirectories
- [x] 2.1.3 Create `modules/product/` with same structure
- [x] 2.1.4 Create `modules/order/` with same structure
- [x] 2.1.5 Create `modules/coupon/` with controller, dto, entity, mapper, service, task, vo subdirectories
- [x] 2.1.6 Create `modules/points/` with same structure
- [x] 2.1.7 Create `modules/comment/` with same structure
- [x] 2.1.8 Create `modules/favorite/` with same structure
- [x] 2.1.9 Create `modules/upload/` with controller, service, vo subdirectories
- [x] 2.1.10 Create `modules/admin/` with controller, dto, vo subdirectories
- [x] 2.1.11 Create `infrastructure/` with config, security subdirectories (no redis/ — Redis is auto-configured by Spring Boot)

### 2.2 Move product module files (leaf — standalone, no business dependencies)

- [x] 2.2.1 Move Product, Category entities → `modules/product/entity/`
- [x] 2.2.2 Move ProductMapper, CategoryMapper → `modules/product/mapper/`
- [x] 2.2.3 Move IProductService, ICategoryService → `modules/product/service/`
- [x] 2.2.4 Move ProductServiceImpl, CategoryServiceImpl → `modules/product/service/`
- [x] 2.2.5 Move ProductController, CategoryController → `modules/product/controller/`
- [x] 2.2.6 Move ProductDTO, CategoryDTO → `modules/product/dto/`
- [x] 2.2.7 Move ProductVO, CategoryVO → `modules/product/vo/`
- [x] 2.2.8 Update imports globally for moved product files

### 2.3 Move favorite module files (leaf — depends on user, product only)

- [x] 2.3.1 Move Favorite entity → `modules/favorite/entity/`
- [x] 2.3.2 Move FavoriteMapper → `modules/favorite/mapper/`
- [x] 2.3.3 Move IFavoriteService → `modules/favorite/service/`
- [x] 2.3.4 Move FavoriteServiceImpl → `modules/favorite/service/`
- [x] 2.3.5 Move FavoriteController → `modules/favorite/controller/`
- [x] 2.3.6 Move FavoriteVO → `modules/favorite/vo/`
- [x] 2.3.7 Update imports globally for moved favorite files

### 2.4 Move upload module files (leaf — standalone)

- [x] 2.4.1 Move FileUploadController → `modules/upload/controller/`
- [x] 2.4.2 Move FileStorageService, FileStorageServiceImpl → `modules/upload/service/`
- [x] 2.4.3 Move ImageUploadVO, MultiImageUploadVO → `modules/upload/vo/`
- [x] 2.4.4 Update imports globally for moved upload files

### 2.5 Move coupon + points + user as a batch (tightly coupled — mutual dependencies)

These three modules have cycles: user ↔ coupon, user ↔ points, user → points → coupon → user. Move them together and update all imports in one pass to avoid broken cross-references.

#### Coupon

- [x] 2.5.1 Move CouponTemplate, UserCoupon, CouponUsageLog entities → `modules/coupon/entity/`
- [x] 2.5.2 Move CouponTemplateMapper, UserCouponMapper, CouponUsageLogMapper → `modules/coupon/mapper/`
- [x] 2.5.3 Move ICouponService, ICouponAdminService → `modules/coupon/service/`
- [x] 2.5.4 Move CouponServiceImpl, CouponAdminServiceImpl → `modules/coupon/service/`
- [x] 2.5.5 Move CouponController → `modules/coupon/controller/`
- [x] 2.5.6 Move CouponTemplateDTO, CouponTemplateQueryDTO, CouponCalculateDTO → `modules/coupon/dto/`
- [x] 2.5.7 Move CouponTemplateVO, UserCouponVO, CouponCalculateResultVO, CouponUsageLogVO → `modules/coupon/vo/`
- [x] 2.5.8 Move CouponScheduledTask → `modules/coupon/task/`

#### Points

- [x] 2.5.9 Move PointsRecord, PointsProduct, PointsExchange entities → `modules/points/entity/`
- [x] 2.5.10 Move PointsRecordMapper, PointsProductMapper, PointsExchangeMapper → `modules/points/mapper/`
- [x] 2.5.11 Move IPointsService, IPointsExchangeService → `modules/points/service/`
- [x] 2.5.12 Move PointsServiceImpl, PointsExchangeServiceImpl → `modules/points/service/`
- [x] 2.5.13 Move PointsController, PointsExchangeController → `modules/points/controller/`
- [x] 2.5.14 Move PointsExchangeDTO → `modules/points/dto/`
- [x] 2.5.15 Move PointsRecordVO, PointsProductVO, PointsExchangeVO → `modules/points/vo/`

#### User

- [x] 2.5.16 Move User, UserSign, MemberLevel entities → `modules/user/entity/`
- [x] 2.5.17 Move UserMapper, UserSignMapper, MemberLevelMapper → `modules/user/mapper/`
- [x] 2.5.18 Move IUserService, IMemberService, ISignInService, IPriceService → `modules/user/service/`
- [x] 2.5.19 Move UserServiceImpl, MemberServiceImpl, SignInServiceImpl, PriceServiceImpl → `modules/user/service/` (flatten impl into service)
- [x] 2.5.20 Move UserController, MemberController, SignInController → `modules/user/controller/`
- [x] 2.5.21 Move UserLoginDTO, UserRegisterDTO, UserUpdateDTO → `modules/user/dto/`
- [x] 2.5.22 Move UserVO, LoginVO, MemberLevelVO, SignInResultVO → `modules/user/vo/`

#### Batch update

- [x] 2.5.23 Update imports globally for all three modules (coupon, points, user) in one pass
- [x] 2.5.24 Verify `mvn compile` passes after batch move

### 2.6 Move order module files (depends on user, product, coupon, points)

- [x] 2.6.1 Move Order, OrderItem, Cart entities → `modules/order/entity/`
- [x] 2.6.2 Move OrderMapper, OrderItemMapper, CartMapper → `modules/order/mapper/`
- [x] 2.6.3 Move IOrderService, ICartService → `modules/order/service/`
- [x] 2.6.4 Move OrderServiceImpl, CartServiceImpl → `modules/order/service/`
- [x] 2.6.5 Move OrderController, CartController → `modules/order/controller/`
- [x] 2.6.6 Move OrderCreateDTO, CartAddDTO, CartUpdateDTO → `modules/order/dto/`
- [x] 2.6.7 Move OrderVO, OrderItemVO, CartVO → `modules/order/vo/`
- [x] 2.6.8 Update imports globally for moved order files

### 2.7 Move comment module files (depends on user, order, points)

- [x] 2.7.1 Move Comment entity → `modules/comment/entity/`
- [x] 2.7.2 Move CommentMapper → `modules/comment/mapper/`
- [x] 2.7.3 Move ICommentService → `modules/comment/service/`
- [x] 2.7.4 Move CommentServiceImpl → `modules/comment/service/`
- [x] 2.7.5 Move CommentController → `modules/comment/controller/`
- [x] 2.7.6 Move CommentCreateDTO → `modules/comment/dto/`
- [x] 2.7.7 Move CommentVO → `modules/comment/vo/`
- [x] 2.7.8 Update imports globally for moved comment files

### 2.8 Move admin files (cross-cutting — depends on all business modules)

- [x] 2.8.1 Move all admin controllers (AdminUserController, AdminProductController, AdminCategoryController, AdminOrderController, AdminMemberLevelController, AdminPointsProductController, AdminCommentController, CouponAdminController) → `modules/admin/controller/`
- [x] 2.8.2 Move all admin DTOs → `modules/admin/dto/`
- [x] 2.8.3 Move all admin VOs → `modules/admin/vo/`
- [x] 2.8.4 Update imports globally for moved admin files

### 2.9 Move infrastructure files

- [x] 2.9.1 Move FileUploadProperties → `infrastructure/config/`
- [x] 2.9.2 Move MyBatisPlusConfig → `infrastructure/config/`
- [x] 2.9.3 Move SecurityConfig → `infrastructure/security/`
- [x] 2.9.4 Move JwtAuthenticationFilter → `infrastructure/security/`
- [x] 2.9.5 Move JwtUtil (from `utils/`) → `infrastructure/security/`
- [x] 2.9.6 Move TraceIdUtil (from `util/`) → `infrastructure/` root (request tracing, not security-related)
- [x] 2.9.7 Update imports globally for moved infrastructure files

### 2.10 Cleanup empty directories

- [x] 2.10.1 Delete empty `util/`, `utils/`, `task/` directories after move
- [x] 2.10.2 Delete empty `controller/`, `service/`, `service/impl/`, `mapper/`, `entity/`, `dto/`, `vo/` directories after move
- [x] 2.10.3 Delete empty `config/`, `security/` directories after move

### 2.11 Update configuration references

- [x] 2.11.1 Update `type-aliases-package` in MyBatis Plus config to list all module entity packages
- [x] 2.11.2 Update `mapper-locations` in application.yml if XML mapper paths change
- [x] 2.11.3 Verify `@ComponentScan` picks up all module packages (Spring Boot auto-scans `org.ruikun` and subdirectories, so this should work automatically)
- [x] 2.11.4 Update `@MapperScan` in `EasyMallApplication.java` from `"org.ruikun.mapper"` to all module mapper packages:
  ```
  @MapperScan({
      "org.ruikun.modules.user.mapper",
      "org.ruikun.modules.product.mapper",
      "org.ruikun.modules.order.mapper",
      "org.ruikun.modules.coupon.mapper",
      "org.ruikun.modules.points.mapper",
      "org.ruikun.modules.comment.mapper",
      "org.ruikun.modules.favorite.mapper"
  })
  ```

### 2.12 Update MyBatis XML mapper references

- [x] 2.12.1 Update XML mapper `namespace` values from `org.ruikun.mapper.XxxMapper` to `org.ruikun.modules.{module}.mapper.XxxMapper`
- [x] 2.12.2 Update XML resultMap `type` values from `org.ruikun.entity.Xxx` to `org.ruikun.modules.{module}.entity.Xxx`
- [x] 2.12.3 Verify all XML mappers load correctly after namespace/type update

## 3. Configuration

- [x] 3.1 Delete `application.properties` (redundant — only contains `spring.application.name`)
- [x] 3.2 Refactor `application.yml` to contain only base config (server, jackson, mybatis-plus base, logging, file upload constraints, `driver-class-name`, default profile `dev`)
- [x] 3.3 Create `application-dev.yml` with local dev defaults:
  - MySQL: `localhost:3306`, `root`, `123456`
  - Redis: `localhost`, no password, full lettuce pool config
  - JWT: dev secret
  - File upload: local paths
  - MyBatis SQL logging: `StdOutImpl`
  - Devtools: restart and livereload enabled
- [x] 3.4 Create `application-prod.yml` with env variable references only:
  - All sensitive values reference env variables WITHOUT defaults
  - No hardcoded secrets
  - Redis: include `database`, `timeout`, `lettuce pool` parameters (with safe defaults)
  - File upload: use `FILE_UPLOAD_BASE_PATH` / `FILE_UPLOAD_BASE_URL` (consistent with Docker Compose naming)
- [x] 3.5 Create `.env.example` at repository root with all required env variables documented (use `FILE_UPLOAD_BASE_PATH` / `FILE_UPLOAD_BASE_URL`)
- [x] 3.6 Add `spring.profiles.active: ${SPRING_PROFILES_ACTIVE:dev}` to base `application.yml`
- [x] 3.7 Verify dev profile starts locally with `mvn spring-boot:run -Dspring-boot.run.profiles=dev`

## 4. Docker

- [x] 4.1 Update Dockerfile `COPY` paths for new `easymall-backend/` location
- [x] 4.2 Update `docker-compose.yml` build context from `easymall/` to `easymall-backend/`
- [x] 4.3 Update `docker-compose.dev.yml` build context and ensure `SPRING_PROFILES_ACTIVE=dev` is set; devtools env vars only in dev compose
- [x] 4.4 Create `docker-compose.prod.yml` with `SPRING_PROFILES_ACTIVE=prod`; ensure Redis password is NOT hardcoded empty
- [x] 4.5 Ensure MySQL init scripts still work from `docker/mysql/`
- [x] 4.6 Ensure upload volume mount still works
- [x] 4.7 Update `start.bat`, `start.sh` paths if they reference old directory
- [x] 4.8 Verify `docker compose up -d` starts app, MySQL, Redis

## 5. Documentation

- [x] 5.1 Update root README to reflect new repository structure
- [x] 5.2 Update CLAUDE.md project section for new paths
- [x] 5.3 Update AGENTS.md for new package layout
- [x] 5.4 Update openspec/project.md if needed

## 6. Verification

- [x] 6.1 Backend `mvn compile` passes with no errors
- [x] 6.2 Backend `mvn spring-boot:run` starts successfully
- [x] 6.3 All existing API endpoints respond correctly
- [x] 6.4 `docker compose up -d` starts app, MySQL, Redis
- [x] 6.5 No hardcoded secrets in any config file (check `application.yml` base and `application-prod.yml`)
- [x] 6.6 `.env.example` provides clear guidance for local setup
- [x] 6.7 No empty leftover directories from old structure
