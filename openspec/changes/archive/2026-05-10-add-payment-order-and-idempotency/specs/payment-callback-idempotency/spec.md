## ADDED Requirements

### Requirement: 模拟支付发起接口
系统 SHALL 提供 `POST /api/payment/{paymentNo}/pay` 接口，用于发起模拟支付。该接口需要 JWT 认证。该接口 SHALL：
1. 校验支付单存在且属于当前用户
2. 校验支付单状态为 WAITING_PAY
3. 将支付单状态更新为 PAYING
4. 内部调用模拟支付回调处理逻辑
5. 返回支付结果

#### Scenario: 正常发起模拟支付
- **WHEN** 用户调用 `POST /api/payment/PAY20241223001/pay`，支付单状态为 WAITING_PAY
- **THEN** 支付单状态变为 PAID，订单状态变为 PAID，返回支付成功

#### Scenario: 支付单不存在
- **WHEN** 用户调用 `POST /api/payment/NONEXIST/pay`
- **THEN** 返回错误，ResponseCode 为 `PAYMENT_NOT_FOUND`

#### Scenario: 支付单不属于当前用户
- **WHEN** 用户 A 调用属于用户 B 的支付单发起支付
- **THEN** 返回错误，ResponseCode 为 `PAYMENT_NOT_FOUND`

#### Scenario: 支付单已支付
- **WHEN** 用户对状态为 PAID 的支付单发起支付
- **THEN** 返回错误，提示支付单已支付

### Requirement: 模拟三方回调端点
系统 SHALL 提供 `POST /api/payment/callback` 端点，接收模拟三方支付回调。该端点 SHALL permitAll（无 JWT），通过 `X-Mock-Signature` Header 校验防滥用。

请求体格式：
```json
{
  "paymentNo": "PAY20241223001",
  "amount": 199.00,
  "channel": "MOCK"
}
```

该端点 SHALL 调用 `PaymentService.processCallback()` 处理回调逻辑。

#### Scenario: 携带正确签名的回调请求
- **WHEN** 回调请求携带正确的 `X-Mock-Signature` Header，请求体包含 paymentNo、amount、channel
- **THEN** 请求被接受，调用 `processCallback` 处理

#### Scenario: 缺少签名的回调请求
- **WHEN** 回调请求未携带 `X-Mock-Signature` Header
- **THEN** 返回 403 Forbidden

#### Scenario: 签名错误的回调请求
- **WHEN** 回调请求携带错误的 `X-Mock-Signature` Header
- **THEN** 返回 403 Forbidden

### Requirement: 模拟支付回调处理
系统 SHALL 提供 `PaymentService.processCallback(paymentNo, amount, channel)` 方法处理支付回调，执行以下逻辑：
1. 通过 `PaymentCallbackLogService` 在独立事务（`REQUIRES_NEW`）中创建回调日志，`result` 初始为 "RECEIVED"
2. 校验支付单存在，不存在则通过独立事务更新日志 result 为 "PAYMENT_NOT_FOUND"，抛出 BusinessException
3. 幂等校验：如果支付单状态已为 PAID，通过独立事务更新日志 result 为 "IDEMPOTENT_SUCCESS"，直接返回成功，不重复处理
4. 校验支付单状态为 PAYING，否则通过独立事务更新日志 result 为 "STATUS_INVALID"，抛出 BusinessException
5. 校验回调金额与支付单金额一致，不一致则通过独立事务更新日志 result 为 "AMOUNT_MISMATCH"，抛出 BusinessException
6. 更新支付单状态为 PAID，记录 paid_time 和 third_trade_no
7. 触发订单已支付流程（更新订单状态、确认库存）
8. 通过独立事务更新日志 result 为 "SUCCESS"

#### Scenario: 正常回调处理
- **WHEN** 支付回调到达，支付单状态为 PAYING，金额一致
- **THEN** 支付单状态变为 PAID，订单状态变为 PAID，库存确认成功，回调日志 result 为 "SUCCESS"

#### Scenario: 重复回调幂等处理
- **WHEN** 支付回调到达，支付单状态已为 PAID
- **THEN** 不重复更新支付单，不重复更新订单状态，不重复确认库存，返回成功，回调日志 result 为 "IDEMPOTENT_SUCCESS"

#### Scenario: 金额不一致回调拒绝
- **WHEN** 支付回调到达，回调金额为 100.00 但支付单金额为 199.00
- **THEN** 支付单状态不变，回调日志 result 为 "AMOUNT_MISMATCH"（日志在独立事务中已持久化），抛出 BusinessException

#### Scenario: 不存在的支付单号回调
- **WHEN** 支付回调到达，支付单号不存在
- **THEN** 回调日志 result 为 "PAYMENT_NOT_FOUND"（日志在独立事务中已持久化），抛出 BusinessException

### Requirement: 回调触发订单已支付流程
支付回调成功后 SHALL 触发以下操作（在同一事务内）：
1. 通过订单状态机将订单状态从 PENDING_PAYMENT 转换为 PAID
2. 记录订单的 paymentMethod 和 payTime
3. 调用 `InventoryService.confirmSoldStock()` 确认每个订单项的库存

注意：PaymentService 直接注入 OrderMapper 和 OrderStateMachine，不注入 OrderService，避免循环依赖。

#### Scenario: 回调成功后订单状态更新
- **WHEN** 支付回调成功处理
- **THEN** 订单状态通过状态机从 PENDING_PAYMENT 转换为 PAID，payTime 记录为当前时间

#### Scenario: 回调成功后库存确认
- **WHEN** 支付回调成功处理，订单包含 2 个商品项
- **THEN** 调用 `confirmSoldStock` 确认所有订单项的锁定库存转为已售库存

### Requirement: 订单取消时关闭支付单
当订单取消时，系统 SHALL 同时将关联的活跃支付单（WAITING_PAY 或 PAYING 状态）状态更新为 CLOSED。

#### Scenario: 取消订单关闭支付单
- **WHEN** 用户取消一笔 PENDING_PAYMENT 状态的订单，该订单有一笔 WAITING_PAY 状态的支付单
- **THEN** 支付单状态变为 CLOSED

#### Scenario: 已支付订单取消不影响支付单
- **WHEN** 管理员取消一笔 PAID 状态的订单
- **THEN** 已 PAID 的支付单状态不变

### Requirement: 重复回调不重复确认库存
支付回调幂等处理 SHALL 确保库存确认操作不重复执行。通过支付单状态 CAS（`WHERE payment_no = ? AND status = 'PAYING'`）确保只有第一次成功的回调会触发库存确认。

#### Scenario: 重复回调不触发库存确认
- **WHEN** 支付回调重复到达（支付单已 PAID）
- **THEN** 幂等校验直接返回成功，不调用 `confirmSoldStock`

#### Scenario: 并发回调仅一个成功
- **WHEN** 两笔并发回调同时到达同一支付单（状态为 PAYING）
- **THEN** 仅一个通过 CAS 更新成功并触发库存确认，另一个因状态已变为 PAID 而走幂等路径

### Requirement: 优惠券确认推迟说明
系统 SHALL 在支付回调处理过程中不执行任何优惠券相关操作。优惠券已在下单时通过 `useCoupon` 直接扣减，支付回调 SHALL NOT 触发额外的优惠券确认或变更。优惠券 lock/confirm 两阶段机制推迟至阶段 6（优惠券与积分生命周期固化）实现。

#### Scenario: 支付成功不触发优惠券操作
- **WHEN** 支付回调成功处理
- **THEN** 不执行任何优惠券相关操作（优惠券已在下单时扣减完毕）

### Requirement: 支付信息查询接口
系统 SHALL 提供 `GET /api/payment/order/{orderId}` 接口，根据订单ID查询该订单的支付信息。

#### Scenario: 查询订单的支付信息
- **WHEN** 用户查询订单 ID=1 的支付信息
- **THEN** 返回该订单关联的支付单信息（paymentNo、amount、status、channel）

#### Scenario: 订单无支付信息
- **WHEN** 用户查询的订单没有关联支付单
- **THEN** 返回错误，ResponseCode 为 `PAYMENT_NOT_FOUND`
