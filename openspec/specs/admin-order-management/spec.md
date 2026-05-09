# admin-order-management Specification

## Purpose
TBD - created by archiving change add-admin-module. Update Purpose after archive.
## Requirements
### Requirement: 订单列表分页查询
系统 SHALL 允许管理员通过分页查询获取订单列表，并支持按订单号、用户 ID、订单状态、时间范围进行筛选。

#### Scenario: 成功查询订单列表
- **WHEN** 管理员请求 GET /api/admin/orders，提供页码、页大小等分页参数
- **THEN** 返回订单分页结果，包含订单 ID、订单号、用户信息、订单金额、订单状态、创建时间等信息
- **AND** 支持按订单号精确或模糊搜索
- **AND** 支持按用户 ID 筛选
- **AND** 支持按订单状态筛选（0=待支付，1=已支付，2=已发货，3=已完成，4=已取消，5=待发货，6=退款中，7=已退款）
- **AND** 支持按创建时间范围筛选

### Requirement: 订单详情查询
系统 SHALL 允许管理员查询指定订单的完整详细信息，包括订单商品明细。

#### Scenario: 成功查询订单详情
- **WHEN** 管理员请求 GET /api/admin/orders/{id}
- **THEN** 返回订单的完整信息，包括订单基本信息、收货地址、订单商品列表（商品名称、单价、数量、小计）

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

#### Scenario: 成功将待发货订单标记为已发货
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置 status=2（已发货）
- **AND** 订单当前状态为 WAITING_SHIPMENT(5)
- **THEN** 订单状态更新为 SHIPPED(2)

#### Scenario: 状态流转校验——非法转换被拒绝
- **WHEN** 管理员尝试将订单从待支付状态直接改为已完成
- **THEN** 返回 HTTP 400，code 为 `ORDER_STATUS_TRANSITION_INVALID`，订单状态不变

#### Scenario: 无效状态值被拒绝
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置 status=99
- **THEN** 返回 HTTP 400，code 为 `VALIDATION_ERROR`

### Requirement: 取消订单
系统 SHALL 允许管理员取消订单。管理员取消订单 MUST 经过状态机校验，仅当当前状态允许转换到 CANCELLED 时才可执行（PENDING_PAYMENT、PAID、WAITING_SHIPMENT 可取消）。

管理员取消订单时 MUST 执行以下操作：
1. 更新订单状态为 CANCELLED(4)
2. 遍历订单明细，恢复商品库存
3. 若订单关联了用户优惠券，返还优惠券

对于 PAID/WAITING_SHIPMENT 状态的订单取消，系统 SHALL 在代码中标记 TODO 注释预留退款逻辑位置。

#### Scenario: 成功取消订单
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/cancel
- **THEN** 订单状态更新为已取消（status=4）
- **AND** 所有订单明细对应的商品库存被恢复
- **AND** 若订单关联了优惠券，用户优惠券被返还

