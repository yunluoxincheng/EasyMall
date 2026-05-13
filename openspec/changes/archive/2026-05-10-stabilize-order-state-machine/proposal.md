## Why

EasyMall 当前的订单状态管理存在三个核心问题：

1. **状态检查分散且不一致**：`OrderServiceImpl` 使用 `OrderStatus` 枚举进行状态校验，但 `AdminOrderController.updateOrderStatus()` 和 `cancelOrder()` 仍使用硬编码数字（`currentStatus == 4`、`status == 3`）进行判断，两处逻辑不统一且容易遗漏边界条件。
2. **缺少状态机保护**：没有集中的状态转换规则定义，每个操作方法各自内联校验"当前状态是否允许本次操作"。如果未来增加退款流程或 MQ 延迟关单，每个新增的状态变更点都需要重复编写校验逻辑，容易出错。
3. **状态定义不完整**：当前只有 5 个状态（待支付、已支付、已发货、已完成、已取消），缺少"待发货"、"退款中"、"已退款"等电商核心状态，无法支撑真实的交易链路。

本阶段的目标是引入独立的订单状态机，使所有状态变更经过统一的转换规则校验，并补齐缺失的订单状态，为后续库存锁定（阶段 3）、支付幂等（阶段 4）、MQ 延迟关单（阶段 5）建立可靠的状态流转基础。

## What Changes

- 新增 `WAITING_SHIPMENT`（待发货）、`REFUNDING`（退款中）、`REFUNDED`（已退款）三个订单状态到 `OrderStatus` 枚举。
- 新增 `OrderStateMachine` 类，集中定义所有合法的状态转换路径，提供 `canTransit(from, to)` 和 `transit(order, target)` 方法。
- 重构 `OrderServiceImpl` 中所有状态变更逻辑，将内联的状态校验替换为状态机调用。
- 重构 `AdminOrderController` 中的订单状态管理，消除硬编码数字判断，改为使用状态机校验。
- 补充管理员发货操作的状态转换（PAID → WAITING_SHIPMENT → SHIPPED）。
- 补齐管理员取消订单的库存恢复和优惠券返还逻辑，与用户端行为对齐。
- **BREAKING**：`OrderVO.status` 字段的语义不变，但状态值新增 5（待发货）、6（退款中）、7（已退款）。
- **BREAKING**：`PUT /api/admin/orders/{id}/status` 接口增加状态机校验，之前直接设置任意 status 值的行为将受到转换规则约束。
- 新增状态机单元测试，覆盖所有合法转换和非法转换场景。

## Capabilities

### New Capabilities
- `order-state-machine`: 订单状态机——定义 OrderStatus 枚举、状态转换规则表、OrderStateMachine 类及其使用约定

### Modified Capabilities
- `admin-order-management`: 订单状态管理接口增加状态机校验，发货流程拆分为 PAID → WAITING_SHIPMENT → SHIPPED，消除硬编码数字判断，管理员取消订单补齐库存恢复和优惠券返还

## Impact

- **代码文件**：`OrderStatus` 枚举、`OrderServiceImpl`、`AdminOrderController`、`Order` 实体注释、`OrderVO` 注释
- **API 接口**：`PUT /api/admin/orders/{id}/status` 增加转换规则约束；`OrderVO.status` 新增可选值 5/6/7
- **API 行为变更**（详见下表）
- **数据库**：`orders.status` 字段语义扩展（值域从 0-4 扩展到 0-7），无需 DDL 变更（INT 类型已支持）
- **查询接口**：`GET /api/admin/orders` 按 status 筛选支持新增值 5/6/7
- **依赖关系**：后续阶段 3（库存锁定）、阶段 4（支付幂等）、阶段 5（MQ 延迟关单）均依赖本阶段建立的状态机
- **不涉及**：不引入真实支付系统、不重构库存表、不引入 MQ、不修改数据库表结构
- **前端对接说明**：当前 `easymall-frontend` 为空占位目录，本阶段的所有 API 变更在前端开发（阶段 7）时对接。管理员发货从一步（PAID→SHIPPED）变为两步（PAID→WAITING_SHIPMENT→SHIPPED），前端需相应调整。

### API 行为变更对比

#### PUT /api/admin/orders/{id}/status

| 当前行为 | 状态机后行为 | 变更类型 |
|----------|-------------|----------|
| PAID(1) → SHIPPED(2) 允许 | PAID(1) → SHIPPED(2) 拒绝，需先到 WAITING_SHIPMENT(5) | **BREAKING** |
| 任意非终态 → 任意非终态（仅排除 4→*、3→*、0→3） | 仅允许状态机定义的合法路径 | **BREAKING** |
| 非法操作返回 `ORDER_STATUS_ERROR` | 非法操作返回 `ORDER_STATUS_TRANSITION_INVALID`，错误信息格式："订单状态不允许从 [当前状态] 转换为 [目标状态]" | 响应细化 |
| 目标状态为 null 或无效数字（如 99） | 目标状态为 null 或无效数字时返回 `VALIDATION_ERROR` | 新增校验 |

#### PUT /api/admin/orders/{id}/cancel

| 当前行为 | 状态机后行为 | 变更类型 |
|----------|-------------|----------|
| 仅排除已取消(4)和已完成(3) | 状态机校验：仅 PENDING_PAYMENT、PAID、WAITING_SHIPMENT 可取消 | 收紧 |
| 取消后不恢复库存、不返还优惠券 | 取消后恢复商品库存、返还用户优惠券 | 行为补齐 |
| 已完成订单可取消（但实际无操作） | 已完成订单拒绝取消，提示走退款流程 | **BREAKING** |

#### 状态机拒绝转换时的错误响应

```json
{
  "success": false,
  "code": "ORDER_STATUS_TRANSITION_INVALID",
  "message": "订单状态不允许从 已支付 转换为 已发货",
  "timestamp": "2026-05-10T12:00:00",
  "traceId": "...",
  "errors": [
    {
      "field": "status",
      "code": "INVALID_TRANSITION",
      "message": "PAID → SHIPPED 不是合法的转换路径",
      "rejectedValue": 2
    }
  ]
}
```
