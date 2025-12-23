# Change: 清理和整理 API 接口

## Why
当前系统存在以下 API 接口问题：
1. **接口路径不一致**：test-api.http 文件中的接口路径与实际代码不符
2. **功能重复**：ProductController 中有增删改接口，但这些功能应该只在后台管理接口中存在
3. **缺少文档**：新增的后台管理模块和会员/签到模块未在 test-api.http 中记录
4. **接口混乱**：用户端和管理端接口界限不清晰

## What Changes
- 移除 ProductController 中的增删改接口（POST /api/product, PUT /api/product/{id}, DELETE /api/product/{id}），这些功能应仅在后台管理
- 统一 API 命名规范
- 更新 test-api.http 文件，补充所有接口的完整文档
- 添加开发工具接口用于测试

## Impact
- Affected code:
  - `ProductController.java`：移除增删改方法
  - `test-api.http`：完整重写，包含所有接口的测试用例
- Affected specs:
  - 新增规范：`api-interface-cleanup`（API 接口规范）
