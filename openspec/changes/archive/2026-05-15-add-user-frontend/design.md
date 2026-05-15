## Context

EasyMall 管理端前端已完成，基于 Vue3 + Naive UI + TypeScript + Pinia + Vue Router 构建，位于 `easymall-frontend/`。后端用户端 API 已全部就绪（商品、购物车、订单、支付、优惠券、收藏、评论、积分、会员、签到等）。

当前前端项目结构：
- 所有路由均指向管理端布局（`AdminLayout`），无用户端路由
- API 模块均为 `/api/admin/*` 前缀
- 认证 Store 仅处理管理员登录

用户端前端需要与管理端共存于同一 Vue3 项目，共享 Naive UI 组件库和构建工具链，但拥有独立的布局、路由组和 API 模块。

## Goals / Non-Goals

**Goals:**

- 在同一项目中添加用户端布局与路由，与管理端互不干扰
- 覆盖完整购物链路：浏览→购物车→下单→支付→订单管理
- 覆盖用户中心：个人信息、收藏、评论、优惠券、积分、会员、签到
- 复用现有 Naive UI + Pinia + Vue Router 技术栈，不引入新依赖
- 用户端 API 模块独立于管理端 API 模块

**Non-Goals:**

- 不做移动端适配，桌面演示优先（移动端仅保证不崩布局，不做响应式断点适配）
- 不做复杂动画或高级 UI 效果
- 不做 SSR 或 SEO 优化
- 不修改后端代码
- 不做真实第三方支付接入
- 不做国际化

## Decisions

### 1. 用户端与管理端共存于同一项目

**选择**: 在现有 `easymall-frontend` 中添加用户端路由，而非创建独立项目。

**理由**: 共享构建工具链、依赖和类型定义，减少维护成本。路由通过路径前缀区分。

**替代方案**: 创建独立的 `easymall-user-frontend` 项目 — 增加仓库和部署复杂度，对个人项目不划算。

### 2. 路由组织方式

**选择**: 管理端路由迁移到 `/admin` 前缀下，用户端路由使用 `/` 前缀。

**路由结构**:
```
/                       → 用户端首页（重定向到 /products）
/login                  → 用户端登录
/register               → 用户端注册
/products               → 商品列表
/products/:id           → 商品详情
/cart                   → 购物车
/checkout               → 订单确认
/payment/:paymentNo     → 支付页（使用 paymentNo，由创建订单接口返回）
/orders                 → 订单列表
/orders/:id             → 订单详情
/user                   → 个人信息
/user/password          → 修改密码
/user/favorites         → 我的收藏
/user/comments          → 我的评论
/coupons                → 优惠券中心（浏览可领取优惠券、领取优惠券）
/user/coupons           → 我的优惠券
/user/points            → 积分记录
/user/points/products   → 积分商品浏览与兑换
/user/member            → 会员中心
/user/signin            → 签到
/admin/login            → 管理端登录
/admin/*                → 管理端页面（保持不变）
```

**理由**: 用户端是主要入口，使用根路径；管理端是辅助入口，使用 `/admin` 前缀。

### 3. API 模块组织

**选择**: 在 `src/api/` 目录下新增用户端 API 文件，与管理端 API 文件并列但使用不同的后端路径前缀。

**组织方式**: 管理端 API 使用 `/api/admin/*`，用户端 API 使用 `/api/user`、`/api/product`、`/api/cart`、`/api/order` 等用户端路径。共享 `request` 工具实例。

### 4. 认证 Store 设计

**选择**: 新增 `userAuth.ts` Store，与管理端 `auth.ts` 分离。两者使用相同的 token 存储机制但 key 不同（`admin_token` vs `user_token`），互不干扰。

### 5. 请求拦截器 token 路由

**选择**: 改造现有 `request.ts` 请求拦截器，根据当前路由路径自动选择对应的 token key。

**机制**:
- 请求拦截器：检查 `window.location.pathname`，如果以 `/admin` 开头则读取 `admin_token`，否则读取 `user_token`
- 响应拦截器 401 处理：根据当前路径决定跳转目标 — `/admin/*` 跳转 `/admin/login`，其余跳转 `/login`
- 管理端原有 `localStorage.getItem('token')` 迁移为 `localStorage.getItem('admin_token')`

**理由**: 共用同一 axios 实例，仅通过拦截器区分 token 来源，避免维护两套请求工具。

**替代方案**: 创建独立的 `userRequest.ts` — 增加维护成本，大部分逻辑重复。

### 6. 布局组件

**选择**: 新建 `UserLayout.vue`，包含顶部导航（Logo、商品分类、搜索框、购物车图标、用户菜单）和底部 Footer。

### 7. 页面组件目录组织

**选择**: 按功能域在 `src/views/` 下新建子目录：

```
views/
├── login/          (已存在，管理端登录)
├── product/        (已存在，管理端商品管理)
├── ...             (其他管理端页面)
├── user-home/      (用户端首页/商品列表)
├── user-product/   (用户端商品详情)
├── user-cart/      (用户端购物车)
├── user-checkout/  (用户端下单)
├── user-payment/   (用户端支付)
├── user-orders/    (用户端订单)
├── user-profile/   (用户端个人信息)
├── user-favorites/ (用户端收藏)
├── user-comments/  (用户端评论)
├── user-coupons/   (用户端我的优惠券)
├── coupon-center/  (用户端优惠券中心/领取)
├── user-points/    (用户端积分记录)
├── user-member/    (用户端会员)
├── user-signin/    (用户端签到)
├── user-register/  (用户端注册)
├── user-login/     (用户端登录)
```

**替代方案**: 将所有用户端页面放在 `views/user/` 子目录下 — 目录嵌套太深，与管理端页面平级更清晰。

## Risks / Trade-offs

- **路由迁移风险**: 管理端路由从 `/` 迁移到 `/admin` 前缀，需要同步更新管理端导航和跳转逻辑 → 迁移后立即验证管理端所有页面正常访问
- **项目体积增长**: 用户端新增约 15+ 页面组件 → 可接受的规模，Naive UI 按需加载可控制打包体积
- **Store 命名冲突**: 用户端和管理端可能有同名的 Store → 使用前缀区分（`useUserAuthStore` vs `useAuthStore`）
