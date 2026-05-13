## ADDED Requirements

### Requirement: 优惠券生命周期状态模型

系统 SHALL 为用户优惠券定义明确的生命周期状态，并通过 `CouponStatus` 枚举表达状态含义。

状态 SHALL 至少包含：

| Code | 枚举值 | 中文 |
|------|--------|------|
| 0 | UNUSED | 未使用 |
| 1 | USED | 已使用 |
| 2 | EXPIRED | 已过期 |
| 3 | LOCKED | 已锁定 |
| 4 | RETURNED | 已返还 |
| 5 | INVALID | 已失效 |

系统 SHALL 只允许订单创建将 `UNUSED` 优惠券锁定为 `LOCKED`，支付成功将 `LOCKED` 优惠券确认为 `USED`，待支付订单取消将 `LOCKED` 优惠券返还为可再次使用状态。

`RETURNED` SHALL be available as lifecycle vocabulary for return operations, but a still-valid returned user-coupon row MAY be restored directly to `UNUSED` for reuse while the return audit trail is recorded in `coupon_usage_log`.

#### Scenario: 优惠券领取后为未使用
- **WHEN** 用户成功领取优惠券
- **THEN** 用户优惠券状态为 `UNUSED`

#### Scenario: 下单锁定优惠券
- **WHEN** 用户使用 `UNUSED` 优惠券创建订单
- **THEN** 用户优惠券状态变为 `LOCKED`
- **AND** 用户优惠券记录关联订单 ID 和订单号

#### Scenario: 支付成功确认优惠券
- **WHEN** 使用优惠券的订单支付成功
- **THEN** 用户优惠券状态从 `LOCKED` 变为 `USED`
- **AND** 用户优惠券记录使用时间

#### Scenario: 待支付订单取消返还优惠券
- **WHEN** 使用优惠券的待支付订单被取消
- **THEN** 用户优惠券从 `LOCKED` 恢复为 `UNUSED`
- **AND** 系统写入返还生命周期日志
- **AND** 用户可以在有效期内重新使用该优惠券

### Requirement: 优惠券生命周期操作幂等

系统 SHALL 确保优惠券锁定、确认使用、返还操作具备业务幂等性。重复支付回调、重复取消请求、重复延迟关单消息不得导致优惠券状态错误、重复统计或重复日志副作用。

#### Scenario: 重复锁定同一优惠券失败
- **WHEN** 订单创建尝试锁定状态不是 `UNUSED` 的优惠券
- **THEN** 系统拒绝锁定
- **AND** 订单创建失败并返回优惠券不可用错误

#### Scenario: 重复确认已使用优惠券
- **WHEN** 支付回调重复到达，用户优惠券已经为 `USED` 且关联同一订单
- **THEN** 系统视为确认已完成
- **AND** 不重复增加优惠券模板已使用数量
- **AND** 不重复写入确认使用日志

#### Scenario: 重复返还已恢复优惠券
- **WHEN** 取消流程重复执行，用户优惠券已经不再处于该订单的 `LOCKED` 状态
- **THEN** 系统不重复返还
- **AND** 不重复减少统计或写入返还日志

### Requirement: 优惠券生命周期操作日志

系统 SHALL 记录优惠券生命周期操作日志，用于后台查询、统计和问题追踪。日志 SHALL 能区分锁定、确认使用、返还、过期和失效等操作。

#### Scenario: 锁定优惠券写入日志
- **WHEN** 订单创建成功锁定优惠券
- **THEN** 系统写入优惠券锁定日志
- **AND** 日志包含用户 ID、用户优惠券 ID、模板 ID、订单 ID、订单号、订单金额和优惠金额

#### Scenario: 确认优惠券写入日志
- **WHEN** 支付成功确认优惠券为已使用
- **THEN** 系统写入优惠券确认使用日志

#### Scenario: 返还优惠券写入日志
- **WHEN** 订单取消返还锁定优惠券
- **THEN** 系统写入优惠券返还日志

## MODIFIED Requirements

### Requirement: 订单使用优惠券

系统 SHALL 支持用户在下单时使用优惠券进行抵扣，并 SHALL 使用锁定、确认、返还三阶段生命周期保护订单集成一致性。

#### Scenario: 选择可用优惠券
- **WHEN** 用户在结算页面
- **AND** 购物车商品金额满足优惠券使用门槛
- **THEN** 系统显示用户可用的优惠券列表
- **AND** 显示每张优惠券的优惠金额
- **AND** 仅显示状态为 `UNUSED` 且未过期的优惠券

#### Scenario: 应用优惠券计算优惠金额
- **WHEN** 用户选择一张优惠券
- **AND** 订单金额满足使用门槛
- **THEN** 系统计算并显示优惠后的金额
- **AND** 固定金额券直接扣除优惠金额
- **AND** 百分比券按比例计算优惠金额

#### Scenario: 不满足使用门槛
- **WHEN** 用户选择的优惠券使用门槛为100元
- **AND** 订单金额为80元
- **THEN** 系统提示不满足使用条件
- **AND** 不允许使用该优惠券

#### Scenario: 会员等级限制
- **WHEN** 用户选择会员专属优惠券
- **AND** 当前会员等级不满足要求
- **THEN** 系统提示会员等级不足
- **AND** 不允许使用该优惠券

#### Scenario: 创建订单时锁定优惠券
- **WHEN** 用户使用优惠券创建订单
- **AND** 优惠券属于当前用户
- **AND** 优惠券状态为 `UNUSED`
- **AND** 优惠券未过期
- **AND** 订单金额满足使用门槛和会员等级限制
- **THEN** 系统将优惠券状态更新为 `LOCKED`
- **AND** 记录订单 ID、订单号和优惠金额
- **AND** 订单保存 `user_coupon_id` 和 `coupon_discount`
- **AND** 优惠券在锁定期间不能被其他订单再次使用

#### Scenario: 支付成功后确认优惠券为已使用
- **WHEN** 使用优惠券的订单支付成功
- **THEN** 系统将该订单锁定的优惠券状态更新为 `USED`
- **AND** 记录使用时间
- **AND** 优惠券模板已使用数量只增加一次

#### Scenario: 取消订单返还优惠券
- **WHEN** 使用优惠券的待支付订单被取消
- **AND** 优惠券仍处于该订单的 `LOCKED` 状态
- **THEN** 系统将优惠券状态恢复为 `UNUSED`
- **AND** 清除当前锁定记录，使用户可以在有效期内重新使用
- **AND** 系统通过优惠券生命周期日志记录返还操作

#### Scenario: 已支付订单不返还优惠券
- **WHEN** 使用优惠券的订单已经支付成功
- **AND** 优惠券状态为 `USED`
- **THEN** 取消或延迟关单流程不得将该优惠券返还为可用状态

### Requirement: 优惠券状态自动更新

系统 SHALL 自动更新优惠券状态，确保数据一致性。自动过期 SHALL 覆盖未使用优惠券，并 SHALL 安全处理已锁定但订单不再可支付的优惠券。

#### Scenario: 优惠券自动过期
- **WHEN** 优惠券到达有效期结束时间
- **THEN** 系统自动将未使用且未锁定的优惠券状态更新为 `EXPIRED`
- **AND** 用户无法使用过期的优惠券

#### Scenario: 定时任务处理过期状态
- **WHEN** 系统运行定时任务
- **THEN** 扫描所有 `UNUSED` 且已过期的优惠券
- **AND** 批量更新状态为 `EXPIRED`

#### Scenario: 已锁定优惠券随订单取消返还时已过期
- **WHEN** 待支付订单取消时关联优惠券状态为 `LOCKED`
- **AND** 该优惠券已超过有效期结束时间
- **THEN** 系统将优惠券状态更新为 `EXPIRED`
- **AND** 用户无法再次使用该优惠券
