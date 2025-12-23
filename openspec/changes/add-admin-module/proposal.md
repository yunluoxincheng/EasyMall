# Change: 实现后台管理模块（完整实现）

## Why
当前系统缺少完整的后台管理功能，管理员无法通过统一的界面管理商品、订单、用户、评论、会员等级和积分兑换商品。系统需要提供一套完整的后台管理 API，以便管理员高效地维护商城运营。

## What Changes
- 新增商品管理功能：商品的增删改查、上下架、库存管理
- 新增订单管理功能：订单列表查询、订单详情查看、订单状态更新（发货、完成等）
- 新增用户管理功能：用户列表查询、用户详情查看、用户状态管理（启用/禁用）
- 新增评论审核功能：评论列表查询、评论审核（通过/拒绝、商家回复）
- 新增会员等级配置管理功能：会员等级的增删改查、等级权益配置
- 新增积分兑换商品管理功能：积分兑换商品的增删改查、上下架、库存管理

## Impact
- Affected specs:
  - 新增规范：`admin-product-management`（商品管理）
  - 新增规范：`admin-order-management`（订单管理）
  - 新增规范：`admin-user-management`（用户管理）
  - 新增规范：`admin-comment-moderation`（评论审核）
  - 新增规范：`admin-member-level-management`（会员等级管理）
  - 新增规范：`admin-points-product-management`（积分兑换商品管理）

- Affected code:
  - 新增包：`org.ruikun.controller.admin`（后台管理控制器）
  - 新增包：`org.ruikun.service.admin`（后台管理服务层，可选，也可复用现有服务）
  - 新增 DTO：`org.ruikun.dto.admin.*`（后台管理专用请求对象）
  - 新增 VO：`org.ruikun.vo.admin.*`（后台管理专用响应对象）
  - 修改：`SecurityConfig` 确保 `/api/admin/**` 路径需要管理员权限
