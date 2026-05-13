# EasyMall 后续重构计划（OpenSpec 提案路线图版）

> 适用项目：EasyMall B2C 电子商城系统  
> 目标：将原课程结课作业项目逐步升级为可展示、可维护、可扩展、具备真实电商交易链路设计的 Java 后端商城项目。  
> 建议使用方式：将本文作为阶段路线图，每个阶段拆成一个或多个 OpenSpec 变更提案，避免一次性大改。  
> 风格参考：SafeVault 后续开发计划的“阶段路线图 + OpenSpec 提案 + tasks.md + 验收标准”形式。

---

## 1. 总体目标

EasyMall 当前已经具备用户、商品、购物车、订单、会员等级、积分、签到、积分兑换、评论、收藏、优惠券、后台管理、Redis 缓存、Docker 部署等基础能力。

下一阶段不建议直接推倒重写，也不建议一开始就拆微服务，而应围绕“真实电商交易链路”和“工程化可展示”推进。

重构后的 EasyMall 应具备以下特征：

- 前后端分离
- 模块化单体后端
- Vue3 管理端与用户端
- Spring Boot 后端
- MySQL 数据库
- Redis 缓存
- RabbitMQ / RocketMQ 消息队列
- 订单状态机
- 库存锁定模型
- 支付单与支付幂等
- MQ 延迟关单
- 优惠券生命周期管理
- 积分流水与幂等
- Docker Compose 一键启动
- OpenAPI / Knife4j 接口文档
- 架构文档、数据库文档、核心流程文档
- 可用于简历、毕设、作品集展示

最终项目定位：

```text
EasyMall：基于 Spring Boot + Redis + MQ 的企业级 B2C 商城系统
```

---

## 2. 当前阶段判断

当前 EasyMall 已经超过普通 CRUD 课程项目，但还没有达到真正“企业级商城项目”的状态。

当前优势：

- 业务模块比较完整
- 已有会员、积分、优惠券等营销能力
- 已有后台管理模块
- 已使用 Spring Security + JWT
- 已使用 Redis 缓存
- 已支持 Docker Compose 启动
- 已有 API 文档和部署文档基础

当前优先解决的问题：

- 包结构仍是传统三层结构，业务边界不够清晰
- 订单状态流转没有独立状态机
- 下单时直接扣商品库存，缺少锁定库存模型
- 支付逻辑偏模拟，缺少支付单和回调幂等
- 缺少 MQ，订单超时关闭、积分发放、缓存同步等未事件化
- 优惠券缺少完整状态机
- 积分发放缺少业务幂等约束
- 配置中存在硬编码，如 JWT secret、数据库密码、文件 URL、服务器 IP
- 前端缺失，项目展示能力不足
- 微服务化时机尚未成熟

当前最合理的方向：

```text
课程项目版 EasyMall
    ↓
模块化单体企业版 EasyMall v2
    ↓
轻量微服务版 EasyMall v3
```

---

## 3. 分阶段重构路线

推荐分为 8 个阶段推进。

```text
阶段 1：工程结构与配置安全化
阶段 2：订单状态机与交易主流程重构
阶段 3：库存锁定模型重构
阶段 4：支付单与支付幂等重构
阶段 5：MQ 事件驱动与延迟关单
阶段 6：优惠券与积分生命周期固化
阶段 7：前端工程与全栈展示能力建设
阶段 8：文档、测试、部署与项目包装
```

微服务作为后续增强阶段：

```text
阶段 9：轻量微服务演进，可选
```

---

# 阶段 1：工程结构与配置安全化

## 1.1 阶段目标

先不改核心业务逻辑，优先整理项目结构和配置方式，让项目具备长期重构基础。

本阶段完成后，EasyMall 应从“课程作业型目录结构”升级为“前后端分离 + 模块化单体基础结构”。

推荐最终仓库结构：

```text
EasyMall/
├── easymall-backend/
├── easymall-frontend/
├── docs/
├── docker/
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

## 1.2 建议 OpenSpec 变更提案

建议创建：

```text
openspec/changes/refactor-project-structure-and-config/
```

### proposal.md 建议目标

```md
# Refactor Project Structure and Configuration

## Why

EasyMall has grown beyond the original course project structure. The current codebase uses a traditional layer-based package layout and contains several hard-coded environment-specific settings. Before introducing transaction workflow, inventory locking, MQ, and frontend integration, the project needs a cleaner structure and safer configuration model.

## What Changes

- Move backend code into `easymall-backend`.
- Add `easymall-frontend` placeholder directory for Vue3 frontend.
- Reorganize backend packages by business module.
- Split configuration into dev/prod profiles.
- Replace hard-coded secrets, database settings, and file URLs with environment variables.
- Add `.env.example`.
- Prepare Docker Compose layout for backend, frontend, MySQL, Redis, and future MQ.

## Non-Goals

- No business logic rewrite.
- No database schema redesign.
- No MQ introduction.
- No microservice split.
- No frontend implementation beyond initial directory scaffold.
```

## 1.3 tasks.md 建议内容

```md
## 1. Repository Structure

- [ ] 1.1 Create `easymall-backend/`
- [ ] 1.2 Move current Spring Boot project into `easymall-backend/`
- [ ] 1.3 Create `easymall-frontend/` placeholder
- [ ] 1.4 Move deployment-related files into `docker/` where appropriate
- [ ] 1.5 Ensure existing backend can still start after path changes

## 2. Backend Package Structure

- [ ] 2.1 Rename base package to `org.ruikun.easymall`
- [ ] 2.2 Create `modules/` package
- [ ] 2.3 Move user-related classes into `modules/user`
- [ ] 2.4 Move product/category-related classes into `modules/product` and `modules/category`
- [ ] 2.5 Move order/cart-related classes into `modules/order` and `modules/cart`
- [ ] 2.6 Move coupon/member/points/sign/comment/favorite/upload classes into corresponding modules
- [ ] 2.7 Move common result, exception, constants into `common/`
- [ ] 2.8 Move Redis/file/id utilities into `infrastructure/`

## 3. Configuration

- [ ] 3.1 Split `application.yml` into base, dev, and prod profiles
- [ ] 3.2 Replace datasource URL, username, password with env variables
- [ ] 3.3 Replace Redis host/port/password with env variables
- [ ] 3.4 Replace JWT secret with env variable
- [ ] 3.5 Replace file upload base URL with env variable
- [ ] 3.6 Add `.env.example`
- [ ] 3.7 Ensure local dev defaults still work

## 4. Docker

- [ ] 4.1 Update Dockerfile path after backend move
- [ ] 4.2 Update docker-compose service build context
- [ ] 4.3 Ensure MySQL and Redis containers still start
- [ ] 4.4 Ensure upload volume still works
- [ ] 4.5 Document local startup commands

## 5. Verification

- [ ] 5.1 Backend `mvn test` passes
- [ ] 5.2 Backend `mvn spring-boot:run` starts successfully
- [ ] 5.3 `docker compose up -d` starts app, MySQL, Redis
- [ ] 5.4 Existing login/product/order APIs remain available
```

## 1.4 验收标准

- 后端成功迁移到 `easymall-backend`
- 前端目录 `easymall-frontend` 已创建
- 原有接口路径不破坏
- 本地可以启动后端
- Docker Compose 可以启动 MySQL、Redis、后端
- 配置文件不再硬编码生产 IP、JWT secret、数据库密码
- `.env.example` 可以指导本地启动
- README 记录新的项目结构

---

# 阶段 2：订单状态机与交易主流程重构

## 2.1 阶段目标

将订单状态从分散的数字判断，重构为明确的订单状态机。

本阶段重点不引入支付系统和 MQ，而是先把订单主流程抽象清楚。

推荐订单状态：

```text
PENDING_PAYMENT    待支付
PAID               已支付
WAITING_SHIPMENT   待发货
SHIPPED            已发货
COMPLETED          已完成
CANCELLED          已取消
REFUNDING          退款中
REFUNDED           已退款
```

## 2.2 建议 OpenSpec 变更提案

建议创建：

```text
openspec/changes/stabilize-order-state-machine/
```

### proposal.md 建议目标

```md
# Stabilize Order State Machine

## Why

The current order workflow uses numeric status values and scattered status checks in service methods. As EasyMall evolves toward a realistic e-commerce system, order state transitions must be explicit, testable, and protected against invalid changes.

## What Changes

- Introduce `OrderStatus` enum.
- Introduce `OrderStateMachine`.
- Replace scattered numeric status checks with state machine methods.
- Define valid transitions for pay, cancel, ship, confirm, refund.
- Add unit tests for order state transitions.
- Update order API response to expose stable status code and display text.

## Non-Goals

- No real third-party payment integration.
- No inventory table redesign.
- No MQ delayed order close.
- No microservice split.
```

## 2.3 tasks.md 建议内容

```md
## 1. Inventory

- [ ] 1.1 List all places where order status numbers are used
- [ ] 1.2 List all order status values currently stored in database
- [ ] 1.3 List all APIs that modify order status
- [ ] 1.4 Document current order flow

## 2. Domain Model

- [ ] 2.1 Add `OrderStatus` enum
- [ ] 2.2 Add `OrderStatusConverter` if database still stores numeric codes
- [ ] 2.3 Add `OrderStateMachine`
- [ ] 2.4 Define valid transition table
- [ ] 2.5 Add order status display text mapping

## 3. Service Refactor

- [ ] 3.1 Refactor pay order status check
- [ ] 3.2 Refactor cancel order status check
- [ ] 3.3 Refactor admin ship order status check
- [ ] 3.4 Refactor confirm receipt status check
- [ ] 3.5 Refactor refund-related placeholder status checks if needed

## 4. Tests

- [ ] 4.1 Test pending payment can pay
- [ ] 4.2 Test pending payment can cancel
- [ ] 4.3 Test paid order cannot cancel directly if business rule disallows it
- [ ] 4.4 Test shipped order can confirm
- [ ] 4.5 Test completed order cannot pay again
- [ ] 4.6 Test invalid transitions throw business exception

## 5. Documentation

- [ ] 5.1 Add `docs/order-state-machine.md`
- [ ] 5.2 Update API documentation for order status
```

## 2.4 验收标准

- 订单状态不再在业务代码中直接散落 magic number
- 所有订单状态变更经过状态机校验
- 状态流转规则有文档
- 状态机有单元测试
- 原有创建订单、支付订单、取消订单、确认收货流程可用

---

# 阶段 3：库存锁定模型重构

## 3.1 阶段目标

将“下单直接扣商品库存”重构为“创建订单锁定库存，支付成功确认扣减，取消订单释放库存”。

这是 EasyMall 从课程商城升级为真实电商交易链路的关键阶段。

## 3.2 建议 OpenSpec 变更提案

建议创建：

```text
openspec/changes/add-inventory-locking-model/
```

### proposal.md 建议目标

```md
# Add Inventory Locking Model

## Why

The current order creation flow directly decreases product stock when an order is created. This makes unpaid orders consume real stock and makes inventory recovery dependent on manual cancellation. A realistic e-commerce system should distinguish available stock, locked stock, and sold stock.

## What Changes

- Add `inventory` table.
- Add `inventory_log` table.
- Add inventory service boundary.
- Change order creation to lock stock instead of directly decreasing product stock.
- Change order cancellation to release locked stock.
- Change payment success flow to confirm locked stock as sold stock.
- Record inventory change logs.

## Non-Goals

- No flash sale system.
- No distributed inventory service.
- No Redis stock pre-deduction.
- No microservice split.
```

## 3.3 推荐数据库设计

### inventory

```sql
CREATE TABLE inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    total_stock INT NOT NULL DEFAULT 0,
    available_stock INT NOT NULL DEFAULT 0,
    locked_stock INT NOT NULL DEFAULT 0,
    sold_stock INT NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_product_id (product_id)
);
```

### inventory_log

```sql
CREATE TABLE inventory_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    order_id BIGINT,
    change_type VARCHAR(50) NOT NULL,
    change_quantity INT NOT NULL,
    before_available INT,
    after_available INT,
    remark VARCHAR(255),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_order_id (order_id)
);
```

## 3.4 tasks.md 建议内容

```md
## 1. Database

- [ ] 1.1 Add `inventory` table migration
- [ ] 1.2 Add `inventory_log` table migration
- [ ] 1.3 Initialize inventory data from existing product stock
- [ ] 1.4 Keep product stock as display field or mark it deprecated

## 2. Inventory Module

- [ ] 2.1 Add `modules/inventory`
- [ ] 2.2 Add `Inventory` entity
- [ ] 2.3 Add `InventoryLog` entity
- [ ] 2.4 Add `InventoryMapper`
- [ ] 2.5 Add `InventoryService`
- [ ] 2.6 Add `lockStock` method
- [ ] 2.7 Add `releaseLockedStock` method
- [ ] 2.8 Add `confirmSoldStock` method
- [ ] 2.9 Add inventory log writing

## 3. Order Integration

- [ ] 3.1 Replace product direct stock decrease in create order
- [ ] 3.2 Lock inventory during order creation
- [ ] 3.3 Release inventory during order cancellation
- [ ] 3.4 Confirm sold inventory during payment success
- [ ] 3.5 Ensure transaction rollback releases no partial data

## 4. Concurrency

- [ ] 4.1 Ensure lock stock SQL checks `available_stock >= quantity`
- [ ] 4.2 Ensure mapper returns affected row count
- [ ] 4.3 Throw business exception when affected row count is zero
- [ ] 4.4 Add optimistic version field if needed

## 5. Tests

- [ ] 5.1 Test stock lock success
- [ ] 5.2 Test stock lock failure when insufficient
- [ ] 5.3 Test order cancel releases stock
- [ ] 5.4 Test payment success confirms sold stock
- [ ] 5.5 Test repeated release is prevented
```

## 3.5 验收标准

- 创建订单不再直接扣 `product.stock`
- 下单时减少可售库存并增加锁定库存
- 支付成功时减少锁定库存并增加已售库存
- 取消订单时释放锁定库存
- 所有库存变化有流水
- 库存不足时下单失败
- 并发扣减不会出现负库存

---

# 阶段 4：支付单与支付幂等重构

## 4.1 阶段目标

将“支付接口直接改订单状态”升级为“支付单 + 支付回调 + 幂等处理”的真实支付系统模型。

本阶段不要求接入支付宝/微信正式支付，可以先做模拟支付通道。

## 4.2 建议 OpenSpec 变更提案

建议创建：

```text
openspec/changes/add-payment-order-and-idempotency/
```

### proposal.md 建议目标

```md
# Add Payment Order and Idempotency

## Why

The current payment flow updates the order status directly when the user calls the pay API. This does not model real payment behavior and cannot handle duplicate callbacks, amount validation, or payment status tracking. EasyMall needs a payment order model to make the transaction flow more realistic and robust.

## What Changes

- Add `payment_order` table.
- Add `payment_callback_log` table.
- Create payment order after order creation.
- Add simulated payment callback endpoint.
- Add payment status lifecycle.
- Ensure payment callback is idempotent.
- Trigger order paid workflow only once.

## Non-Goals

- No real Alipay or WeChat Pay integration.
- No refund implementation in this change.
- No payment microservice split.
- No distributed transaction framework.
```

## 4.3 推荐数据库设计

### payment_order

```sql
CREATE TABLE payment_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_no VARCHAR(64) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL,
    order_no VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    channel VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    third_trade_no VARCHAR(128),
    paid_time DATETIME,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id)
);
```

### payment_callback_log

```sql
CREATE TABLE payment_callback_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_no VARCHAR(64) NOT NULL,
    channel VARCHAR(32) NOT NULL,
    callback_raw TEXT,
    result VARCHAR(32),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payment_no (payment_no)
);
```

## 4.4 支付状态

```text
WAITING_PAY
PAYING
PAID
CLOSED
FAILED
REFUNDING
REFUNDED
```

## 4.5 tasks.md 建议内容

```md
## 1. Database

- [ ] 1.1 Add `payment_order` table
- [ ] 1.2 Add `payment_callback_log` table
- [ ] 1.3 Add payment status enum
- [ ] 1.4 Add payment channel enum

## 2. Payment Module

- [ ] 2.1 Add `modules/payment`
- [ ] 2.2 Add PaymentOrder entity
- [ ] 2.3 Add PaymentCallbackLog entity
- [ ] 2.4 Add PaymentOrderMapper
- [ ] 2.5 Add PaymentService
- [ ] 2.6 Add PaymentController
- [ ] 2.7 Add simulated payment callback endpoint

## 3. Order Integration

- [ ] 3.1 Create payment order after order creation
- [ ] 3.2 Change pay API to return payment info instead of directly paying order
- [ ] 3.3 Process order paid workflow through payment callback
- [ ] 3.4 Ensure inventory confirmation only happens after successful payment
- [ ] 3.5 Ensure coupon usage confirmation only happens after successful payment

## 4. Idempotency

- [ ] 4.1 If payment order is already PAID, return success directly
- [ ] 4.2 Ensure order status update only happens once
- [ ] 4.3 Ensure inventory confirm only happens once
- [ ] 4.4 Ensure points are not issued at payment stage
- [ ] 4.5 Log every callback request

## 5. Tests

- [ ] 5.1 Test normal payment callback
- [ ] 5.2 Test duplicate payment callback
- [ ] 5.3 Test invalid amount callback
- [ ] 5.4 Test callback for nonexistent payment order
- [ ] 5.5 Test paid order cannot be paid again
```

## 4.6 验收标准

- 订单支付不再由用户接口直接修改订单状态
- 支付单可记录支付状态
- 支付回调支持幂等
- 重复回调不会重复扣库存
- 重复回调不会重复确认优惠券
- 支付成功后订单进入已支付/待发货状态
- 支付流程有文档

---

# 阶段 5：MQ 事件驱动与延迟关单

## 5.1 阶段目标

引入消息队列，将订单超时关闭、积分发放、缓存清理等流程从同步调用升级为事件驱动。

推荐先用 RabbitMQ，后续微服务版可切换 RocketMQ。

## 5.2 建议 OpenSpec 变更提案

建议创建：

```text
openspec/changes/add-mq-order-timeout-and-events/
```

### proposal.md 建议目标

```md
# Add MQ Order Timeout and Domain Events

## Why

Several EasyMall workflows are currently synchronous or manually triggered, such as order timeout cancellation, points issuing, and cache invalidation. Introducing MQ-based domain events improves decoupling and makes the system closer to a real e-commerce architecture.

## What Changes

- Add RabbitMQ dependency and Docker Compose service.
- Add domain event model.
- Add order created delayed message.
- Add order timeout consumer.
- Add order completed event for points issuing.
- Add product changed event for cache invalidation.
- Add message consume log for idempotency.

## Non-Goals

- No microservice split.
- No distributed transaction framework.
- No event sourcing.
- No RocketMQ migration in this change.
```

## 5.3 推荐事件

```text
OrderCreatedEvent
OrderPaidEvent
OrderCancelledEvent
OrderCompletedEvent
CouponLockedEvent
CouponUsedEvent
CouponReturnedEvent
ProductChangedEvent
CommentApprovedEvent
```

## 5.4 推荐新增表

```sql
CREATE TABLE message_consume_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(128) NOT NULL UNIQUE,
    event_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    error_message TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 5.5 tasks.md 建议内容

```md
## 1. Infrastructure

- [ ] 1.1 Add RabbitMQ dependency
- [ ] 1.2 Add RabbitMQ Docker Compose service
- [ ] 1.3 Add RabbitMQ configuration class
- [ ] 1.4 Add exchange, queue, routing key constants
- [ ] 1.5 Add message serialization strategy

## 2. Domain Events

- [ ] 2.1 Add base domain event interface
- [ ] 2.2 Add OrderCreatedEvent
- [ ] 2.3 Add OrderCompletedEvent
- [ ] 2.4 Add ProductChangedEvent
- [ ] 2.5 Add CommentApprovedEvent

## 3. Delayed Order Close

- [ ] 3.1 Publish delayed order close message after order creation
- [ ] 3.2 Add order timeout consumer
- [ ] 3.3 Consumer checks current order status
- [ ] 3.4 If still pending payment, cancel order
- [ ] 3.5 Release locked stock
- [ ] 3.6 Return locked coupon
- [ ] 3.7 Add idempotency check

## 4. Async Points

- [ ] 4.1 Publish OrderCompletedEvent after order completion
- [ ] 4.2 Add points consumer
- [ ] 4.3 Issue points asynchronously
- [ ] 4.4 Ensure points issuing is idempotent

## 5. Cache Invalidation

- [ ] 5.1 Publish ProductChangedEvent after product create/update/on-shelf/off-shelf
- [ ] 5.2 Add cache invalidation consumer
- [ ] 5.3 Delete product detail cache
- [ ] 5.4 Delete hot/new product cache
- [ ] 5.5 Delete search cache if needed

## 6. Tests

- [ ] 6.1 Test order timeout cancellation
- [ ] 6.2 Test paid order is not cancelled by timeout message
- [ ] 6.3 Test duplicate timeout message is safe
- [ ] 6.4 Test order completion points are issued once
- [ ] 6.5 Test product cache invalidation event
```

## 5.6 验收标准

- RabbitMQ 可以通过 Docker Compose 启动
- 创建订单后自动发送延迟关单消息
- 超时未支付订单自动取消
- 已支付订单不会被延迟消息取消
- 订单取消会释放库存和返还优惠券
- 订单完成后积分异步发放
- 商品变更后缓存异步清理
- 消费者具备幂等处理

---

# 阶段 6：优惠券与积分生命周期固化

## 6.1 阶段目标

将优惠券和积分从“功能可用”升级为“生命周期清晰、幂等可控、可追踪”。

本阶段重点是状态机和流水，不是继续堆更多营销玩法。

## 6.2 建议 OpenSpec 变更提案

可拆成两个提案：

```text
openspec/changes/stabilize-coupon-lifecycle/
openspec/changes/stabilize-points-ledger-idempotency/
```

---

## 6A：优惠券生命周期

### proposal.md 建议目标

```md
# Stabilize Coupon Lifecycle

## Why

The coupon module already supports receiving, using, and returning coupons, but the lifecycle needs to be more explicit and safe for order integration. Coupons should be locked during order creation, confirmed as used after payment, and returned when unpaid orders are cancelled.

## What Changes

- Define coupon status lifecycle.
- Lock coupon during order creation.
- Confirm coupon usage after payment success.
- Return coupon on order cancellation or timeout.
- Add coupon operation logs where needed.
- Add tests for coupon state transitions.

## Non-Goals

- No complex promotion engine.
- No multi-coupon stacking.
- No campaign scheduling system.
```

### 推荐优惠券状态

```text
UNUSED
LOCKED
USED
EXPIRED
RETURNED
INVALID
```

### tasks.md 建议内容

```md
## 1. Status Model

- [ ] 1.1 Add coupon status enum
- [ ] 1.2 Document coupon lifecycle
- [ ] 1.3 Replace scattered status numbers with enum usage

## 2. Order Integration

- [ ] 2.1 Lock coupon during order creation
- [ ] 2.2 Store user_coupon_id on order
- [ ] 2.3 Store coupon discount amount on order
- [ ] 2.4 Confirm coupon as used after payment success
- [ ] 2.5 Return coupon when pending order is cancelled
- [ ] 2.6 Return coupon when timeout cancellation happens

## 3. Validation

- [ ] 3.1 Validate coupon belongs to current user
- [ ] 3.2 Validate coupon is UNUSED before locking
- [ ] 3.3 Validate coupon is not expired
- [ ] 3.4 Validate order amount threshold
- [ ] 3.5 Validate member level restriction

## 4. Tests

- [ ] 4.1 Test coupon receive
- [ ] 4.2 Test coupon lock during order creation
- [ ] 4.3 Test coupon used after payment
- [ ] 4.4 Test coupon returned after cancellation
- [ ] 4.5 Test expired coupon cannot be used
```

### 验收标准

- 优惠券有明确状态机
- 下单时优惠券进入 LOCKED
- 支付成功后优惠券进入 USED
- 订单取消后优惠券可返还
- 重复取消不会重复返还
- 优惠券相关流程有测试

---

## 6B：积分流水与幂等

### proposal.md 建议目标

```md
# Stabilize Points Ledger Idempotency

## Why

EasyMall already has a points record table, but points issuing and deduction should be idempotent and traceable. Order completion, comment approval, sign-in, and points exchange must never create duplicate points records for the same business event.

## What Changes

- Add business idempotency fields to points records.
- Ensure all points changes go through PointsService.
- Make order completion points issuing idempotent.
- Make comment approval points issuing idempotent.
- Make sign-in points issuing idempotent.
- Add tests for duplicate points events.

## Non-Goals

- No points expiration in this change.
- No advanced membership growth strategy.
- No distributed points service.
```

### 推荐补充字段

```sql
ALTER TABLE points_record
ADD COLUMN biz_type VARCHAR(64),
ADD COLUMN biz_id VARCHAR(128),
ADD UNIQUE KEY uk_biz (biz_type, biz_id);
```

### tasks.md 建议内容

```md
## 1. Database

- [ ] 1.1 Add `biz_type` to points record
- [ ] 1.2 Add `biz_id` to points record
- [ ] 1.3 Add unique key on `biz_type + biz_id`

## 2. Points Service

- [ ] 2.1 Ensure all points changes go through PointsService
- [ ] 2.2 Add idempotent add points method
- [ ] 2.3 Add idempotent deduct points method
- [ ] 2.4 Add points ledger validation
- [ ] 2.5 Update member level after points changes

## 3. Business Integration

- [ ] 3.1 Order completion uses biz type `ORDER_COMPLETED`
- [ ] 3.2 Comment approval uses biz type `COMMENT_APPROVED`
- [ ] 3.3 Daily sign-in uses biz type `DAILY_SIGN_IN`
- [ ] 3.4 Points exchange uses biz type `POINTS_EXCHANGE`
- [ ] 3.5 Admin adjustment uses biz type `ADMIN_ADJUST`

## 4. Tests

- [ ] 4.1 Test order completion issues points once
- [ ] 4.2 Test duplicate OrderCompletedEvent does not issue points twice
- [ ] 4.3 Test comment approval points idempotency
- [ ] 4.4 Test sign-in cannot issue points twice on same day
- [ ] 4.5 Test points exchange deducts points and writes ledger
```

### 验收标准

- 所有积分变动都有流水
- 同一业务事件不会重复发积分
- 积分扣减有流水
- 会员等级根据积分变化更新
- 积分模块有幂等测试

---

# 阶段 7：前端工程与全栈展示能力建设

## 7.1 阶段目标

补齐前端，使项目可以完整演示。

建议前端放在同一个仓库：

```text
EasyMall/easymall-frontend
```

不建议放到：

```text
src/main/resources/static
```

因为 EasyMall 应继续保持前后端分离架构。

## 7.2 建议 OpenSpec 变更提案

建议拆成两个提案：

```text
openspec/changes/add-admin-frontend/
openspec/changes/add-user-frontend/
```

也可以先只做管理端，因为管理端更能展示后端能力。

---

## 7A：管理端前端

### proposal.md 建议目标

```md
# Add Admin Frontend

## Why

EasyMall currently only has backend APIs. Without a frontend, it is difficult to demonstrate product management, order management, coupon management, and user management flows. An admin frontend will make the backend capabilities visible and improve project presentation value.

## What Changes

- Add Vue3 + Vite + TypeScript frontend project.
- Add Element Plus admin layout.
- Add login page.
- Add token-based API client.
- Add product management pages.
- Add order management pages.
- Add user management pages.
- Add coupon management pages.
- Add comment review pages.
- Add member level management pages.

## Non-Goals

- No mobile app.
- No complex visual design.
- No SSR.
- No public user storefront in this change.
```

### tasks.md 建议内容

```md
## 1. Project Setup

- [ ] 1.1 Initialize Vue3 + Vite + TypeScript project
- [ ] 1.2 Add Element Plus
- [ ] 1.3 Add Vue Router
- [ ] 1.4 Add Pinia
- [ ] 1.5 Add Axios
- [ ] 1.6 Add environment variable for API base URL

## 2. Auth

- [ ] 2.1 Add admin login page
- [ ] 2.2 Add token storage
- [ ] 2.3 Add Axios request interceptor
- [ ] 2.4 Add Axios response interceptor
- [ ] 2.5 Add route guard
- [ ] 2.6 Add logout

## 3. Layout

- [ ] 3.1 Add admin layout
- [ ] 3.2 Add sidebar menu
- [ ] 3.3 Add top navbar
- [ ] 3.4 Add breadcrumb
- [ ] 3.5 Add tab or page title support

## 4. Pages

- [ ] 4.1 Product management page
- [ ] 4.2 Category management page
- [ ] 4.3 Order management page
- [ ] 4.4 User management page
- [ ] 4.5 Coupon template management page
- [ ] 4.6 Comment review page
- [ ] 4.7 Member level management page
- [ ] 4.8 Points product management page

## 5. Verification

- [ ] 5.1 Admin can login
- [ ] 5.2 Admin can view products
- [ ] 5.3 Admin can create or update product
- [ ] 5.4 Admin can view orders
- [ ] 5.5 Admin can manage coupons
- [ ] 5.6 Admin can review comments
```

### 验收标准

- 管理端可以登录
- 管理端可以调用后端接口
- 主要后台模块可视化
- Token 认证可用
- 路由守卫可用
- 前端可以独立启动

---

## 7B：用户端前端

### proposal.md 建议目标

```md
# Add User Storefront Frontend

## Why

After the admin frontend is available, EasyMall needs a user-facing storefront to demonstrate the full shopping flow from browsing products to cart, order creation, payment simulation, coupon usage, and member center.

## What Changes

- Add user storefront routes and layout.
- Add product list and detail pages.
- Add cart page.
- Add order creation page.
- Add order list and detail pages.
- Add coupon center.
- Add member center.
- Add points record page.
- Add favorite and comment pages.

## Non-Goals

- No mobile-specific UI.
- No complex animation.
- No real payment provider integration.
```

### tasks.md 建议内容

```md
## 1. Layout

- [ ] 1.1 Add user layout
- [ ] 1.2 Add header navigation
- [ ] 1.3 Add footer
- [ ] 1.4 Add user menu

## 2. Product Flow

- [ ] 2.1 Product list page
- [ ] 2.2 Product search and category filter
- [ ] 2.3 Product detail page
- [ ] 2.4 Favorite product action
- [ ] 2.5 Product comment list

## 3. Cart and Order

- [ ] 3.1 Cart list page
- [ ] 3.2 Add to cart
- [ ] 3.3 Update cart item quantity
- [ ] 3.4 Select/unselect cart items
- [ ] 3.5 Create order page
- [ ] 3.6 Apply coupon
- [ ] 3.7 Submit order
- [ ] 3.8 Simulate payment

## 4. User Center

- [ ] 4.1 Order list
- [ ] 4.2 Order detail
- [ ] 4.3 Member level page
- [ ] 4.4 Points record page
- [ ] 4.5 Coupon center
- [ ] 4.6 Favorite list
- [ ] 4.7 Comment management

## 5. Verification

- [ ] 5.1 User can register and login
- [ ] 5.2 User can browse products
- [ ] 5.3 User can add product to cart
- [ ] 5.4 User can create order
- [ ] 5.5 User can use coupon
- [ ] 5.6 User can simulate payment
- [ ] 5.7 User can view order history
```

### 验收标准

- 用户端可以完成浏览商品、加入购物车、下单、支付模拟、查看订单
- 优惠券和会员折扣可以在前端展示
- 用户中心可以展示积分、会员等级、优惠券、收藏、评论
- 前端可通过 Nginx 或 Vite 代理访问后端

---

# 阶段 8：文档、测试、部署与项目包装

## 8.1 阶段目标

将 EasyMall 包装成一个别人可以理解、运行、演示、面试讲解的完整项目。

## 8.2 建议 OpenSpec 变更提案

建议拆成：

```text
openspec/changes/add-testing-and-ci/
openspec/changes/polish-documentation-and-demo/
openspec/changes/stabilize-docker-deployment/
```

---

## 8A：测试与 CI

### proposal.md 建议目标

```md
# Add Testing and CI

## Why

EasyMall is becoming a portfolio-level project. Core transaction logic such as order state transitions, inventory locking, payment idempotency, coupon lifecycle, and points ledger must be protected by tests and CI.

## What Changes

- Add unit tests for order state machine.
- Add service tests for inventory, payment, coupon, and points.
- Add integration tests for core order flow where practical.
- Add GitHub Actions workflow for backend.
- Add frontend build workflow after frontend is added.

## Non-Goals

- No full end-to-end browser testing.
- No performance testing in this change.
```

### tasks.md 建议内容

```md
## 1. Backend Tests

- [ ] 1.1 Add OrderStateMachine tests
- [ ] 1.2 Add InventoryService tests
- [ ] 1.3 Add PaymentService idempotency tests
- [ ] 1.4 Add CouponService lifecycle tests
- [ ] 1.5 Add PointsService idempotency tests

## 2. Integration Tests

- [ ] 2.1 Test create order locks stock
- [ ] 2.2 Test cancel order releases stock
- [ ] 2.3 Test payment callback confirms order
- [ ] 2.4 Test duplicate payment callback is safe
- [ ] 2.5 Test order completion issues points once

## 3. CI

- [ ] 3.1 Add GitHub Actions backend workflow
- [ ] 3.2 Cache Maven dependencies
- [ ] 3.3 Run backend tests
- [ ] 3.4 Add frontend workflow
- [ ] 3.5 Cache npm dependencies
- [ ] 3.6 Run frontend build
```

---

## 8B：文档与展示

### proposal.md 建议目标

```md
# Polish Documentation and Demo

## Why

EasyMall needs documentation that explains not only how to run the project, but also why the architecture is designed this way. Good documentation improves project presentation value for resumes, graduation projects, and interviews.

## What Changes

- Rewrite root README.
- Add architecture overview.
- Add database design document.
- Add order state machine document.
- Add inventory design document.
- Add payment design document.
- Add MQ event design document.
- Add frontend guide.
- Add deployment guide.
- Add screenshots and demo checklist.

## Non-Goals

- No business logic changes.
- No new features.
```

### 推荐文档目录

```text
docs/
├── README.md
├── architecture/
│   ├── system-overview.md
│   ├── backend-architecture.md
│   ├── frontend-architecture.md
│   └── deployment-architecture.md
├── business/
│   ├── order-state-machine.md
│   ├── inventory-design.md
│   ├── payment-design.md
│   ├── coupon-lifecycle.md
│   └── points-ledger.md
├── api/
│   └── API.md
├── operations/
│   ├── local-development.md
│   ├── docker-compose.md
│   └── server-deployment.md
├── plans/
│   └── easymall-refactor-roadmap.md
└── screenshots/
```

---

## 8C：Docker 部署

### proposal.md 建议目标

```md
# Stabilize Docker Deployment

## Why

EasyMall should be easy to start locally and deploy on a server. The current Docker setup already starts backend, MySQL, and Redis, but it should be extended to support frontend, MQ, Nginx, and environment profiles.

## What Changes

- Add dev and prod Docker Compose files.
- Add RabbitMQ service.
- Add frontend build and Nginx deployment.
- Add Nginx reverse proxy for `/api` and `/uploads`.
- Add `.env.example`.
- Add deployment verification commands.

## Non-Goals

- No Kubernetes deployment.
- No cloud-specific deployment automation.
- No multi-node high availability.
```

### Nginx 推荐结构

```text
浏览器
  ↓
Nginx
  ├── /         -> Vue 静态文件
  ├── /api      -> Spring Boot 后端
  └── /uploads  -> 上传图片目录
```

---

# 阶段 9：轻量微服务演进（可选）

## 9.1 阶段目标

只有当模块化单体版本已经稳定后，才考虑微服务化。

不建议近期直接微服务化。

## 9.2 建议 OpenSpec 变更提案

建议创建：

```text
openspec/changes/evaluate-microservice-migration/
```

而不是直接创建：

```text
split-to-microservices
```

先评估，再迁移。

### proposal.md 建议目标

```md
# Evaluate Microservice Migration

## Why

EasyMall v2 has introduced clearer module boundaries, MQ events, inventory locking, payment idempotency, and frontend integration. Before splitting services, the project needs to evaluate which boundaries are worth extracting and which should remain in the modular monolith.

## What Changes

- Document current module dependencies.
- Identify service candidates.
- Define data ownership boundaries.
- Define API and event contracts.
- Define migration steps.
- Create a microservice proof-of-concept branch if justified.

## Non-Goals

- No immediate full microservice rewrite.
- No Seata introduction.
- No Kubernetes migration.
```

## 9.3 推荐微服务拆分

```text
easymall-gateway
easymall-auth
easymall-user
easymall-product
easymall-order
easymall-marketing
easymall-admin
```

其中：

```text
easymall-marketing:
- coupon
- points
- member
- sign
- promotion
```

不建议拆太细：

```text
不建议：
- coupon-service
- points-service
- member-service
- sign-service
- favorite-service
- comment-service
```

原因：

- 一个人维护成本过高
- 服务数量变多但业务深度不足
- 部署和调试复杂度明显上升
- 对简历帮助不一定比模块化单体更大

## 9.4 微服务技术栈建议

```text
Spring Cloud Gateway
Nacos
OpenFeign
Sentinel
RocketMQ
Redis
MySQL
Docker Compose
SkyWalking，可选
Prometheus + Grafana，可选
```

## 9.5 微服务验收标准

只有满足以下条件，才建议开始：

- 模块化单体版本稳定
- 前端管理端和用户端基本可用
- 订单、库存、支付、优惠券、积分链路清晰
- MQ 事件已经稳定
- 文档完整
- Docker Compose 可一键启动
- 已经知道每个服务的数据归属

---

# 4. 不建议近期优先做的事情

## 4.1 不建议马上拆微服务

当前 EasyMall 更适合继续作为模块化单体推进。

原因：

- 当前最需要补的是订单、库存、支付、优惠券、积分等交易链路
- 微服务会引入服务注册、网关、远程调用、链路追踪、分布式事务等复杂度
- 一个人开发维护多个服务成本高
- 如果业务链路不够扎实，拆服务只会让 CRUD 分散到多个服务里
- 前端还没写，直接微服务化会分散精力

推荐：

```text
先模块化单体
再 MQ 事件驱动
再前端展示
最后微服务评估
```

## 4.2 不建议一开始接真实支付

真实支付宝/微信支付接入可以后置。

近期更重要的是：

```text
支付单
支付状态
支付回调
金额校验
重复回调幂等
订单状态流转
库存确认
```

即使是模拟支付，也能体现你理解真实支付系统。

## 4.3 不建议过度设计秒杀系统

秒杀可以作为后续亮点，但不应先做。

优先级应为：

```text
普通订单交易链路 > 库存锁定 > 支付幂等 > MQ 延迟关单 > 秒杀
```

如果普通订单链路还不严谨，秒杀只会变成技术名词堆叠。

## 4.4 不建议前端做太复杂

你是后端方向，前端目标是“能演示后端能力”，不是做复杂 UI。

前端应优先：

```text
管理端 > 用户端 > 美化 > 移动端
```

不建议近期做：

```text
SSR
复杂动画
移动 App
多端适配
复杂装修系统
```

---

# 5. 推荐执行顺序

建议按照以下顺序创建 OpenSpec 变更提案：

```text
1. refactor-project-structure-and-config
2. stabilize-order-state-machine
3. add-inventory-locking-model
4. add-payment-order-and-idempotency
5. add-mq-order-timeout-and-events
6. stabilize-coupon-lifecycle
7. stabilize-points-ledger-idempotency
8. add-admin-frontend
9. add-user-frontend
10. add-testing-and-ci
11. polish-documentation-and-demo
12. stabilize-docker-deployment
13. evaluate-microservice-migration
```

如果想更稳，可以先只做前五个：

```text
1. refactor-project-structure-and-config
2. stabilize-order-state-machine
3. add-inventory-locking-model
4. add-payment-order-and-idempotency
5. add-mq-order-timeout-and-events
```

这五个完成后，EasyMall 的后端质量会有明显提升。

---

# 6. 建议的近期工作安排

## 第 1 周

```text
- 创建 refactor-project-structure-and-config 提案
- 迁移后端到 easymall-backend
- 创建 easymall-frontend 空目录
- 拆分 dev/prod 配置
- 移除硬编码配置
- 更新 Docker Compose 路径
```

## 第 2 周

```text
- 创建 stabilize-order-state-machine 提案
- 盘点所有订单状态使用点
- 新增 OrderStatus
- 新增 OrderStateMachine
- 替换 Service 中散落状态判断
- 添加状态机测试
```

## 第 3 周

```text
- 创建 add-inventory-locking-model 提案
- 新增 inventory 和 inventory_log 表
- 新增 InventoryService
- 下单改为锁库存
- 取消订单释放库存
- 支付成功确认库存
```

## 第 4 周

```text
- 创建 add-payment-order-and-idempotency 提案
- 新增 payment_order 和 payment_callback_log
- 创建支付单
- 改造支付接口
- 新增模拟支付回调
- 实现重复回调幂等
```

## 第 5 周

```text
- 创建 add-mq-order-timeout-and-events 提案
- 引入 RabbitMQ
- 实现订单延迟关单
- 实现订单完成异步发积分
- 实现商品变更异步清缓存
- 添加消息消费幂等
```

## 第 6 周

```text
- 创建 stabilize-coupon-lifecycle 提案
- 创建 stabilize-points-ledger-idempotency 提案
- 固化优惠券状态机
- 固化积分流水幂等
- 补充相关测试
```

## 第 7 周

```text
- 创建 add-admin-frontend 提案
- 初始化 Vue3 管理端
- 实现登录、布局、路由守卫
- 实现商品、订单、用户、优惠券管理页面
```

## 第 8 周

```text
- 创建 add-user-frontend 提案
- 实现商品列表、商品详情、购物车、下单、订单列表
- 对接优惠券、会员、积分展示
```

## 第 9 周

```text
- 创建 add-testing-and-ci 提案
- 创建 polish-documentation-and-demo 提案
- 创建 stabilize-docker-deployment 提案
- 补充测试、CI、README、架构图、部署说明
```

---

# 7. 最终交付状态

## 功能层面

```text
- 用户可以注册、登录
- 用户可以浏览商品、搜索商品
- 用户可以加入购物车
- 用户可以创建订单
- 订单会锁定库存
- 用户可以模拟支付
- 支付成功后确认库存
- 订单超时未支付自动取消
- 订单取消释放库存并返还优惠券
- 用户可以使用优惠券
- 用户可以获得积分
- 用户可以查看会员等级
- 管理员可以管理商品、分类、订单、用户、优惠券、评论、会员等级
```

## 架构层面

```text
- 后端为模块化单体
- 前后端分离
- 业务模块边界清晰
- 订单状态机独立
- 库存服务独立
- 支付服务独立
- 优惠券生命周期清晰
- 积分流水幂等
- MQ 事件驱动部分流程
- Redis 缓存 Key 规范
```

## 工程层面

```text
- Docker Compose 可一键启动
- 配置支持 dev/prod 分离
- 无生产硬编码密钥
- 后端测试可运行
- 前端可构建
- GitHub Actions 可自动验证
- README 完整
- docs 文档完整
```

## 展示层面

```text
- GitHub 仓库结构清晰
- 有项目截图
- 有架构图
- 有数据库 ER 图
- 有核心流程图
- 有接口文档
- 有部署文档
- 有 OpenSpec 变更记录
- 可以用于简历、毕设、作品集
```

---

# 8. README 包装建议

## 项目标题

```md
# EasyMall

基于 Spring Boot + Redis + RabbitMQ + Vue3 的企业级 B2C 商城系统
```

## 项目简介

```md
EasyMall 是一个面向真实电商交易链路设计的 B2C 商城系统，采用前后端分离架构。后端基于 Spring Boot、MySQL、Redis、RabbitMQ 构建，前端基于 Vue3 + Element Plus 实现。系统围绕商品、购物车、订单、库存、支付、优惠券、会员积分、后台管理等核心业务模块，重点设计了订单状态机、库存锁定、支付幂等、MQ 延迟关单、优惠券返还、积分异步发放和 Redis 缓存优化等机制。
```

## 核心亮点

```md
- 订单状态机：规范订单支付、取消、发货、确认收货、退款等状态流转。
- 库存锁定模型：区分可售库存、锁定库存、已售库存，避免库存账实不清。
- 支付幂等机制：设计支付单和回调日志，防止重复回调导致重复处理。
- MQ 延迟关单：订单超时未支付自动取消，释放库存并返还优惠券。
- 优惠券状态机：支持领取、锁定、使用、返还、过期等完整生命周期。
- 积分流水幂等：通过业务类型和业务 ID 防止积分重复发放。
- Redis 缓存优化：商品详情、热门商品、分类树等高频数据缓存。
- Docker Compose：支持前端、后端、MySQL、Redis、RabbitMQ 一键启动。
```

---

# 9. 简历描述建议

## 简短版

```text
EasyMall 商城系统
基于 Spring Boot + MySQL + Redis + RabbitMQ + Vue3 实现的 B2C 商城系统，包含商品、购物车、订单、库存、支付、优惠券、会员积分和后台管理等模块。项目重点设计订单状态机、库存锁定、支付幂等、MQ 延迟关单、优惠券返还、积分异步发放和 Redis 缓存优化，支持 Docker Compose 一键部署。
```

## 详细版

```text
- 负责商城后端核心交易链路设计，实现商品、购物车、订单、库存、支付、优惠券、会员积分等模块。
- 设计订单状态机，规范待支付、已支付、待发货、已发货、已完成、已取消、退款中、已退款等状态流转。
- 设计库存锁定模型，通过 available_stock、locked_stock、sold_stock 区分可售库存、锁定库存和已售库存。
- 引入 RabbitMQ 实现订单超时未支付自动取消、订单完成异步发放积分、商品变更异步清理缓存等事件驱动流程。
- 设计支付单与支付回调幂等机制，避免重复回调导致重复扣库存、重复发积分等问题。
- 设计优惠券生命周期，支持优惠券领取、锁定、使用、返还、过期等状态流转。
- 使用 Redis 缓存商品详情、热门商品、分类树等高频数据，并通过随机 TTL、空值缓存等方式优化缓存稳定性。
- 使用 Docker Compose 编排前端、后端、MySQL、Redis、RabbitMQ，支持本地和云服务器快速部署。
```

---

# 10. 总结

EasyMall 下一阶段的核心策略是：

> 先整理工程结构，再打磨交易链路；先模块化单体，再事件驱动；先补前端展示，再考虑微服务。

最推荐立即开始的第一个变更提案：

```text
refactor-project-structure-and-config
```

这个提案完成后，EasyMall 将具备后续长期重构的基础。  
随后依次推进订单状态机、库存锁定、支付幂等、MQ 延迟关单、优惠券/积分生命周期、前端管理端、用户端和文档部署。

最终目标不是做一个“堆技术名词的微服务商城”，而是做一个：

```text
交易链路严谨
工程结构清晰
前后端可演示
部署文档完整
适合简历和毕设答辩的 Java 商城项目
```
