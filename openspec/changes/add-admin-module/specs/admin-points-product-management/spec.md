## ADDED Requirements

### Requirement: 积分兑换商品列表分页查询
系统 SHALL 允许管理员通过分页查询获取积分兑换商品列表，并支持按商品名称、上架状态进行筛选。

#### Scenario: 成功查询积分兑换商品列表
- **WHEN** 管理员请求 GET /api/admin/points-products，提供页码、页大小等分页参数
- **THEN** 返回积分兑换商品分页结果，包含商品 ID、名称、描述、图片、所需积分、库存、已兑换数量、上架状态、排序、创建时间等信息
- **AND** 支持按商品名称模糊搜索
- **AND** 支持按上架状态筛选（0=下架，1=上架）
- **AND** 列表按排序字段升序排列

### Requirement: 积分兑换商品详情查询
系统 SHALL 允许管理员查询指定积分兑换商品的完整详细信息。

#### Scenario: 成功查询积分兑换商品详情
- **WHEN** 管理员请求 GET /api/admin/points-products/{id}
- **THEN** 返回积分兑换商品的完整信息

### Requirement: 新增积分兑换商品
系统 SHALL 允许管理员创建新的积分兑换商品。

#### Scenario: 成功创建积分兑换商品
- **WHEN** 管理员请求 POST /api/admin/points-products，提供商品名称、描述、图片、所需积分、库存等必填信息
- **THEN** 创建积分兑换商品成功，返回新创建的商品 ID
- **AND** 商品的上架状态默认为下架（status=0）
- **AND** 商品的已兑换数量默认为 0

#### Scenario: 参数校验失败
- **WHEN** 管理员提供必填参数缺失或格式错误（如所需积分为负数）
- **THEN** 返回参数校验错误信息

### Requirement: 修改积分兑换商品
系统 SHALL 允许管理员修改已有积分兑换商品的信息。

#### Scenario: 成功修改积分兑换商品
- **WHEN** 管理员请求 PUT /api/admin/points-products/{id}，提供需要更新的字段
- **THEN** 更新积分兑换商品信息成功
- **AND** 仅更新提供的字段，未提供的字段保持不变

### Requirement: 积分兑换商品上下架
系统 SHALL 允许管理员修改积分兑换商品的上架状态。

#### Scenario: 成功上架积分兑换商品
- **WHEN** 管理员请求 PUT /api/admin/points-products/{id}/status，设置 status=1
- **THEN** 积分兑换商品的上架状态更新为上架
- **AND** 前端用户可以浏览和兑换该商品

#### Scenario: 成功下架积分兑换商品
- **WHEN** 管理员请求 PUT /api/admin/points-products/{id}/status，设置 status=0
- **THEN** 积分兑换商品的上架状态更新为下架
- **AND** 前端用户无法浏览和兑换该商品

### Requirement: 积分兑换商品库存管理
系统 SHALL 允许管理员修改积分兑换商品的库存数量。

#### Scenario: 成功增加库存
- **WHEN** 管理员请求 PUT /api/admin/points-products/{id}/stock，提供新的库存数量
- **THEN** 积分兑换商品的库存数量更新成功

#### Scenario: 库存不能为负数
- **WHEN** 管理员提供的库存数量为负数
- **THEN** 返回参数校验错误信息

### Requirement: 删除积分兑换商品
系统 SHALL 允许管理员删除积分兑换商品。

#### Scenario: 成功删除积分兑换商品
- **WHEN** 管理员请求 DELETE /api/admin/points-products/{id}
- **THEN** 积分兑换商品被逻辑删除（deleted 字段设置为 1）
- **AND** 前端用户无法浏览该商品

#### Scenario: 删除有兑换记录的商品
- **WHEN** 管理员删除已有兑换记录的积分兑换商品
- **THEN** 系统允许删除，但给出警告提示（或改为阻止删除，本版本采用允许删除）
