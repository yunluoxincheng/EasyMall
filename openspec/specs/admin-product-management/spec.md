# admin-product-management Specification

## Purpose
TBD - created by archiving change add-admin-module. Update Purpose after archive.
## Requirements
### Requirement: 商品列表分页查询
系统 SHALL 允许管理员通过分页查询获取商品列表，并支持按商品名称、分类 ID、上架状态进行筛选。

#### Scenario: 成功查询商品列表
- **WHEN** 管理员请求 GET /api/admin/products，提供页码、页大小等分页参数
- **THEN** 返回商品分页结果，包含商品 ID、名称、副标题、价格、库存、销量、分类、上架状态、创建时间等信息
- **AND** 支持按商品名称模糊搜索
- **AND** 支持按分类 ID 筛选
- **AND** 支持按上架状态筛选（0=下架，1=上架）

### Requirement: 商品详情查询
系统 SHALL 允许管理员查询指定商品的完整详细信息。

#### Scenario: 成功查询商品详情
- **WHEN** 管理员请求 GET /api/admin/products/{id}
- **THEN** 返回商品的完整信息，包括基本信息、图片、价格、库存、分类、品牌等

### Requirement: 新增商品
系统 SHALL 允许管理员创建新商品。

#### Scenario: 成功创建商品并初始化库存
- **WHEN** 管理员请求 POST /api/admin/products，提供商品名称、副标题、描述、原价、现价、库存、分类 ID、图片等必填信息
- **THEN** 创建商品成功，返回新创建的商品 ID
- **AND** 商品的上架状态默认为下架（status=0）
- **AND** 系统在 `inventory` 表自动创建对应的库存记录，`total_stock` 和 `available_stock` 等于设置的库存数量，`locked_stock=0`，`sold_stock=0`

### Requirement: 修改商品信息
系统 SHALL 允许管理员修改已有商品的基本信息。

#### Scenario: 成功修改商品
- **WHEN** 管理员请求 PUT /api/admin/products/{id}，提供需要更新的字段
- **THEN** 更新商品信息成功
- **AND** 仅更新提供的字段，未提供的字段保持不变

### Requirement: 商品上下架
系统 SHALL 允许管理员修改商品的上架状态。

#### Scenario: 成功上架商品
- **WHEN** 管理员请求 PUT /api/admin/products/{id}/status，设置 status=1
- **THEN** 商品的上架状态更新为上架
- **AND** 前端用户可以浏览和购买该商品

#### Scenario: 成功下架商品
- **WHEN** 管理员请求 PUT /api/admin/products/{id}/status，设置 status=0
- **THEN** 商品的上架状态更新为下架
- **AND** 前端用户无法浏览和购买该商品

### Requirement: 商品库存管理
系统 SHALL 允许管理员修改商品的库存数量。

#### Scenario: 成功修改库存
- **WHEN** 管理员请求 PUT /api/admin/products/{id}/stock，提供新的库存数量（绝对值）
- **THEN** 系统调用 `InventoryService.setStock()` 计算差值并调整库存
- **AND** `inventory` 表的 `total_stock` 和 `available_stock` 更新
- **AND** `product.stock` 同步更新为新的可售库存
- **AND** 记录 `inventory_log`（change_type = `ADMIN_ADJUST`）

### Requirement: 删除商品
系统 SHALL 允许管理员删除商品（逻辑删除）。

#### Scenario: 成功删除商品
- **WHEN** 管理员请求 DELETE /api/admin/products/{id}
- **THEN** 商品被逻辑删除（deleted 字段设置为 1）
- **AND** 前端用户无法浏览该商品

### Requirement: 商品列表页面
系统 SHALL 提供商品管理列表页面，展示商品 ID、名称、分类、价格、库存状态、上架状态，支持分页和搜索筛选。

#### Scenario: 商品列表分页展示
- **WHEN** 管理员访问商品管理页面
- **THEN** 系统调用 `/api/admin/products` 接口并以表格形式展示商品列表，包含分页控件

#### Scenario: 商品搜索筛选
- **WHEN** 管理员输入商品名称关键词或选择分类进行筛选
- **THEN** 系统根据筛选条件重新查询并展示结果

### Requirement: 商品新增/编辑
系统 SHALL 提供商品新增和编辑表单，包含商品名称、分类、价格、描述、图片上传、上架状态等字段。

#### Scenario: 新增商品
- **WHEN** 管理员点击"新增商品"按钮并填写表单后提交
- **THEN** 系统调用后端新增接口，成功后刷新列表并显示成功提示

#### Scenario: 编辑商品
- **WHEN** 管理员点击商品列表中的"编辑"按钮，修改字段后提交
- **THEN** 系统调用后端更新接口，成功后刷新列表并显示成功提示

#### Scenario: 表单验证
- **WHEN** 管理员提交商品表单时缺少必填字段
- **THEN** 系统显示表单验证错误提示

