## MODIFIED Requirements

### Requirement: 新增商品
系统 SHALL 允许管理员创建新商品。

#### Scenario: 成功创建商品并初始化库存
- **WHEN** 管理员请求 POST /api/admin/products，提供商品名称、副标题、描述、原价、现价、库存、分类 ID、图片等必填信息
- **THEN** 创建商品成功，返回新创建的商品 ID
- **AND** 商品的上架状态默认为下架（status=0）
- **AND** 系统在 `inventory` 表自动创建对应的库存记录，`total_stock` 和 `available_stock` 等于设置的库存数量，`locked_stock=0`，`sold_stock=0`

### Requirement: 商品库存管理
系统 SHALL 允许管理员修改商品的库存数量。

#### Scenario: 成功修改库存
- **WHEN** 管理员请求 PUT /api/admin/products/{id}/stock，提供新的库存数量（绝对值）
- **THEN** 系统调用 `InventoryService.setStock()` 计算差值并调整库存
- **AND** `inventory` 表的 `total_stock` 和 `available_stock` 更新
- **AND** `product.stock` 同步更新为新的可售库存
- **AND** 记录 `inventory_log`（change_type = `ADMIN_ADJUST`）
