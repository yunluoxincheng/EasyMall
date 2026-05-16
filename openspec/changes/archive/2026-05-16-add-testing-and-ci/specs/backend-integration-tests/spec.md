## ADDED Requirements

### Requirement: Order creation integration test
系统 SHALL 提供集成测试验证创建订单的跨模块服务编排：校验商品库存→锁定库存→锁定优惠券→创建订单。

#### Scenario: Create order with coupon successfully
- **WHEN** 调用 OrderService.createOrder()，库存充足且优惠券可用
- **THEN** 订单创建成功，OrderStatus 为 PENDING_PAYMENT，Inventory 中 locked_stock 增加对应数量，Coupon 状态变为 LOCKED

#### Scenario: Create order with insufficient stock
- **WHEN** 调用 OrderService.createOrder() 但商品库存不足
- **THEN** 抛出 BusinessException，订单未创建，库存未锁定，优惠券状态不变

### Requirement: Payment callback integration test
系统 SHALL 提供集成测试验证支付回调的跨模块服务编排：校验支付单→更新支付单状态→确认库存扣减→确认优惠券使用→更新订单状态。

#### Scenario: Successful payment callback
- **WHEN** 调用 PaymentService.processCallback() 处理有效的支付回调
- **THEN** 支付单状态变为 PAID，库存 locked_stock 减少且 sold_stock 增加，优惠券状态变为 USED，订单状态变为 PAID

#### Scenario: Duplicate payment callback idempotency
- **WHEN** 同一支付单收到重复回调
- **THEN** 第二次回调直接返回成功，所有下游操作（库存确认、优惠券确认）不重复执行

### Requirement: Order cancellation integration test
系统 SHALL 提供集成测试验证取消订单的跨模块服务编排：校验订单状态→释放库存→返还优惠券→更新订单状态。

#### Scenario: Cancel pending payment order
- **WHEN** 调用 OrderService.cancelOrder() 取消待支付订单
- **THEN** 订单状态变为 CANCELLED，Inventory 中 locked_stock 减少且 available_stock 恢复，优惠券状态变为 UNUSED

### Requirement: Order completion and points integration test
系统 SHALL 提供集成测试验证确认收货的跨模块服务编排：校验订单状态→订单完成→发布积分发放事件。积分发放的幂等逻辑由 PointsService 单元测试独立覆盖。

#### Scenario: Confirm receipt completes order
- **WHEN** 调用 OrderService.confirmOrder() 确认已发货订单
- **THEN** 订单状态变为 COMPLETED

#### Scenario: Points service idempotency prevents duplicate issuing
- **WHEN** 同一笔 ORDER_COMPLETED 业务事件重复触发积分发放
- **THEN** 仅第一笔成功发放积分，后续调用因 uk_biz 唯一键约束跳过
