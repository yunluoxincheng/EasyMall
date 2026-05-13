## 1. 盘点现有代码

- [x] 1.1 列出所有使用 `OrderStatus` 枚举的代码位置
- [x] 1.2 列出 `AdminOrderController` 中所有硬编码订单状态数字的位置
- [x] 1.3 确认 `orders.status` 字段数据库类型为 INT（无需 DDL 变更）

## 2. 扩展 OrderStatus 枚举

- [x] 2.1 在 `OrderStatus` 枚举中新增 `WAITING_SHIPMENT(5, "待发货")`
- [x] 2.2 在 `OrderStatus` 枚举中新增 `REFUNDING(6, "退款中")`
- [x] 2.3 在 `OrderStatus` 枚举中新增 `REFUNDED(7, "已退款")`
- [x] 2.4 更新 `Order` 实体类 `status` 字段注释，反映新的 8 个状态值
- [x] 2.5 更新 `OrderVO` 字段注释（如需要）

## 3. 新增 ResponseCode

- [x] 3.1 在 `ResponseCode` 中新增 `ORDER_STATUS_TRANSITION_INVALID`（HTTP 400，"订单状态流转不合法"）

## 4. 实现 OrderStateMachine

- [x] 4.1 在 `modules/order/` 下创建 `OrderStateMachine` 类（`@Component`）
- [x] 4.2 定义 `TRANSITIONS` 静态不可变 Map，包含所有合法转换规则
- [x] 4.3 实现 `canTransit(OrderStatus from, OrderStatus to)` 方法
- [x] 4.4 实现 `transit(Order order, OrderStatus target)` 方法（校验失败抛 BusinessException，使用 `ORDER_STATUS_TRANSITION_INVALID`，错误信息包含当前状态和目标状态的中文描述）
- [x] 4.5 确保终态（CANCELLED、REFUNDED）无后续转换
- [x] 4.6 确保相同状态转换（from == to）被拒绝

## 5. 重构 OrderServiceImpl

- [x] 5.1 注入 `OrderStateMachine`
- [x] 5.2 重构 `createOrder`：创建订单时状态设为 PENDING_PAYMENT（无需改动，确认一致性）
- [x] 5.3 重构 `payOrder`：使用 `stateMachine.transit(order, OrderStatus.PAID)` 替换内联校验
- [x] 5.4 重构 `cancelOrder`：使用 `stateMachine.transit(order, OrderStatus.CANCELLED)` 替换内联校验
- [x] 5.5 重构 `confirmOrder`：使用 `stateMachine.transit(order, OrderStatus.COMPLETED)` 替换内联校验
- [x] 5.6 提取取消订单核心逻辑为 `cancelOrderInternal(Order order)` 方法（状态变更 + 库存恢复 + 优惠券返还），供用户端和管理员端共同调用
- [x] 5.7 确认 `convertToVO` 方法中 `OrderStatus.getDescriptionByCode` 仍正确工作

## 6. 重构 AdminOrderController

- [x] 6.1 注入 `OrderService`（通过 Service 调用 `cancelOrderInternal`）
- [x] 6.2 注入 `OrderStateMachine`
- [x] 6.3 重构 `updateOrderStatus`：用 `stateMachine.transit()` 替换硬编码数字校验（`== 4`、`== 3`、`== 0`）；增加目标状态参数校验（null/无效值返回 `VALIDATION_ERROR`）
- [x] 6.4 重构 `cancelOrder`：用 `stateMachine.transit()` 替换硬编码数字校验，调用 `OrderService.cancelOrderInternal()` 执行库存恢复和优惠券返还
- [x] 6.5 在 `cancelOrder` 中添加 TODO 注释，标记退款逻辑预留位置（阶段 4 实现）

## 7. 更新 admin-order-management 现有 spec

- [x] 7.1 更新 `openspec/specs/admin-order-management/spec.md` 中状态筛选说明，补充 5/6/7 状态值
- [x] 7.2 更新订单状态管理 Requirement 中的状态流转校验场景，反映状态机校验和错误码
- [x] 7.3 更新取消订单 Requirement，补充库存恢复、优惠券返还、退款 TODO 预留行为

## 8. 单元测试

- [x] 8.1 测试 `OrderStateMachine.canTransit`：所有合法转换返回 true
- [x] 8.2 测试 `OrderStateMachine.canTransit`：所有非法转换返回 false
- [x] 8.3 测试 `OrderStateMachine.transit`：合法转换成功设置目标状态
- [x] 8.4 测试 `OrderStateMachine.transit`：非法转换抛出 BusinessException，错误码为 `ORDER_STATUS_TRANSITION_INVALID`
- [x] 8.5 测试终态（CANCELLED、REFUNDED）不可转换到任何状态
- [x] 8.6 测试相同状态转换被拒绝
- [x] 8.7 测试新增枚举值的 fromCode 和 getDescriptionByCode 正确性

## 9. 验证

- [x] 9.1 后端 `mvn compile` 编译通过
- [x] 9.2 后端 `mvn test` 测试通过
- [x] 9.3 后端 `mvn spring-boot:run` 启动成功
- [x] 9.4 现有订单 API（创建、支付、取消、确认收货）功能正常
- [x] 9.5 管理员订单 API（列表、详情、状态变更、取消）功能正常
- [x] 9.6 状态机非法转换返回 `ORDER_STATUS_TRANSITION_INVALID` 错误码和正确错误信息
- [x] 9.7 管理员取消 PAID 订单后商品库存已恢复、优惠券已返还
