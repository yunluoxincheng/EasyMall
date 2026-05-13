## Context

EasyMall 当前的订单状态管理分布在两个位置：

1. **`OrderStatus` 枚举**（`org.ruikun.enums.OrderStatus`）：定义了 5 个状态（0-4），提供 `fromCode()` 和 `getDescriptionByCode()` 方法。位于共享 `enums` 包中，被 `OrderServiceImpl` 和 `AdminOrderController` 共同引用。
2. **状态校验逻辑**：分散在 `OrderServiceImpl`（4 个方法）和 `AdminOrderController`（2 个方法）中。`OrderServiceImpl` 使用枚举常量校验，`AdminOrderController` 使用硬编码数字（`== 4`、`== 3`、`== 0`）校验。

当前订单流转路径：
```
创建 → 待支付(0) → 支付 → 已支付(1) → 管理员发货 → 已发货(2) → 用户确认 → 已完成(3)
                     ↓
                   用户取消 → 已取消(4)
```

问题：
- `AdminOrderController.updateOrderStatus()` 直接接受任意 Integer 作为目标状态，仅做简单的数字排除校验
- `AdminOrderController.cancelOrder()` 不恢复库存、不返还优惠券（与 `OrderServiceImpl.cancelOrder()` 行为不一致）
- 没有退款相关状态和流程

## Goals / Non-Goals

**Goals:**
- 定义完整的订单状态枚举（8 个状态），覆盖待发货、退款中、已退款场景
- 实现集中的 `OrderStateMachine`，所有状态转换经过统一规则校验
- 消除 `AdminOrderController` 中的硬编码数字判断
- 重构 `OrderServiceImpl` 的状态校验为状态机调用
- 补充管理员发货的两步流程（PAID → WAITING_SHIPMENT → SHIPPED）
- 补齐管理员取消订单的库存恢复和优惠券返还逻辑
- 状态机具备完整的单元测试覆盖

**Non-Goals:**
- 不引入真实第三方支付系统（阶段 4 内容）
- 不重构库存表和库存锁定模型（阶段 3 内容）
- 不引入 MQ 延迟关单（阶段 5 内容）
- 不实现退款业务逻辑（仅定义退款状态和转换规则，为后续阶段预留）
- 不修改数据库表结构（`orders.status` 字段类型不变，INT 已支持新值）
- 不实现前端变更（当前 `easymall-frontend` 为空占位目录，API 变更在阶段 7 前端开发时对接）

## Decisions

### Decision 1: 状态机实现方式——手动状态转换表

**选择**：手动实现 `OrderStateMachine`，使用 `Map<OrderStatus, Set<OrderStatus>>` 定义转换表。

**备选方案**：
- Spring Statemachine 框架：功能强大但对于 EasyMall 的订单状态复杂度来说过重，引入额外依赖和学习成本
- 状态模式（State Pattern）：为每个状态创建类，适合复杂行为但增加大量类文件

**理由**：EasyMall 的订单状态转换规则简单明确（8 个状态、约 12 条转换规则），手动转换表完全够用。代码量少、易理解、易测试，且不引入外部依赖。

### Decision 2: 状态码设计——扩展现有 Integer 编码

**选择**：在现有 0-4 基础上追加 5（待发货）、6（退款中）、7（已退款），保持 Integer 存储。

**理由**：
- 数据库字段 `orders.status` 类型为 INT，无需 DDL 变更
- 已有订单数据（status=0~4）完全兼容，零迁移成本
- 前端/API 消费方按 Integer 解析，向后兼容

**完整状态码表**：

| Code | 枚举值 | 中文 | 说明 |
|------|--------|------|------|
| 0 | PENDING_PAYMENT | 待支付 | 订单已创建，等待用户支付 |
| 1 | PAID | 已支付 | 用户已完成支付 |
| 2 | SHIPPED | 已发货 | 管理员已发货 |
| 3 | COMPLETED | 已完成 | 用户已确认收货 |
| 4 | CANCELLED | 已取消 | 订单已取消 |
| 5 | WAITING_SHIPMENT | 待发货 | 已支付，等待仓库发货 |
| 6 | REFUNDING | 退款中 | 退款申请已提交，处理中 |
| 7 | REFUNDED | 已退款 | 退款已完成 |

### Decision 3: 状态转换规则

**选择**：定义以下转换规则表：

```
PENDING_PAYMENT → PAID              用户支付
PENDING_PAYMENT → CANCELLED         用户/管理员取消未支付订单

PAID → WAITING_SHIPMENT             管理员手动确认备货
PAID → CANCELLED                    管理员取消已支付订单
PAID → REFUNDING                    用户/管理员申请退款

WAITING_SHIPMENT → SHIPPED          管理员发货
WAITING_SHIPMENT → CANCELLED        管理员取消待发货订单
WAITING_SHIPMENT → REFUNDING        申请退款

SHIPPED → COMPLETED                 用户确认收货
SHIPPED → REFUNDING                 用户申请退款（已发货）

COMPLETED → REFUNDING               用户申请退款（已完成）

REFUNDING → REFUNDED                退款完成
REFUNDING → CANCELLED               退款后关闭订单
```

**说明**：
- PAID → WAITING_SHIPMENT 由管理员在后台手动触发（"确认备货"操作），不做自动流转。支付成功后订单保持 PAID 状态，直到管理员显式确认备货。
- PAID → SHIPPED 不允许直接跳转，必须经过 WAITING_SHIPMENT，确保发货流程可追踪
- 退款流程（REFUNDING → REFUNDED/CANCELLED）在状态机中定义规则，但本阶段不实现退款业务逻辑
- 管理员发货操作拆分为两步：确认备货（PAID → WAITING_SHIPMENT）和发货（WAITING_SHIPMENT → SHIPPED）

### Decision 4: OrderStateMachine 类设计

**选择**：作为无状态单例 Bean，注入到需要状态转换的 Service 中。

```java
@Component
public class OrderStateMachine {

    private static final Map<OrderStatus, Set<OrderStatus>> TRANSITIONS = Map.of(
        PENDING_PAYMENT, Set.of(PAID, CANCELLED),
        PAID, Set.of(WAITING_SHIPMENT, CANCELLED, REFUNDING),
        WAITING_SHIPMENT, Set.of(SHIPPED, CANCELLED, REFUNDING),
        SHIPPED, Set.of(COMPLETED, REFUNDING),
        COMPLETED, Set.of(REFUNDING),
        REFUNDING, Set.of(REFUNDED, CANCELLED)
        // CANCELLED, REFUNDED 为终态，无后续转换
    );

    public boolean canTransit(OrderStatus from, OrderStatus to);
    public void transit(Order order, OrderStatus target); // throws BusinessException if invalid
}
```

**关键设计点**：
- `canTransit()` 返回 boolean，用于条件判断
- `transit()` 执行校验并抛出 `BusinessException`，供 Service 层直接使用
- 转换表为 `static final` 不可变 Map，线程安全
- 不持有任何状态，天然线程安全

**错误响应约定**：
- `transit()` 校验失败时抛出 `BusinessException(ResponseCode.ORDER_STATUS_TRANSITION_INVALID, "订单状态不允许从 [当前状态中文] 转换为 [目标状态中文]")`
- 新增 `ResponseCode.ORDER_STATUS_TRANSITION_INVALID`，HTTP 状态码 400
- 目标状态为 null 或无效数字时，由 Controller 层参数校验返回 `VALIDATION_ERROR`

### Decision 5: OrderStatus 枚举位置

**选择**：保持在共享 `org.ruikun.enums` 包中。

**理由**：`OrderStatus` 被 `OrderServiceImpl`、`AdminOrderController`、`OrderVO`（通过 `getDescriptionByCode`）等多处引用。将其移入 `modules/order/` 会增加 admin 模块对 order 模块的耦合。当前放在共享枚举包中是合理的。

### Decision 6: 管理员订单状态变更 API

**选择**：保留 `PUT /api/admin/orders/{id}/status` 的统一接口，通过状态机校验替代当前的硬编码逻辑。

**理由**：状态机已经能完整校验转换合法性，不需要为每个操作创建独立端点。前端通过传入目标状态值（5=待发货、2=已发货）来触发对应转换。

**接口参数校验增强**：
- `status` 参数为 null 时返回 400 `VALIDATION_ERROR`
- `status` 参数不在 0-7 范围内时返回 400 `VALIDATION_ERROR`
- 当前订单状态为终态（CANCELLED/REFUNDED）时返回 400 `ORDER_STATUS_TRANSITION_INVALID`
- 转换路径不合法时返回 400 `ORDER_STATUS_TRANSITION_INVALID`

### Decision 7: 管理员取消订单行为补齐

**问题**：当前 `AdminOrderController.cancelOrder()` 仅更新状态为 CANCELLED，不恢复库存也不返还优惠券。而 `OrderServiceImpl.cancelOrder()`（用户端）同时执行库存恢复和优惠券返还。两者行为不一致。

**选择**：管理员取消订单时，与用户端保持一致，执行以下操作：
1. 状态机校验（仅 PENDING_PAYMENT、PAID、WAITING_SHIPMENT 可取消）
2. 更新订单状态为 CANCELLED
3. 恢复商品库存（遍历 orderItems，调用 `productMapper.increaseStock()`）
4. 返还用户优惠券（如果 `order.userCouponId` 不为 null）

**实现方式**：将取消订单的核心逻辑（状态变更 + 库存恢复 + 优惠券返还）提取到 `OrderServiceImpl` 中作为公共方法 `cancelOrderInternal()`，`OrderServiceImpl.cancelOrder()` 和 `AdminOrderController.cancelOrder()` 共同调用。管理员取消不需要校验 `userId` 归属。

**关于已付款未退款问题**：
- 当前系统支付为模拟支付（`payOrder()` 直接改状态），无真实资金流转
- 管理员取消 PAID/WAITING_SHIPMENT 订单时，只需恢复库存和返还优惠券，无需退款操作
- 真实退款流程将在阶段 4（支付单与支付幂等）引入支付单后实现
- 本阶段在 `AdminOrderController.cancelOrder()` 中添加 TODO 注释，标记退款逻辑的预留位置

## Risks / Trade-offs

- **[Risk] 管理员发货变为两步操作** → 缓解：本阶段前端未实现，API 变更记录在 proposal 的"API 行为变更对比"中，阶段 7 前端开发时对接
- **[Risk] PAID→SHIPPED 直接路径被阻断** → 缓解：当前无前端调用此路径，变更后无存量影响。如需保留兼容可临时放行，但会削弱状态机的保护作用，不建议
- **[Risk] 管理员取消已支付订单后无真实退款** → 缓解：当前为模拟支付无真实资金流转，真实退款在阶段 4 支付单引入后实现。代码中标记 TODO 预留位置
- **[Risk] 退款状态已定义但无业务实现** → 缓解：状态机仅定义转换规则，不暴露退款 API 端点，退款功能在后续阶段实现
- **[Trade-off] 不使用 Spring Statemachine** → 换取了更低的复杂度和零外部依赖，代价是如果未来状态机复杂度暴增（如并行状态、子状态）需要重构
