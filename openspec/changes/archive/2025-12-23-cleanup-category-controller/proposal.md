# 提案：分类管理接口移至后台管理模块

## 问题陈述

当前 `CategoryController` 中同时存在用户端查询接口和管理端增删改接口，这与之前清理 `ProductController` 时发现的问题相同：

- `POST /api/category` - 添加分类
- `PUT /api/category/{id}` - 更新分类
- `DELETE /api/category/{id}` - 删除分类

这些是管理功能，不应该暴露给普通用户，应该移至 `/api/admin/categories` 路径下。

## 目标

1. 从 `CategoryController` 移除增删改接口
2. 创建 `AdminCategoryController` 处理分类管理功能
3. 更新 test-api.http 文件
4. 保持与商品管理接口的一致性

## 影响范围

- `CategoryController.java` - 移除 POST/PUT/DELETE 接口
- 新增 `AdminCategoryController.java` - 管理端分类接口
- 新增 DTO/VO（如需要）
- `test-api.http` - 更新分类管理接口路径
- `api-interface-cleanup` 规范 - 添加分类相关需求

## 依赖关系

无外部依赖，可以独立实施。

## 验收标准

1. `CategoryController` 仅保留查询接口（GET）
2. `AdminCategoryController` 实现完整的 CRUD 功能
3. test-api.http 包含正确的分类管理接口
4. 通过 `openspec validate --strict` 验证
