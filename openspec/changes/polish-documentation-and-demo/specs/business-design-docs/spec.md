## ADDED Requirements

### Requirement: 订单状态机设计文档
`docs/business/order-state-machine.md` SHALL 详细说明订单状态机的设计。

#### Scenario: 读者理解订单状态定义
- **WHEN** 读者打开订单状态机文档
- **THEN** 看到所有订单状态定义（PENDING_PAYMENT、PAID、WAITING_SHIPMENT、SHIPPED、COMPLETED、CANCELLED、REFUNDING、REFUNDED）
- **AND** 看到每个状态的中文说明

#### Scenario: 读者理解状态流转规则
- **WHEN** 读者查看状态流转部分
- **THEN** 看到合法的状态转换表（from → to → trigger）
- **AND** 理解哪些转换是允许的，哪些会抛出异常

### Requirement: 库存模型设计文档
`docs/business/inventory-model.md` SHALL 详细说明库存锁定模型的设计。

#### Scenario: 读者理解库存三态分离
- **WHEN** 读者打开库存模型文档
- **THEN** 理解 available_stock、locked_stock、sold_stock 三态的含义
- **AND** 理解三态之间的流转关系（可售 → 锁定 → 已售 / 锁定 → 可售）

#### Scenario: 读者理解库存操作流程
- **WHEN** 读者查看库存操作部分
- **THEN** 理解下单锁库存、支付确认、取消释放的完整流程
- **AND** 理解并发安全的实现方式（乐观锁 / SQL 条件检查）

### Requirement: 支付系统设计文档
`docs/business/payment-system.md` SHALL 详细说明支付单和支付幂等的设计。

#### Scenario: 读者理解支付单模型
- **WHEN** 读者打开支付系统文档
- **THEN** 理解支付单（payment_order）与订单的关系
- **AND** 理解支付状态生命周期

#### Scenario: 读者理解支付幂等机制
- **WHEN** 读者查看幂等部分
- **THEN** 理解如何防止重复回调导致重复扣库存
- **AND** 理解回调日志的作用

### Requirement: MQ 事件驱动设计文档
`docs/business/mq-event-driven.md` SHALL 详细说明 MQ 事件驱动架构。

#### Scenario: 读者理解领域事件模型
- **WHEN** 读者打开 MQ 事件驱动文档
- **THEN** 看到所有领域事件定义（OrderCreatedEvent、OrderCompletedEvent、ProductChangedEvent 等）
- **AND** 理解事件的生产者和消费者

#### Scenario: 读者理解延迟关单机制
- **WHEN** 读者查看延迟关单部分
- **THEN** 理解 RabbitMQ 延迟消息如何实现超时自动取消
- **AND** 理解消费者幂等处理

### Requirement: 优惠券生命周期设计文档
`docs/business/coupon-lifecycle.md` SHALL 详细说明优惠券完整生命周期。

#### Scenario: 读者理解优惠券状态机
- **WHEN** 读者打开优惠券生命周期文档
- **THEN** 看到优惠券状态定义（UNUSED、LOCKED、USED、EXPIRED、RETURNED）
- **AND** 理解状态流转规则

### Requirement: 积分流水设计文档
`docs/business/points-ledger.md` SHALL 详细说明积分流水和幂等机制。

#### Scenario: 读者理解积分幂等设计
- **WHEN** 读者打开积分流水文档
- **THEN** 理解 biz_type + biz_id 唯一约束如何防止重复发放
- **AND** 理解各业务场景的幂等键设计（ORDER_COMPLETED、COMMENT_APPROVED、DAILY_SIGN_IN 等）
