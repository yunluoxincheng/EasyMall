## 1. Database

- [x] 1.1 创建 V6 迁移脚本，新增 `inventory` 表（id, product_id, total_stock, available_stock, locked_stock, sold_stock, version, create_time, update_time），product_id 设 UNIQUE KEY
- [x] 1.2 在 V6 中新增 `inventory_log` 表（id, product_id, order_id, change_type, change_quantity, before_available, after_available, remark, create_time），建立 product_id 和 order_id 索引
- [x] 1.3 在 V6 中添加数据迁移 SQL：从 `product.stock` 初始化 `inventory` 记录（`total_stock = available_stock = product.stock`）

## 2. Inventory Module

- [x] 2.1 创建 `modules/inventory/` 包结构
- [x] 2.2 创建 `Inventory` 实体类，映射 `inventory` 表
- [x] 2.3 创建 `InventoryLog` 实体类，映射 `inventory_log` 表
- [x] 2.4 创建 `InventoryMapper` 接口及 XML，包含按 productId 查询、lockStock、releaseLockedStock、confirmSoldStock 的 SQL
- [x] 2.5 创建 `InventoryLogMapper` 接口及 XML
- [x] 2.6 创建 `IInventoryService` 接口，定义 lockStock、releaseLockedStock、confirmSoldStock、adjustStock、setStock、getByProductId 方法
- [x] 2.7 实现 `InventoryServiceImpl`：lockStock 方法（原子更新 available_stock/locked_stock，检查 version 和 available_stock，记录日志，同步 product.stock）
- [x] 2.8 实现 releaseLockedStock 方法（原子更新 locked_stock/available_stock，检查 version 和 locked_stock，记录日志，同步 product.stock）
- [x] 2.9 实现 confirmSoldStock 方法（原子更新 locked_stock/sold_stock，检查 version 和 locked_stock，记录日志）
- [x] 2.10 实现 adjustStock 方法（管理员相对值调整库存，修改 total_stock 和 available_stock，记录日志，同步 product.stock）
- [x] 2.11 实现 setStock 方法（管理员绝对值设置库存，内部计算差值后调用 adjustStock）
- [x] 2.12 实现 getByProductId 方法
- [x] 2.13 更新 MyBatis `@MapperScan` 添加 `org.ruikun.modules.inventory.mapper`，更新 `type-aliases-package` 添加 `org.ruikun.modules.inventory.entity`

## 3. Order Integration

- [x] 3.1 修改 `OrderServiceImpl.createOrder()`：替换 `productMapper.decreaseStock()` 为 `inventoryService.lockStock()`
- [x] 3.2 修改 `OrderServiceImpl.cancelOrderInternal()`：替换 `productMapper.increaseStock()` 为 `inventoryService.releaseLockedStock()`
- [x] 3.3 修改 `OrderServiceImpl.payOrder()`：支付成功后调用 `inventoryService.confirmSoldStock()`

## 4. Product Integration

- [x] 4.1 修改 `ProductServiceImpl.saveProduct()`：创建商品后自动调用 `inventoryService` 初始化库存记录
- [x] 4.2 修改管理员库存管理接口：调用 `inventoryService.setStock()` 替代直接设置 `product.stock`
- [x] 4.3 确保 `ProductServiceImpl.updateProduct()` 不修改 stock 字段 —— 在 `BeanUtils.copyProperties` 排除 stock，或在 ProductDTO 中移除 stock 字段
- [x] 4.4 改造 `ProductServiceImpl.checkStock()`：改为查询 `inventory.available_stock` 替代查询 `product.stock`
- [x] 4.5 确认 `ProductServiceImpl.updateSales()` 的使用场景，改造或移除该方法（当前 createOrder 未调用，但其内部直接操作 product.stock 与 inventory 模块冲突）

## 5. Concurrency Safety

- [x] 5.1 确保 lockStock SQL 使用 `WHERE product_id = ? AND available_stock >= ? AND version = ?` 条件
- [x] 5.2 确保 releaseLockedStock SQL 使用 `WHERE product_id = ? AND locked_stock >= ? AND version = ?` 条件
- [x] 5.3 确保 confirmSoldStock SQL 使用 `WHERE product_id = ? AND locked_stock >= ? AND version = ?` 条件
- [x] 5.4 所有库存操作检查影响行数，为 0 时抛出 BusinessException

## 6. Tests

- [x] 6.1 编写 lockStock 成功测试
- [x] 6.2 编写 lockStock 库存不足失败测试
- [x] 6.3 编写 releaseLockedStock 成功测试
- [x] 6.4 编写 releaseLockedStock 重复释放失败测试
- [x] 6.5 编写 confirmSoldStock 成功测试
- [x] 6.6 编写 adjustStock 增减库存测试
- [x] 6.7 编写 setStock 绝对值设置库存测试
- [x] 6.8 编写库存变动流水记录验证测试

## 7. Cleanup

- [x] 7.1 `ProductMapper.decreaseStock()` 和 `increaseStock()` 保留不删除（用于回滚），但不再被业务代码调用
- [x] 7.2 确认 `ProductServiceImpl.updateSales()` 的调用方，添加 `@Deprecated` 注解或移除

## 8. Verification

- [x] 8.1 启动应用，确认 inventory 和 inventory_log 表创建成功
- [x] 8.2 验证现有商品库存数据迁移正确
- [x] 8.3 下单 → 验证 available_stock 减少、locked_stock 增加、product.stock 同步
- [x] 8.4 取消订单 → 验证 locked_stock 减少、available_stock 增加、product.stock 同步
- [x] 8.5 支付成功 → 验证 locked_stock 减少、sold_stock 增加
- [x] 8.6 库存不足时下单失败
