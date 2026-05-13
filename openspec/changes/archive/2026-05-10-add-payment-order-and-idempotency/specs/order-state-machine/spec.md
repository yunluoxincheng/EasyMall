## MODIFIED Requirements

### Requirement: 订单状态机转换规则
系统 SHALL 提供 `OrderStateMachine` 组件，集中定义并校验所有合法的订单状态转换路径。

合法转换规则：

| 当前状态 | 允许转换到 |
|----------|-----------|
| PENDING_PAYMENT | PAID, CANCELLED |
| PAID | WAITING_SHIPMENT, CANCELLED, REFUNDING |
| WAITING_SHIPMENT | SHIPPED, CANCELLED, REFUNDING |
| SHIPPED | COMPLETED, REFUNDING |
| COMPLETED | REFUNDING |
| REFUNDING | REFUNDED, CANCELLED |
| CANCELLED | （终态，无后续转换） |
| REFUNDED | （终态，无后续转换） |

PENDING_PAYMENT → PAID 的转换 SHALL 由支付回调触发。用户通过支付模块 `POST /api/payment/{paymentNo}/pay` 发起支付，PaymentService 内部处理回调时通过 OrderStateMachine 执行此状态转换。

PAID → WAITING_SHIPMENT 由管理员手动触发，不自动流转。

#### Scenario: 合法状态转换——待支付到已支付（通过支付回调）
- **WHEN** 支付回调成功处理，订单当前状态为 PENDING_PAYMENT
- **THEN** 支付模块通过状态机将订单状态转换到 PAID，转换成功

#### Scenario: 合法状态转换——已支付到待发货
- **WHEN** 订单当前状态为 PAID，执行状态机转换到 WAITING_SHIPMENT
- **THEN** 转换成功，订单状态更新为 WAITING_SHIPMENT

#### Scenario: 合法状态转换——待发货到已发货
- **WHEN** 订单当前状态为 WAITING_SHIPMENT，执行状态机转换到 SHIPPED
- **THEN** 转换成功，订单状态更新为 SHIPPED

#### Scenario: 非法状态转换——待支付直接到已发货
- **WHEN** 订单当前状态为 PENDING_PAYMENT，尝试转换到 SHIPPED
- **THEN** 转换失败，抛出 BusinessException（code 为 `ORDER_STATUS_TRANSITION_INVALID`）

#### Scenario: 非法状态转换——已取消订单无法变更
- **WHEN** 订单当前状态为 CANCELLED，尝试转换到任意其他状态
- **THEN** 转换失败，抛出 BusinessException

#### Scenario: 非法状态转换——已退款订单无法变更
- **WHEN** 订单当前状态为 REFUNDED，尝试转换到任意其他状态
- **THEN** 转换失败，抛出 BusinessException

#### Scenario: 相同状态转换不允许
- **WHEN** 订单当前状态为 PAID，尝试转换到 PAID
- **THEN** 转换失败，抛出 BusinessException

#### Scenario: 原订单支付端点改为返回支付单信息
- **WHEN** 用户调用 `PUT /api/order/{orderId}/pay`
- **THEN** 系统查询该订单关联的支付单，返回支付信息（paymentNo、amount、status、channel），不直接修改订单状态；如果支付单已 PAID，返回提示"订单已支付"
