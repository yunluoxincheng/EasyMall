## MODIFIED Requirements

### Requirement: 订单状态管理
系统 SHALL 允许管理员修改订单的状态。所有状态变更 MUST 经过 `OrderStateMachine` 校验，仅允许合法的状态转换路径。非法转换 SHALL 返回 `ORDER_STATUS_TRANSITION_INVALID` 错误码（HTTP 400），错误信息格式为"订单状态不允许从 [当前状态] 转换为 [目标状态]"。

系统 SHALL 支持管理员执行以下状态变更操作：
- 将已支付订单标记为待发货：PAID(1) → WAITING_SHIPMENT(5)
- 将待发货订单标记为已发货：WAITING_SHIPMENT(5) → SHIPPED(2)
- 其他状态机定义的合法转换路径

目标状态参数为 null 或不在 0-7 范围内时 SHALL 返回 `VALIDATION_ERROR`（HTTP 400）。

#### Scenario: 成功将已支付订单标记为待发货
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置 status=5（待发货）
- **AND** 订单当前状态为 PAID(1)
- **THEN** 订单状态更新为 WAITING_SHIPMENT(5)
- **AND** 状态机校验通过（PAID → WAITING_SHIPMENT 为合法转换）

#### Scenario: 成功将待发货订单标记为已发货
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置 status=2（已发货）
- **AND** 订单当前状态为 WAITING_SHIPMENT(5)
- **THEN** 订单状态更新为 SHIPPED(2)
- **AND** 状态机校验通过（WAITING_SHIPMENT → SHIPPED 为合法转换）

#### Scenario: 非法转换被拒绝——待支付直接到已完成
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置 status=3（已完成）
- **AND** 订单当前状态为 PENDING_PAYMENT(0)
- **THEN** 返回 HTTP 400，code 为 `ORDER_STATUS_TRANSITION_INVALID`
- **AND** 错误信息包含"订单状态不允许从 待支付 转换为 已完成"
- **AND** 订单状态不变

#### Scenario: 非法转换被拒绝——已支付直接到已发货
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置 status=2（已发货）
- **AND** 订单当前状态为 PAID(1)
- **THEN** 返回 HTTP 400，code 为 `ORDER_STATUS_TRANSITION_INVALID`
- **AND** 错误信息包含"PAID → SHIPPED 不是合法的转换路径"

#### Scenario: 非法转换被拒绝——已取消订单
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置任意目标状态
- **AND** 订单当前状态为 CANCELLED(4)
- **THEN** 返回 HTTP 400，code 为 `ORDER_STATUS_TRANSITION_INVALID`
- **AND** 订单状态不变

#### Scenario: 无效状态值被拒绝
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置 status=99
- **THEN** 返回 HTTP 400，code 为 `VALIDATION_ERROR`

### Requirement: 取消订单
系统 SHALL 允许管理员取消订单。管理员取消订单 MUST 经过状态机校验，仅当当前状态允许转换到 CANCELLED 时才可执行（PENDING_PAYMENT、PAID、WAITING_SHIPMENT 可取消）。

管理员取消订单时 MUST 执行以下操作（与用户端取消订单保持一致）：
1. 更新订单状态为 CANCELLED(4)
2. 遍历订单明细，对每个商品调用 `productMapper.increaseStock()` 恢复库存
3. 若订单关联了用户优惠券（`userCouponId` 不为 null），调用 `couponService.returnCoupon()` 返还优惠券

对于 PAID/WAITING_SHIPMENT 状态的订单取消，系统 SHALL 在代码中标记 TODO 注释预留退款逻辑位置（真实退款在阶段 4 支付单引入后实现）。

#### Scenario: 成功取消待支付订单
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/cancel
- **AND** 订单当前状态为 PENDING_PAYMENT(0)
- **THEN** 订单状态更新为 CANCELLED(4)
- **AND** 所有订单明细对应的商品库存被恢复
- **AND** 若订单关联了优惠券，用户优惠券被返还

#### Scenario: 成功取消已支付订单
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/cancel
- **AND** 订单当前状态为 PAID(1)
- **THEN** 订单状态更新为 CANCELLED(4)
- **AND** 所有订单明细对应的商品库存被恢复
- **AND** 若订单关联了优惠券，用户优惠券被返还
- **AND** 代码中包含 TODO 标记预留退款逻辑位置

#### Scenario: 成功取消待发货订单
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/cancel
- **AND** 订单当前状态为 WAITING_SHIPMENT(5)
- **THEN** 订单状态更新为 CANCELLED(4)
- **AND** 所有订单明细对应的商品库存被恢复
- **AND** 若订单关联了优惠券，用户优惠券被返还

#### Scenario: 已取消订单再次取消被拒绝
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/cancel
- **AND** 订单当前状态为 CANCELLED(4)
- **THEN** 返回 HTTP 400，code 为 `ORDER_STATUS_TRANSITION_INVALID`（CANCELLED 为终态）

#### Scenario: 已完成订单取消被拒绝
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/cancel
- **AND** 订单当前状态为 COMPLETED(3)
- **THEN** 返回 HTTP 400，code 为 `ORDER_STATUS_TRANSITION_INVALID`
- **AND** 错误信息提示 COMPLETED 不能直接到 CANCELLED，应走退款流程
