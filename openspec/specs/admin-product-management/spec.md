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

#### Scenario: 成功创建商品
- **WHEN** 管理员请求 POST /api/admin/products，提供商品名称、副标题、描述、原价、现价、库存、分类 ID、图片等必填信息
- **THEN** 创建商品成功，返回新创建的商品 ID
- **AND** 商品的上架状态默认为下架（status=0）

#### Scenario: 参数校验失败
- **WHEN** 管理员提供必填参数缺失或格式错误
- **THEN** 返回参数校验错误信息

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
- **WHEN** 管理员请求 PUT /api/admin/products/{id}/stock，提供新的库存数量
- **THEN** 商品的库存数量更新成功

### Requirement: 删除商品
系统 SHALL 允许管理员删除商品（逻辑删除）。

#### Scenario: 成功删除商品
- **WHEN** 管理员请求 DELETE /api/admin/products/{id}
- **THEN** 商品被逻辑删除（deleted 字段设置为 1）
- **AND** 前端用户无法浏览该商品

