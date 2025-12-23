## 1. 创建 AdminCategoryController
- [x] 1.1 创建 AdminCategoryController 类，路径 `/api/admin/categories`
- [x] 1.2 实现分页查询接口 `GET /api/admin/categories`
- [x] 1.3 实现详情查询接口 `GET /api/admin/categories/{id}`
- [x] 1.4 实现新增接口 `POST /api/admin/categories`
- [x] 1.5 实现修改接口 `PUT /api/admin/categories/{id}`
- [x] 1.6 实现状态修改接口 `PUT /api/admin/categories/{id}/status`
- [x] 1.7 实现删除接口 `DELETE /api/admin/categories/{id}`
- [x] 1.8 添加 `@PreAuthorize("hasRole('ADMIN')")` 安全注解

## 2. 清理 CategoryController
- [x] 2.1 移除 `POST /api/category` 接口
- [x] 2.2 移除 `PUT /api/category/{id}` 接口
- [x] 2.3 移除 `DELETE /api/category/{id}` 接口

## 3. 创建 DTO/VO（如需要）
- [x] 3.1 创建 CategoryQueryDTO（分页查询条件）
- [x] 3.2 创建 CategorySaveDTO（新增/修改）
- [x] 3.3 创建 AdminCategoryVO（管理端详情）
- [x] 3.4 创建 AdminCategoryPageVO（管理端分页）

## 4. 更新 test-api.http
- [x] 4.1 添加后台分类管理接口
- [x] 4.2 更新接口路径说明

## 5. 更新规范
- [x] 5.1 在 api-interface-cleanup 规范中添加分类管理相关需求

## 6. 验证
- [x] 6.1 运行 `openspec validate --strict`
- [x] 6.2 编译项目确保无错误
