# 分类管理接口清理设计文档

## Context

当前 `CategoryController` 同时承担用户查询和管理功能两个职责，违反了单一职责原则和之前建立的 API 设计规范。

### 发现的问题

1. **CategoryController 中有不应该存在的接口**
   - `POST /api/category` - 添加分类
   - `PUT /api/category/{id}` - 更新分类
   - `DELETE /api/category/{id}` - 删除分类
   - 这些是管理功能，不应该暴露给普通用户

2. **与商品管理不一致**
   - `ProductController` 已经清理完毕，仅保留查询接口
   - 商品管理功能已移至 `AdminProductController`
   - 分类管理应遵循相同的模式

## Goals / Non-Goals

- Goals:
  - 将分类增删改功能移至后台管理模块
  - 保持 API 设计的一致性
  - 更新测试文档

- Non-Goals:
  - 不修改现有的分类业务逻辑
  - 不改变接口的请求/响应格式

## 接口变更

### CategoryController（用户端）- 保留

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/category/tree` | 获取分类树 |
| GET | `/api/category/{id}` | 获取分类详情 |
| GET | `/api/category/level/{level}` | 按级别获取分类 |

### AdminCategoryController（管理端）- 新增

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/categories` | 分页查询分类列表 |
| GET | `/api/admin/categories/{id}` | 查询分类详情 |
| POST | `/api/admin/categories` | 新增分类 |
| PUT | `/api/admin/categories/{id}` | 修改分类 |
| PUT | `/api/admin/categories/{id}/status` | 修改分类状态 |
| DELETE | `/api/admin/categories/{id}` | 删除分类 |

## 复用现有 Service

`ICategoryService` 已实现所有需要的方法：
- `saveCategory(CategoryDTO)` - 新增
- `updateCategory(Long, CategoryDTO)` - 修改
- `deleteCategory(Long)` - 删除
- `getCategoryById(Long)` - 查询
- `getCategoryTree()` - 分类树
- `getLevelCategories(Integer)` - 按级别查询

无需修改 Service 层。

## 安全控制

后台管理接口需要添加 `@PreAuthorize("hasRole('ADMIN')")` 注解，确保只有管理员可以访问。
