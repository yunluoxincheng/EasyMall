## Context

EasyMall 当前支付流程由用户直接调用 `PUT /api/order/{orderId}/pay` 触发，`OrderServiceImpl.payOrder()` 直接将订单状态从 PENDING_PAYMENT 改为 PAID，并同步确认库存。没有独立的支付单据、没有回调机制、没有幂等保障。

系统已完成阶段 2（订单状态机）和阶段 3（库存锁定模型）。订单创建时锁定库存，支付成功后确认库存。优惠券在下单时已直接扣减（`useCoupon`），当前无 lock/confirm 两阶段。

## Goals / Non-Goals

**Goals:**
- 引入支付单（PaymentOrder），每个订单同一时刻仅允许一笔活跃支付单（WAITING_PAY / PAYING）
- 支付回调触发订单状态变更，而非用户直接调用
- 支付回调具备幂等能力，重复回调不产生副作用
- 保留模拟支付通道，不接入真实三方支付
- 记录支付回调日志，便于排查问题
- 原订单支付端点保留并改为返回支付单信息，保持兼容引导

**Non-Goals:**
- 不接入支付宝/微信真实支付 SDK
- 不实现退款功能（REFUNDING/REFUNDED 状态暂不实现）
- 不做支付微服务拆分
- 不引入分布式事务框架（Seata/TCC）
- 不做支付超时自动关单（阶段 5 MQ 实现）
- 不引入优惠券 lock/confirm 两阶段（优惠券确认推迟至阶段 6；本阶段优惠券仍维持下单时直接扣减）

## Decisions

### D1: 支付单与订单的活跃关系

每个订单同一时刻仅允许一笔活跃支付单（状态为 WAITING_PAY 或 PAYING）。取消订单时关闭活跃支付单；同一订单的历史支付单（CLOSED/FAILED）保留在表中供查询。不使用 `order_id` 唯一约束，而是通过业务逻辑保证活跃支付单唯一性（查询活跃支付单存在则不创建）。

**理由**: B2C 商城场景下，一笔订单通常只支付一次，但支付失败后可能重新发起。1:1 硬约束（唯一索引）会阻止重新支付场景，"同时刻仅一笔活跃"更灵活。历史支付单保留可审计。

### D2: 模拟支付流程设计

用户调用 `POST /api/payment/{paymentNo}/pay` 发起模拟支付 → 支付单状态变为 PAYING → 模拟网关内部直接调用回调处理逻辑 → 支付单状态变为 PAID → 触发订单已支付流程。整个过程在同一 HTTP 请求内同步完成。

另外提供独立的 `POST /api/payment/callback` 端点，接收模拟三方回调请求（携带 `X-Mock-Signature`、paymentNo、amount、channel），调用 `processCallback` 处理。

**理由**: 保持完整的支付链路：发起支付 → 支付中 → 回调确认。内部发起和外部回调两种入口共用同一个 `processCallback`。

### D3: 幂等实现方式

通过支付单状态判断幂等：回调时先查询支付单状态，如果已是 PAID 则直接返回成功。利用数据库事务 + 支付单状态 CAS（`WHERE payment_no = ? AND status = 'PAYING'`）确保只有第一次回调生效。

**理由**: 单体应用不需要 Redis 分布式锁，数据库行级锁足够保证幂等。简单可靠。

### D4: 金额校验

回调时校验支付金额与支付单金额一致。模拟场景下金额由服务端控制，校验是防御性编程。

**理由**: 真实支付系统中金额校验是必要环节，从设计阶段就建立这个习惯。

### D5: 避免循环依赖

PaymentServiceImpl 不注入 OrderService，而是直接注入 OrderMapper 和 OrderStateMachine。PaymentService 负责回调处理中更新订单状态、确认库存；OrderService 负责创建/取消订单时调用 PaymentService 创建/关闭支付单。依赖方向为 OrderService → PaymentService → OrderMapper + InventoryService。

**理由**: 当前项目使用构造器注入，循环依赖会直接导致启动失败。PaymentService 回调时只需要更新订单状态和确认库存，不需要完整的 OrderService 能力。

### D6: 回调日志独立事务与写入时机

回调日志通过独立的 `PaymentCallbackLogService`（`@Transactional(propagation = REQUIRES_NEW)`）写入，确保无论回调处理成功还是失败，日志都会持久化。

写入流程：
1. 回调到达时，先在独立事务中创建日志记录，`result` 初始为 "RECEIVED"
2. 执行业务校验和处理
3. 根据最终结果（SUCCESS / IDEMPOTENT_SUCCESS / AMOUNT_MISMATCH / PAYMENT_NOT_FOUND / STATUS_INVALID），在独立事务中更新日志的 `result` 字段
4. 如果步骤 3 之前发生未预期异常，日志保持 "RECEIVED" 状态，仍可用于排查

**理由**: 两阶段写入（先记到达，后记结果）确保日志不丢失且 result 准确反映最终处理状态。使用独立事务保证主流程异常回滚不影响日志。

### D7: 原订单支付端点兼容处理

保留 `PUT /api/order/{orderId}/pay` 端点，改为查询该订单的支付单并返回支付信息（paymentNo、amount、status、channel）。如果支付单已 PAID，返回已支付提示。不直接修改订单状态。

**理由**: 路线图要求"改造 pay API，返回支付信息"，不是删除端点。保留端点可引导前端平滑迁移到新的支付模块。

### D8: 模拟回调端点安全策略

`POST /api/payment/callback` 端点在 SecurityConfig 中 permitAll，允许无 JWT 访问（模拟三方回调）。为防止滥用，该端点校验请求 Header 中的 `X-Mock-Signature`（值为配置项 `payment.mock.signature` 的静态字符串），签名不匹配返回 403。

请求体为 JSON：`{ "paymentNo": "PAY...", "amount": 199.00, "channel": "MOCK" }`。

**理由**: 模拟三方回调无用户 JWT，需要 permitAll。简单签名防止完全无鉴权。

### D9: 优惠券确认推迟至阶段 6

当前阶段优惠券在 `createOrder` 时已通过 `useCoupon` 直接扣减，支付成功后不再做额外的优惠券确认操作。路线图中"支付成功确认优惠券"的验收标准推迟至阶段 6 优惠券生命周期固化时统一实现（引入 lock/confirm 两阶段）。

**理由**: 优惠券当前没有 lock 状态，强行在本阶段加入确认逻辑需要先改造优惠券状态机，超出本阶段范围。推迟是合理的范围控制。

## Risks / Trade-offs

- **[模拟回调无真实异步]** 模拟支付在同一个 HTTP 请求内完成发起和回调，无法测试真实异步回调场景 → 阶段 5 引入 MQ 后可改为异步回调
- **[支付单无超时]** 当前没有支付超时自动关单机制 → 阶段 5 通过 MQ 延迟队列实现
- **[活跃支付单无唯一约束]** 不使用 `order_id` 唯一索引，通过业务逻辑保证活跃支付单唯一 → 并发场景下需注意，但当前单体应用下单/取消已加事务锁，风险可控
- **[事务边界]** 支付回调中需要同时更新支付单、订单状态、确认库存，事务较大 → 单体应用下可接受，后续拆服务时引入最终一致性
- **[优惠券未对齐路线图验收]** 路线图阶段 4 原计划"支付成功后确认优惠券"，本阶段降级为"下单时已扣减，不重复操作"，优惠券 lock/confirm 推迟到阶段 6 → 在 tasks.md 中明确标注
