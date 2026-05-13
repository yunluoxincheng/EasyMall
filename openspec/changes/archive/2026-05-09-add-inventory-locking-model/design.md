## Context

当前 EasyMall 的库存管理直接在 `product` 表上操作：
- 下单时 `productMapper.decreaseStock()` 直接扣减 `product.stock`
- 取消订单时 `productMapper.increaseStock()` 直接回加 `product.stock`
- 没有独立的库存表、没有库存流水、没有锁定/确认机制

这意味着：
- 未支付订单消耗真实可售库存，其他用户可能买不到
- 库存恢复完全依赖手动取消订单
- 无法追踪库存变动历史
- 并发场景下仅靠 `WHERE stock >= quantity` 做乐观保护，没有独立的库存版本控制

阶段二已引入 `OrderStatus` 枚举和 `OrderStateMachine`，订单状态流转已规范化。本阶段在此基础上引入独立的库存锁定模型。

## Goals / Non-Goals

**Goals:**
- 引入独立的 `inventory` 表，区分 `available_stock`、`locked_stock`、`sold_stock`
- 引入 `inventory_log` 表，记录所有库存变动流水
- 下单时锁定库存（减少可售、增加锁定），不再直接扣减 `product.stock`
- 取消订单时释放锁定库存（减少锁定、增加可售）
- 支付成功时确认库存（减少锁定、增加已售）
- 并发安全的库存操作（乐观锁 + SQL 条件判断）

**Non-Goals:**
- 不引入分布式库存服务
- 不做 Redis 预扣减（秒杀场景）
- 不引入消息队列（阶段五内容）
- 不做跨仓库、多 SKU 库存管理
- 退款库存回退不在本阶段处理（退款涉及支付单回退和优惠券返还，将在阶段六统一处理）
- `product.stock` 保留为展示冗余字段，不删除

## Decisions

### D1: 独立 inventory 表 vs 在 product 表增加字段

**选择**: 新建独立 `inventory` 表

**理由**: 库存是独立的领域概念，应与商品基础信息分离。独立表便于后续扩展（如多仓库、多 SKU），也避免 `product` 表字段膨胀。`product.stock` 保留为展示冗余字段，定期从 `inventory.available_stock` 同步。

**备选方案**: 在 `product` 表增加 `locked_stock`、`sold_stock` 字段。被否决，因为违反单一职责，商品表不应承载库存状态。

### D2: 乐观锁（version 字段）vs 数据库行锁（SELECT FOR UPDATE）

**选择**: 乐观锁（`version` 字段）+ SQL 条件判断

**理由**: EasyMall 当前为单体应用，并发压力可控。乐观锁无锁等待开销，适合读多写少场景。SQL 条件 `WHERE available_stock >= #{quantity}` 作为第一道防线，`version` 作为第二道防线。

**备选方案**: `SELECT ... FOR UPDATE` 行锁。被否决，因为当前不需要强一致性保证，且行锁会增加数据库压力。

### D3: product.stock 同步策略

**选择**: `product.stock` 作为展示冗余字段，在库存变动时同步更新

**理由**: 前端商品列表展示库存数量需要快速查询，`product.stock` 作为冗余字段可避免每次 JOIN `inventory` 表。库存服务在 lock/release/confirm 操作后同步更新 `product.stock = inventory.available_stock`。

### D4: 库存模块位置

**选择**: 新建 `modules/inventory/` 独立模块

**理由**: 库存是独立的业务领域，与商品模块、订单模块都有交互，应作为独立模块存在。模块内包含 entity、mapper、service，不暴露 controller（库存操作由订单和商品模块调用）。

### D5: inventory_log 记录粒度

**选择**: 每次库存变动都记录日志，包含变动前后数量

**理由**: 库存变动是电商核心操作，完整流水便于排查库存异常、对账和审计。`change_type` 使用字符串枚举（如 `ORDER_LOCK`、`ORDER_RELEASE`、`PAYMENT_CONFIRM`、`ADMIN_ADJUST`）。

### D6: 管理员库存 API 语义——绝对值 vs 相对值

**选择**: 外部 API 保持绝对值语义（`PUT /api/admin/products/{id}/stock` 传入新的库存总量），内部 `InventoryService` 提供 `setStock(productId, newTotalStock)` 方法计算差值后操作 inventory 表。

**理由**: 当前 `AdminProductController.updateProductStock()` 已使用绝对值语义（`update.setStock(stock)`），前端也按绝对值交互。改为相对值会破坏现有 API 契约。`setStock` 内部计算 `差值 = newTotalStock - currentTotalStock`，然后通过 `adjustStock` 执行相对变动，确保 inventory_log 记录完整。

**备选方案**: 改为相对值 API（传入增减量）。被否决，因为破坏现有接口契约，且绝对值对管理员更直观。

### D7: 商品软删除时 inventory 记录处理

**选择**: 商品软删除时 inventory 记录保留不动

**理由**: inventory 记录可能仍有 locked_stock 或 sold_stock（存在未完成订单），删除会破坏库存不变量。商品软删除后不会再有新订单锁定库存，已有订单正常完成后 inventory 记录自然归零。后续查询 inventory 时通过 JOIN product 表过滤已删除商品即可。

## Risks / Trade-offs

**[数据迁移风险]** 现有商品的 `product.stock` 需要正确迁移到 `inventory` 表 → 迁移脚本使用 `INSERT INTO inventory (product_id, total_stock, available_stock) SELECT id, stock, stock FROM product WHERE deleted = 0`，迁移前备份。

**[product.stock 一致性风险]** 冗余字段可能暂时不一致 → 库存服务在事务内同步更新 `product.stock`，确保同一事务内数据一致。

**[并发超卖风险]** 高并发下乐观锁冲突率上升 → 当前阶段并发可控，后续可通过 Redis 预扣减（阶段五 MQ 场景）或分布式锁增强。

**[回滚复杂度]** 引入 inventory 表后，订单回滚需同时处理库存 → 所有库存操作在订单事务内完成，利用 Spring `@Transactional` 保证原子性。

## Migration Plan

1. 执行 V6 迁移脚本：创建 `inventory` 和 `inventory_log` 表
2. 执行数据迁移：从 `product.stock` 初始化 `inventory` 数据
3. 部署新代码：新增 inventory 模块，修改 OrderServiceImpl
4. 验证：下单 → 锁库存 → 取消 → 释放 → 支付 → 确认
5. 回滚策略：保留 `product.stock` 字段和 `decreaseStock`/`increaseStock` SQL，代码回退后可恢复原有逻辑

## Transaction Flow

### createOrder 事务流程

```
@Transactional createOrder:
  1. 查询购物车项
  2. 计算总金额 + 应用会员折扣 + 应用优惠券
  3. 插入 Order
  4. FOR EACH cartItem:
     a. 插入 OrderItem
     b. inventoryService.lockStock(productId, quantity, orderId)
        → 任何一项 lockStock 失败，整个事务回滚（Order、OrderItem、所有已执行的 lockStock 全部撤销）
  5. 删除购物车项
```

关键点：多个商品的 lockStock 在同一事务内执行。如果第 N 个商品库存不足，前 N-1 个商品的 lockStock 也会随事务回滚自动撤销。无需手动逐个释放。

### cancelOrder 事务流程

```
@Transactional cancelOrder:
  1. 状态机校验（PENDING_PAYMENT → CANCELLED）
  2. 更新订单状态
  3. 返还优惠券（如有）
  4. FOR EACH orderItem:
     inventoryService.releaseLockedStock(productId, quantity, orderId)
```

### payOrder 事务流程

```
@Transactional payOrder:
  1. 状态机校验（PENDING_PAYMENT → PAID）
  2. 更新订单状态、支付方式、支付时间
  3. FOR EACH orderItem:
     inventoryService.confirmSoldStock(productId, quantity, orderId)
```
