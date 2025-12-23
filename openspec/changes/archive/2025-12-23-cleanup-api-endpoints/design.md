# API 接口清理设计文档

## Context
当前系统的 API 接口存在以下问题：

### 发现的问题

1. **ProductController 中有不应该存在的接口**
   - `POST /api/product` - 添加商品
   - `PUT /api/product/{id}` - 更新商品
   - `DELETE /api/product/{id}` - 删除商品
   - 这些是管理功能，不应该暴露给普通用户

2. **test-api.http 文件中的路径与实际代码不符**
   - test-api.http 中使用 `/api/admin/product/add`，但实际代码是 `/api/admin/products`
   - test-api.http 中使用 `/api/order/list`，但实际代码是 `/api/order/page`

3. **新增模块未记录**
   - 会员模块 (`/api/member/**`)
   - 签到模块 (`/api/signin/**`)
   - 积分兑换模块 (`/api/points/**`)
   - 完整的后台管理模块

## Goals / Non-Goals
- Goals:
  - 清理 API 接口，移除不应该存在的功能
  - 统一 API 命名规范（RESTful 风格）
  - 更新 test-api.http 文件，提供完整的 API 测试文档

- Non-Goals:
  - 不修改现有业务逻辑
  - 不改变接口的请求/响应格式

## API 命名规范

### RESTful 设计原则
- **查询列表**: `GET /api/resources` 或 `GET /api/resources/page`
- **查询单个**: `GET /api/resources/{id}`
- **创建**: `POST /api/resources`
- **修改**: `PUT /api/resources/{id}`
- **删除**: `DELETE /api/resources/{id}`
- **状态修改**: `PUT /api/resources/{id}/status`

### 用户端 vs 管理端
- **用户端**: `/api/{资源}` - 面向普通用户的购物功能
- **管理端**: `/api/admin/{资源}` - 面向管理员的后台管理功能

## 需要移除的接口

| 接口 | 原因 |
|------|------|
| `POST /api/product` | 商品添加应在后台管理 |
| `PUT /api/product/{id}` | 商品更新应在后台管理 |
| `DELETE /api/product/{id}` | 商品删除应在后台管理 |

## API 分类整理

### 公开接口（无需认证）
- 用户登录/注册
- 商品浏览
- 分类查询

### 用户接口（需要认证）
- 购物车管理
- 订单管理
- 评论管理
- 收藏管理
- 会员功能
- 签到功能
- 积分兑换

### 管理员接口（需要 ADMIN 角色）
- 商品管理
- 订单管理
- 用户管理
- 评论审核
- 会员等级管理
- 积分商品管理

### 开发工具接口
- 密码哈希生成（仅开发环境）
