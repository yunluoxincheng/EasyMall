## MODIFIED Requirements

### Requirement: 回调触发订单已支付流程

支付回调成功后 SHALL 触发以下操作（在同一事务内）：
1. 通过订单状态机将订单状态从 PENDING_PAYMENT 转换为 PAID
2. 记录订单的 paymentMethod 和 payTime
3. 调用 `InventoryService.confirmSoldStock()` 确认每个订单项的库存
4. 当订单关联锁定优惠券时，调用优惠券生命周期服务确认该优惠券为已使用

注意：PaymentService 直接注入 OrderMapper、OrderStateMachine、InventoryService 和 CouponService 所需的最小接口，不注入 OrderService，避免循环依赖。

#### Scenario: 回调成功后订单状态更新
- **WHEN** 支付回调成功处理
- **THEN** 订单状态通过状态机从 PENDING_PAYMENT 转换到 PAID，payTime 记录为当前时间

#### Scenario: 回调成功后库存确认
- **WHEN** 支付回调成功处理，订单包含 2 个商品项
- **THEN** 调用 `confirmSoldStock` 确认所有订单项的锁定库存转为已售库存

#### Scenario: 回调成功后优惠券确认
- **WHEN** 支付回调成功处理，订单关联用户优惠券 ID 3001
- **AND** 用户优惠券 ID 3001 处于该订单的 `LOCKED` 状态
- **THEN** 调用优惠券生命周期服务将用户优惠券 ID 3001 确认为 `USED`

### Requirement: 优惠券确认推迟说明

系统 SHALL 在支付回调处理过程中执行优惠券确认操作。优惠券在下单时仅被锁定为 `LOCKED`，支付回调成功后 SHALL 将该订单锁定的优惠券确认为 `USED`；支付失败、支付单关闭、订单取消或超时取消 SHALL NOT 确认优惠券为已使用。

#### Scenario: 支付成功触发优惠券确认
- **WHEN** 支付回调成功处理
- **AND** 订单关联锁定优惠券
- **THEN** 系统将锁定优惠券确认为已使用

#### Scenario: 支付失败不触发优惠券确认
- **WHEN** 支付回调因金额不一致或状态非法失败
- **THEN** 系统不确认优惠券为已使用

#### Scenario: 支付单关闭不触发优惠券确认
- **WHEN** 订单取消导致活跃支付单关闭
- **THEN** 系统不确认优惠券为已使用

### Requirement: 重复回调不重复确认库存

支付回调幂等处理 SHALL 确保库存确认操作和优惠券确认操作不重复执行。通过支付单状态 CAS（`WHERE payment_no = ? AND status = 'PAYING'`）确保只有第一次成功的回调会触发库存确认和优惠券确认。

#### Scenario: 重复回调不触发库存确认
- **WHEN** 支付回调重复到达（支付单已 PAID）
- **THEN** 幂等校验直接返回成功，不调用 `confirmSoldStock`

#### Scenario: 重复回调不触发优惠券确认
- **WHEN** 支付回调重复到达（支付单已 PAID）
- **AND** 订单关联优惠券已确认为 `USED`
- **THEN** 幂等校验直接返回成功，不重复确认优惠券

#### Scenario: 并发回调仅一个成功
- **WHEN** 两笔并发回调同时到达同一支付单（状态为 PAYING）
- **THEN** 仅一个通过 CAS 更新成功并触发库存确认和优惠券确认，另一个因状态已变为 PAID 而走幂等路径
