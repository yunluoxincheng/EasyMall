## Why

当前支付接口 `PUT /api/order/{orderId}/pay` 直接修改订单状态为已支付，不符合真实支付流程——没有支付单据记录、无法处理重复回调、无法校验金额一致性、无法追踪支付状态。EasyMall 需要引入支付单模型，使交易链路更接近真实电商系统。

## What Changes

- 新增 `payment_order` 表，记录每笔支付单的支付单号、关联订单、金额、渠道、状态
- 新增 `payment_callback_log` 表，记录每次支付回调的原始数据和结果
- 新增 `modules/payment` 模块（entity、mapper、service、controller）
- 新增支付状态枚举 `PaymentStatus`（WAITING_PAY / PAYING / PAID / CLOSED / FAILED）
- 下单成功后自动创建支付单
- 改造原支付接口：保留 `PUT /api/order/{orderId}/pay` 端点，改为返回支付单信息（paymentNo、amount、status），引导前端使用支付模块完成支付
- 新增模拟支付端点 `POST /api/payment/{paymentNo}/pay`，内部自动触发回调处理
- 新增模拟三方回调端点 `POST /api/payment/callback`（permitAll，校验 `X-Mock-Signature`），接收回调请求并调用 `processCallback` 处理
- 幂等保障：同一支付单重复回调直接返回成功，不重复确认库存；优惠券本阶段不参与支付回调

## Capabilities

### New Capabilities
- `payment-order-management`: 支付单的创建、查询、状态流转与生命周期管理
- `payment-callback-idempotency`: 支付回调的接收、处理、幂等校验与日志记录

### Modified Capabilities
- `order-state-machine`: 订单状态机的支付状态变迁由支付回调触发，而非用户直接调用；原 `PUT /api/order/{orderId}/pay` 改为返回支付单信息

## Impact

- **数据库**: 新增 `payment_order`、`payment_callback_log` 两张表
- **模块结构**: 新增 `modules/payment` 模块
- **API 变更**: `PUT /api/order/{orderId}/pay` 行为变更（返回支付单信息而非直接支付），保持端点向后兼容 **BREAKING**
- **API 新增**: `POST /api/payment/{paymentNo}/pay`、`POST /api/payment/callback`、`GET /api/payment/{paymentNo}`、`GET /api/payment/order/{orderId}`
- **订单服务**: `OrderServiceImpl.payOrder` 改为查询并返回关联支付单信息
- **配置变更**: `@MapperScan` 和 `type-aliases-package` 需新增 `org.ruikun.modules.payment` 包路径
- **安全配置**: `POST /api/payment/callback` 需 permitAll（模拟三方回调无 JWT），校验 `X-Mock-Signature`
- **依赖关系**: payment 模块依赖 OrderMapper、InventoryService（直接依赖 mapper 层，避免与 OrderService 循环依赖）
