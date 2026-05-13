## ADDED Requirements

### Requirement: 订单状态枚举定义
系统 SHALL 定义完整的订单状态枚举 `OrderStatus`，包含以下 8 个状态：

| Code | 枚举值 | 中文 |
|------|--------|------|
| 0 | PENDING_PAYMENT | 待支付 |
| 1 | PAID | 已支付 |
| 2 | SHIPPED | 已发货 |
| 3 | COMPLETED | 已完成 |
| 4 | CANCELLED | 已取消 |
| 5 | WAITING_SHIPMENT | 待发货 |
| 6 | REFUNDING | 退款中 |
| 7 | REFUNDED | 已退款 |

系统 SHALL 提供 `OrderStatus.fromCode(Integer)` 方法将数字编码转换为枚举值。系统 SHALL 提供 `OrderStatus.getDescriptionByCode(Integer)` 方法获取状态中文描述。

#### Scenario: 通过编码获取枚举
- **WHEN** 调用 `OrderStatus.fromCode(5)`
- **THEN** 返回 `OrderStatus.WAITING_SHIPMENT`

#### Scenario: 通过编码获取描述
- **WHEN** 调用 `OrderStatus.getDescriptionByCode(7)`
- **THEN** 返回字符串 `"已退款"`

#### Scenario: 无效编码返回 null
- **WHEN** 调用 `OrderStatus.fromCode(99)`
- **THEN** 返回 `null`

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

PAID → WAITING_SHIPMENT 由管理员手动触发，不自动流转。

#### Scenario: 合法状态转换——待支付到已支付
- **WHEN** 订单当前状态为 PENDING_PAYMENT，执行状态机转换到 PAID
- **THEN** 转换成功，订单状态更新为 PAID

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

### Requirement: 订单状态机查询能力
系统 SHALL 提供 `OrderStateMachine.canTransit(OrderStatus from, OrderStatus to)` 方法，返回 boolean 表示是否允许转换，不抛出异常。

#### Scenario: 查询允许的转换
- **WHEN** 调用 `canTransit(PENDING_PAYMENT, PAID)`
- **THEN** 返回 `true`

#### Scenario: 查询不允许的转换
- **WHEN** 调用 `canTransit(CANCELLED, PAID)`
- **THEN** 返回 `false`

### Requirement: 状态机错误响应格式
状态机校验失败时 SHALL 使用统一的错误响应格式：`ResponseCode.ORDER_STATUS_TRANSITION_INVALID`（HTTP 400），错误信息包含当前状态和目标状态的中文描述。

#### Scenario: 转换失败返回标准错误格式
- **WHEN** 订单状态为 PAID(1)，尝试转换到 SHIPPED(2)
- **THEN** 抛出 BusinessException，ResponseCode 为 `ORDER_STATUS_TRANSITION_INVALID`
- **AND** 错误信息为"订单状态不允许从 已支付 转换为 已发货"
