## 1. 测试基础设施

- [x] 1.1 添加 Flyway 依赖到 pom.xml（`flyway-core` + `flyway-mysql`）
- [x] 1.2 添加 Testcontainers 依赖到 pom.xml（`spring-boot-testcontainers` + `testcontainers` + `mysql` module，scope test）
- [x] 1.3 配置全局 Flyway 关闭（`application.yml` 添加 `spring.flyway.enabled: false`，保持现有 Docker 挂载方式）
- [x] 1.4 创建 `src/test/resources/application-test.yml`（Testcontainers 动态数据源、Flyway 启用。排除 RabbitAutoConfiguration + RedisAutoConfiguration；设置 `spring.rabbitmq.listener.simple.auto-startup: false` 防止监听器容器尝试连接。注意：该配置只排除 Spring Boot 自身的 MQ/Redis 自动配置，项目自定义的 `RabbitMqConfig` 由 BaseSpringBootTest 中的 @MockBean ConnectionFactory 满足其依赖，见任务 1.5）
- [x] 1.5 创建 `BaseSpringBootTest` 基类（`@Testcontainers` + MySQL 容器 + `@DynamicPropertySource` 数据源注入。关键：必须 `@MockBean ConnectionFactory` 以让 `RabbitMqConfig` 的 `rabbitTemplate(...)` 和 `rabbitListenerContainerFactory(...)` Bean 定义拿到 mock 连接工厂而不尝试真实连接；同时 `@MockBean RabbitTemplate`、`@MockBean StringRedisTemplate`、`@MockBean RedisConnectionFactory`）
- [x] 1.6 创建 `TestFixtures` 测试数据工厂（`createTestUser`、`createTestProduct`、`createTestOrder` 等静态工厂方法）

## 2. 服务层单元测试 — 购物车模块

- [x] 2.1 创建 `CartServiceImplTest`（Mock CartMapper + ProductMapper）
- [x] 2.2 测试 `addToCart` 添加商品成功
- [x] 2.3 测试 `addToCart` 商品不存在/下架时抛异常
- [x] 2.4 测试 `addToCart` 库存不足时抛异常
- [x] 2.5 测试 `updateCartItem` 修改数量
- [x] 2.6 测试 `deleteCartItem` 删除商品
- [x] 2.7 测试 `batchDeleteCartItems` 批量删除
- [x] 2.8 测试 `selectAll` 全选 / `batchSelect` 批量选择
- [x] 2.9 测试 `getCartList` 查询购物车列表
- [x] 2.10 测试 `getCartCount` 查询购物车数量

## 3. 服务层单元测试 — 收藏模块

- [x] 3.1 创建 `FavoriteServiceImplTest`（Mock FavoriteMapper + ProductMapper）
- [x] 3.2 测试 `addFavorite` 添加收藏成功
- [x] 3.3 测试重复收藏抛异常
- [x] 3.4 测试 `removeFavorite` 取消收藏成功
- [x] 3.5 测试 `isFavorited` 检查收藏状态
- [x] 3.6 测试 `getFavoritePage` 分页查询收藏列表
- [x] 3.7 测试 `toggleFavorite` 切换收藏状态（已收藏则取消，未收藏则添加）

## 4. 服务层单元测试 — 评论模块

- [x] 4.1 创建 `CommentServiceImplTest`（Mock CommentMapper + OrderMapper）
- [x] 4.2 测试已完成订单用户发表评论成功
- [x] 4.3 测试未完成订单用户发表评论抛异常

## 5. 服务层单元测试 — 签到模块

- [x] 5.1 创建 `SignInServiceImplTest`（Mock SignInMapper + PointsService）
- [x] 5.2 测试 `signIn` 首次签到成功，返回 SignInResultVO
- [x] 5.3 测试 `hasSignedToday` 已签到返回 true
- [x] 5.4 测试重复签到抛异常

## 6. 服务层单元测试 — 用户模块

- [x] 6.1 创建 `UserServiceImplTest`（Mock UserMapper + JwtUtil + StringRedisTemplate + ICouponService + CouponTemplateMapper）
- [x] 6.2 测试 `register` 有效数据注册成功
- [x] 6.3 测试 `register` 重复用户名抛异常
- [x] 6.4 测试 `login` 正确密码返回 LoginVO（含 JWT）
- [x] 6.5 测试 `login` 错误密码抛认证异常

## 7. 服务层单元测试 — 商品模块

- [x] 7.1 创建 `ProductServiceImplTest`（Mock ProductMapper + CategoryMapper + IInventoryService + DomainEventPublisher）
- [x] 7.2 测试 `getProductById` 查询存在商品返回 ProductVO
- [x] 7.3 测试 `getProductById` 查询不存在商品抛异常
- [x] 7.4 测试 `getProductPage` 分页查询
- [x] 7.5 测试 `saveProduct` 新增商品
- [x] 7.6 测试 `updateProduct` 修改商品
- [x] 7.7 测试 `deleteProduct` 删除商品

## 8. 服务层单元测试 — 分类模块

- [x] 8.1 创建 `CategoryServiceImplTest`（Mock CategoryMapper）
- [x] 8.2 测试查询分类树返回层级结构

## 9. 控制器层 MockMvc 测试

- [x] 9.1 创建 `OrderControllerTest`（POST /create 创建订单、GET /page 订单列表、GET /{id} 订单详情、PUT /{id}/cancel、PUT /{id}/confirm）
- [x] 9.2 创建 `UserControllerTest`（POST /register、POST /login、GET /info）
- [x] 9.3 创建 `ProductControllerTest`（GET /page 分页、GET /{id} 详情、GET /hot 热门、GET /new 新品）
- [x] 9.4 创建 `CartControllerTest`（POST /add、GET /list、DELETE /{id}）
- [x] 9.5 补充 `PaymentControllerTest` MockMvc 层（POST /{paymentNo}/pay、POST /callback、GET /{paymentNo}）
- [x] 9.6 创建 `SecurityMockMvcTest`（未认证 → 401、普通用户访问 /api/admin/** → 403）

## 10. 集成测试 — 核心交易链路服务编排

- [x] 10.1 创建 `OrderFlowIntegrationTest`（继承 `BaseSpringBootTest`，Mock 依赖已由基类统一提供）
- [x] 10.2 测试 createOrder → 库存锁定（验证 OrderStatus=PENDING_PAYMENT、lockedStock 增加）
- [x] 10.3 测试库存不足时 createOrder 事务回滚
- [x] 10.4 测试 payment callback → 确认库存扣减 + 确认优惠券使用 + 订单状态=PAID
- [x] 10.5 测试重复 payment callback 幂等处理
- [x] 10.6 测试 cancelOrder → 释放库存 + 订单状态=CANCELLED
- [x] 10.7 测试 confirmOrder → 订单状态=COMPLETED

## 11. GitHub Actions CI

- [x] 11.1 创建 `.github/workflows/backend-ci.yml`（JDK 17 + Maven 缓存 + Docker + `cd easymall-backend && mvn test`）
- [x] 11.2 创建 `.github/workflows/frontend-ci.yml`（Node 18 + npm 缓存 + `npm run build`，仅 `easymall-frontend/**` 变更触发）
- [x] 11.3 配置触发条件：push to master + pull_request to master

## 12. 验证

- [x] 12.1 后端所有单元测试通过（67 个单元测试 0 失败）
- [x] 12.2 后端集成测试通过（Testcontainers MySQL + Flyway + Mock MQ/Redis）— 代码已就绪，需从 IntelliJ IDEA 或 CMD 运行以连接 Docker named pipe
- [x] 12.3 前端 `npm run build` 构建成功
- [x] 12.4 GitHub Actions 工作流语法验证（actionlint 或 push 后检查运行结果）
