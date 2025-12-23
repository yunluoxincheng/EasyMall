# api-interface-cleanup Specification

## Purpose
TBD - created by archiving change cleanup-api-endpoints. Update Purpose after archive.
## Requirements
### Requirement: API 接口命名规范
系统 SHALL 遵循 RESTful 设计原则，保持 API 接口命名的一致性。

#### Scenario: 查询接口命名
- **WHEN** 开发者定义分页查询接口
- **THEN** 应使用 `GET /api/resources` 或 `GET /api/resources/page`
- **AND** 不应使用 `GET /api/resources/list`

#### Scenario: 状态修改接口命名
- **WHEN** 开发者定义状态修改接口
- **THEN** 应使用 `PUT /api/resources/{id}/status`
- **AND** 不应使用 `PUT /api/resources/off-shelf/{id}`

### Requirement: 用户端与管理端接口分离
系统 SHALL 将用户端接口与管理端接口明确分离。

#### Scenario: 用户端接口路径
- **WHEN** 定义面向普通用户的接口
- **THEN** 路径应为 `/api/{资源}`
- **AND** 不应包含 `/admin` 前缀

#### Scenario: 管理端接口路径
- **WHEN** 定义面向管理员的接口
- **THEN** 路径应为 `/api/admin/{资源}`
- **AND** 必须包含 `/admin` 前缀

### Requirement: 移除用户端商品管理接口
系统 SHALL 移除 ProductController 中的商品增删改接口，这些功能应仅在后台管理模块中存在。

#### Scenario: 移除商品添加接口
- **WHEN** 检查 ProductController
- **THEN** 不应存在 `POST /api/product` 接口
- **AND** 商品添加应使用 `POST /api/admin/products`

#### Scenario: 移除商品更新接口
- **WHEN** 检查 ProductController
- **THEN** 不应存在 `PUT /api/product/{id}` 接口
- **AND** 商品更新应使用 `PUT /api/admin/products/{id}`

#### Scenario: 移除商品删除接口
- **WHEN** 检查 ProductController
- **THEN** 不应存在 `DELETE /api/product/{id}` 接口
- **AND** 商品删除应使用 `DELETE /api/admin/products/{id}`

### Requirement: 移除用户端分类管理接口
系统 SHALL 移除 CategoryController 中的分类增删改接口，这些功能应仅在后台管理模块中存在。

#### Scenario: 移除分类添加接口
- **WHEN** 检查 CategoryController
- **THEN** 不应存在 `POST /api/category` 接口
- **AND** 分类添加应使用 `POST /api/admin/categories`

#### Scenario: 移除分类更新接口
- **WHEN** 检查 CategoryController
- **THEN** 不应存在 `PUT /api/category/{id}` 接口
- **AND** 分类更新应使用 `PUT /api/admin/categories/{id}`

#### Scenario: 移除分类删除接口
- **WHEN** 检查 CategoryController
- **THEN** 不应存在 `DELETE /api/category/{id}` 接口
- **AND** 分类删除应使用 `DELETE /api/admin/categories/{id}`

### Requirement: 分类管理接口安全性
系统 SHALL 确保后台分类管理接口仅管理员可访问。

#### Scenario: 分类管理接口权限控制
- **WHEN** 用户访问 `/api/admin/categories/**` 路径下的任意接口
- **THEN** 必须具有 `ROLE_ADMIN` 权限
- **AND** 非管理员用户应返回 403 Forbidden

### Requirement: API 测试文档完整性
系统 SHALL 提供完整的 API 测试文档 test-api.http，包含所有接口的测试用例。

#### Scenario: 文档包含所有模块
- **WHEN** 查看 test-api.http 文件
- **THEN** 应包含用户模块、商品模块、购物车模块、订单模块、评论模块、收藏模块、会员模块、签到模块、积分兑换模块
- **AND** 应包含完整的后台管理模块

#### Scenario: 文档包含正确路径
- **WHEN** 查看 test-api.http 文件
- **THEN** 所有接口路径应与实际代码一致
- **AND** 应提供正确的请求示例和参数说明

