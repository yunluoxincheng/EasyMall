## Why

当前订单创建流程直接扣减 `product.stock`（`productMapper.decreaseStock()`），取消订单时直接回加库存（`productMapper.increaseStock()`）。这种模式无法区分可售库存、锁定库存和已售库存，导致未支付订单消耗真实可售库存，且库存恢复依赖手动取消。EasyMall 需要引入独立的库存锁定模型，使交易链路接近真实电商系统。

## What Changes

- 新增 `inventory` 表，记录每个商品的 `available_stock`、`locked_stock`、`sold_stock`，并支持乐观锁（`version` 字段）
- 新增 `inventory_log` 表，记录所有库存变动流水
- 新增 `modules/inventory` 模块（entity、mapper、service）
- 订单创建时调用 `InventoryService.lockStock()` 锁定库存，替代直接扣减 `product.stock`
- 订单取消时调用 `InventoryService.releaseLockedStock()` 释放锁定库存
- 支付成功时调用 `InventoryService.confirmSoldStock()` 将锁定库存转为已售库存
- 管理员库存管理使用 `InventoryService.setStock()` 绝对值设置库存（保持现有 API 语义不变）
- 库存扣减 SQL 使用 `WHERE available_stock >= quantity` 条件防止超卖
- **BREAKING**: 下单不再扣减 `product.stock`，`product.stock` 将降级为展示字段

## Capabilities

### New Capabilities
- `inventory-locking`: 库存锁定模型，包含 inventory 表、inventory_log 表、InventoryService（lockStock/releaseLockedStock/confirmSoldStock），以及并发安全的库存扣减逻辑

### Modified Capabilities
- `order-state-machine`: 订单创建、取消、支付成功流程需对接库存锁定服务，替换原有直接操作 product.stock 的逻辑
- `admin-product-management`: 管理员库存管理需同步操作 inventory 表，新增商品时需初始化 inventory 记录

## Impact

- **数据库**: 新增 `inventory` 和 `inventory_log` 两张表，需新增 SQL 迁移脚本；需从现有 `product.stock` 初始化 `inventory` 数据
- **后端代码**: 新增 `modules/inventory/` 模块；修改 `OrderServiceImpl`（createOrder、cancelOrderInternal、payOrder）；修改 `ProductServiceImpl`（商品创建/库存管理时同步 inventory）
- **API**: 管理员商品库存管理接口可能需要调整，确保 inventory 和 product.stock 同步
- **数据迁移**: 需为现有商品生成 inventory 初始数据
