# category-management-cleanup Specification

## Purpose
TBD - created by archiving change cleanup-category-controller. Update Purpose after archive.
## Requirements
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

