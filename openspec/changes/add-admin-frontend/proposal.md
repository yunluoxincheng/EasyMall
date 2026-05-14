## Why

EasyMall 后端已完成全部核心交易链路（订单状态机、库存锁定、支付幂等、MQ 延迟关单、优惠券生命周期、积分流水幂等），但前端仅有空目录占位。没有可视化管理界面，无法演示后端能力，项目展示价值严重不足。管理端前端是连接后端能力与项目展示的关键桥梁，也是阶段 7（前端工程与全栈展示能力建设）的第一步。

## What Changes

- 在 `easymall-frontend/` 下初始化 Vue3 + Vite + TypeScript 管理端前端项目
- 集成 Naive UI 组件库，构建后台管理布局（侧边栏、顶栏、面包屑）
- 实现管理员登录页、Token 认证、Axios 请求/响应拦截器、路由守卫
- 实现商品管理页面（列表、新增/编辑、上下架、库存管理）
- 实现分类管理页面（列表、新增/编辑、状态管理）
- 实现订单管理页面（列表、详情、状态修改、取消订单）
- 实现用户管理页面（列表、详情、状态管理、角色管理、积分调整）
- 实现优惠券管理页面（模板列表、新增/编辑、上下架、使用日志、统计）
- 实现评论审核页面（列表、审核通过/拒绝、商家回复、删除）
- 实现会员等级管理页面（等级列表、新增/编辑/删除、状态管理）
- 实现积分兑换商品管理页面（列表、新增/编辑、上下架、库存管理）
- 对接后端所有 `/api/admin/**` 接口
- 配置 Vite 代理解决开发环境跨域
- 编写前端页面时**必须调用 ui-ux-pro-max skill**，确保页面设计质量

## Capabilities

### New Capabilities

- `admin-auth`: 管理员登录认证、Token 管理、路由守卫
- `admin-layout`: 后台管理布局框架（侧边栏、顶栏、面包屑）
- `admin-product-management`: 商品管理前端页面（CRUD、上下架、库存）
- `admin-category-management`: 分类管理前端页面（CRUD、状态管理）
- `admin-order-management`: 订单管理前端页面（列表、详情、状态流转）
- `admin-user-management`: 用户管理前端页面（列表、详情、状态、角色、积分）
- `admin-coupon-management`: 优惠券管理前端页面（模板 CRUD、上下架、使用日志、统计）
- `admin-comment-moderation`: 评论审核前端页面（列表、审核、回复、删除）
- `admin-member-level-management`: 会员等级管理前端页面（CRUD、状态管理）
- `admin-points-product-management`: 积分兑换商品管理前端页面（CRUD、上下架、库存）

### Modified Capabilities

（无已有 spec 需要修改，本提案全部为新增前端能力）

## Impact

- **新增代码**: `easymall-frontend/` 整个 Vue3 前端项目（预计 3000-5000 行）
- **后端 API 依赖**: 所有 `/api/admin/**` 接口必须已就绪（已确认就绪）
- **开发依赖**: Node.js 18+、npm/pnpm
- **构建产物**: Vite 开发服务器 + Nginx 生产部署
- **跨域**: Vite 代理 `/api` 到后端 8080 端口
