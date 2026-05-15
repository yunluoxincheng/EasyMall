## Context

EasyMall 后端已有约 12 个单元测试文件（~2979 行），覆盖了订单状态机、库存锁定、支付幂等、积分幂等等核心模块的服务层。但存在以下不足：

1. **控制器层测试空白**：除 PaymentControllerTest 外，其他控制器没有测试
2. **服务层覆盖不均**：购物车、收藏、评论、签到、用户、商品、分类管理等模块缺少测试
3. **无集成测试**：缺少跨模块交易链路的端到端验证
4. **无 CI**：没有 GitHub Actions 工作流

当前数据库初始化依赖 Docker 挂载 `db/migration/*.sql` 到 MySQL 容器的 `docker-entrypoint-initdb.d`，测试基础设施使用 spring-boot-starter-test（JUnit 5 + Mockito）+ spring-security-test。

## Goals / Non-Goals

**Goals:**
- 引入 Flyway 数据库迁移，统一所有环境（dev/test/prod）的 schema 管理
- 引入 Testcontainers MySQL，集成测试使用真实 MySQL（非 H2），复用同一套迁移脚本
- 补全服务层缺失的单元测试（购物车、收藏、评论、签到、用户、商品、分类管理）
- 补全控制器层单元测试（MockMvc 方式）
- 添加核心交易链路集成测试：验证服务编排与幂等逻辑
- 添加 GitHub Actions CI 工作流
- 统一测试基础设施（通用配置、测试工具类、测试数据工厂）

**Non-Goals:**
- 不追求 100% 覆盖率，优先覆盖核心交易路径
- 不做前端端到端浏览器测试（Selenium/Cypress）
- 不做性能测试（JMeter/Gatling）
- 不做安全渗透测试
- 不重构现有测试代码
- 不修改 Docker 部署方案（Docker 环境仍然用 docker-entrypoint-initdb.d 挂载 SQL，与本地开发 Flyway 两种方式并存）

## Decisions

### 1. 测试策略：分层测试

**选择**: 服务层单元测试为主 + 控制器 MockMvc 测试 + 少量服务编排集成测试

**理由**:
- 服务层单元测试（Mock 依赖）执行快、易维护，覆盖业务逻辑
- 控制器 MockMvc 测试验证 HTTP 层（路由、参数绑定、响应格式）
- 集成测试仅覆盖跨模块服务编排——创建订单→锁定库存、支付回调→确认库存/优惠券、取消订单→释放库存/返还优惠券、确认收货→触发积分发放

**替代方案**:
- 全部集成测试：执行慢、维护成本高，不采用
- 只做单元测试：无法验证跨模块协作，核心链路需要集成测试

### 2. 集成测试范围：验证服务编排，不验证 MQ 投递

**选择**: 集成测试验证各 Service 之间的事务编排，MQ 消费者逻辑由独立单元测试覆盖。

**理由**:
- `confirmOrder()` 真实流程是：更新订单状态 → 发布 OrderCompletedEvent → MQ Consumer 接收事件 → 调用 PointsService 发放积分。MQ 被 mock 后，链路的 MQ 部分不会执行
- 集成测试验证 `confirmOrder()` 的事务部分（订单状态 → COMPLETED），使用 `@MockBean RabbitTemplate` 验证事件发布调用
- MQ 消费逻辑由 `OrderCompletedPointsConsumerTest` 独立测试覆盖
- 避免了"mock MQ 但 spec 要求验证异步积分"的矛盾

**替代方案（不采用）**: 引入 Testcontainers + RabbitMQ 容器。验证链路更真实，但显著增加 CI 复杂度和测试执行时间。

### 3. 数据库迁移：Flyway 统一管理

**选择**: Flyway 自动执行 `db/migration/V*__*.sql` 迁移脚本。

**理由**:
- 现有迁移脚本已按 Flyway 命名规范命名（`V1__Create_initial_tables.sql` ~ `V11__Add_points_biz_columns.sql`），零修改即可接入
- 与 Testcontainers MySQL 结合：Flyway 在测试启动时自动执行所有迁移，生成与生产一致的完整 schema
- 消除 H2 与 MySQL 语法差异风险（`ENGINE=InnoDB`、`ON UPDATE CURRENT_TIMESTAMP`、`SET NAMES utf8mb4`、`ON DUPLICATE KEY UPDATE` 等语法全部保留）
- 统一开发/测试/生产环境的 schema 管理方式

**Profile 策略**:
- `application.yml`：Flyway 默认关闭（`spring.flyway.enabled: false`），保持现有 Docker 挂载方式不受影响
- `application-dev.yml`：保持 Flyway 关闭，开发环境继续用 Docker SQL 挂载或手动初始化
- `application-test.yml`：Flyway 启用，搭配 Testcontainers 自动提供 MySQL，首次启动自动运行全部迁移

**替代方案**:
- Flyway 全局启用 + `baseline-on-migrate`：需要调整基线版本号，且与 Docker 挂载方式有冲突风险，不采用
- 继续用 H2 + 人工维护 `schema-h2.sql`：语法差异多，维护成本高，且测试数据库与生产不一致，不采用

### 4. 集成测试环境：Testcontainers MySQL + Flyway + Mock Redis/MQ

**选择**: Testcontainers 提供真实 MySQL 8 容器，Flyway 自动执行迁移，Redis 和 RabbitMQ 相关 Bean 全部使用 Mock。

**Mock 策略细节**:
- 项目自定义 `RabbitMqConfig` 声明了 `rabbitTemplate(ConnectionFactory, ...)` 和 `rabbitListenerContainerFactory(ConnectionFactory, ...)` Bean，两者都直接依赖 `ConnectionFactory`
- 仅 mock `RabbitTemplate` 不够——`RabbitMqConfig` 的所有 Bean 仍需一个 `ConnectionFactory` 才能完成依赖注入
- 正确做法：在 `BaseSpringBootTest` 中同时 `@MockBean ConnectionFactory` + `@MockBean RabbitTemplate` + `@MockBean StringRedisTemplate` + `@MockBean RedisConnectionFactory`
- `Mockito` 的 mock `ConnectionFactory` 不会尝试建立真实 TCP 连接，Bean 初始化安全通过
- `application-test.yml` 同时排除 `RabbitAutoConfiguration` + `RedisAutoConfiguration`，并设 `spring.rabbitmq.listener.simple.auto-startup: false`

**理由**:
- Testcontainers MySQL 即真实 MySQL，语法完全一致，迁移脚本零修改
- Flyway 自动建库建表，无需手动维护测试 schema
- Mock Bean 策略覆盖了项目自定义 MQ 配置的构造依赖，Spring 容器能安全启动
- GitHub Actions 支持 Docker，Testcontainers 可直接运行

**CI 适配**: GitHub Actions `ubuntu-latest` runner 自带 Docker，Testcontainers 通过 Ryuk 容器自动清理。

**替代方案**:
- Testcontainers 全真环境（MySQL + Redis + RabbitMQ）：过度工程化，Redis/MQ 额外容器增加启动时间和资源消耗
- 继续 H2：与生产 MySQL 差异大，必须维护两套 schema
- 仅 mock RabbitTemplate 不 mock ConnectionFactory：`RabbitMqConfig` 构造时会因缺少 `ConnectionFactory` Bean 而失败，Spring 容器无法启动

### 5. CI 平台：GitHub Actions

**选择**: GitHub Actions

**理由**:
- 项目托管在 GitHub，原生集成
- 免费额度充足
- `ubuntu-latest` runner 自带 Docker，支持 Testcontainers
- 社区生态丰富

### 6. 前端 CI：仅构建验证

**选择**: `npm run build` 验证前端可构建

**理由**:
- 前端目前没有测试框架配置
- 构建成功是最低限度的验证

## Risks / Trade-offs

- **[Testcontainers 首次拉取 MySQL 镜像耗时较长]** → CI 层缓存 Docker 镜像层；开发环境一次性拉取后本地复用
- **[Testcontainers MySQL 启动时间（~5-10s）]** → 使用 `@Testcontainers` + `static` 容器实例，同一测试类共享容器；集成测试数量控制
- **[`RabbitMqConfig` 依赖 `ConnectionFactory`，mock 不全会导致 Spring 容器启动失败]** → `BaseSpringBootTest` 统一 `@MockBean ConnectionFactory`，确保自定义 MQ Bean 能安全注入；`application-test.yml` 设 `auto-startup: false` 防止监听器容器尝试真实连接
- **[Mock Redis 不覆盖缓存真实行为]** → Redis 缓存测试由 `ProductCacheServiceTest` 独立覆盖
- **[Mock MQ 不覆盖消息投递可靠性]** → MQ 消费者逻辑由 `OrderTimeoutConsumerTest`、`OrderCompletedPointsConsumerTest` 独立覆盖
- **[CI 环境 Testcontainers 网络问题]** → 使用 `ubuntu-latest` runner，已验证支持 Testcontainers
- **[测试数量增加导致构建变慢]** → 单元测试控制在秒级，集成测试控制在分钟级
