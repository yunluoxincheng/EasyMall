# nextjs-frontend-platform Specification

## Purpose
定义 Next.js App Router 前端平台基础架构，包括路由分区、共享 API 客户端、设计系统令牌与基础组件、前端迁移清理等。

## Requirements
### Requirement: Next.js 前端替换
系统 SHALL 在现有前端项目路径下使用 Next.js App Router 应用替换 Vue/Vite 前端。

#### Scenario: 启动前端开发服务
- **WHEN** 开发者在前端项目中运行开发命令
- **THEN** 系统 SHALL 启动 Next.js 开发服务，并提供商城端和管理端路由

#### Scenario: 构建生产前端
- **WHEN** 开发者运行前端生产构建命令
- **THEN** 系统 SHALL 完成类型检查和 Next.js 构建，且不依赖 Vue、Vite 或 Naive UI 运行时依赖

### Requirement: 路由分区架构
系统 SHALL 将 Next.js 应用组织为商城端和管理端两个路由区域，并共享基础设施但使用不同布局。

#### Scenario: 商城路由使用商城布局
- **WHEN** 用户访问首页、商品浏览、购物车、订单或个人中心等商城端路由
- **THEN** 系统 SHALL 渲染适合顾客浏览的商城导航、内容区域和 Footer

#### Scenario: 管理路由使用管理布局
- **WHEN** 管理员访问管理后台路由
- **THEN** 系统 SHALL 渲染包含侧边栏、顶栏和管理内容区的管理后台布局

### Requirement: 路由兼容性
系统 SHALL 在 Next.js 替换后保留现有主要用户端和管理端路径，除非明确提供重定向。

#### Scenario: 保留主要商城路径
- **WHEN** 用户访问 `/login`、`/register`、`/products`、`/products/:id`、`/cart`、`/checkout`、`/payment/:paymentNo`、`/orders`、`/orders/:id`、`/coupons`、`/user`、`/user/password`、`/user/favorites`、`/user/comments`、`/user/coupons`、`/user/points`、`/user/points/products`、`/user/member` 或 `/user/signin`
- **THEN** 系统 SHALL 渲染对应 Next.js 页面或重定向到等价页面

#### Scenario: 保留主要管理路径
- **WHEN** 管理员访问 `/admin`、`/admin/product`、`/admin/category`、`/admin/order`、`/admin/user`、`/admin/coupon`、`/admin/comment`、`/admin/member-level` 或 `/admin/points-product`
- **THEN** 系统 SHALL 渲染对应 Next.js 管理页面或重定向到等价管理页面

### Requirement: 共享 API 客户端
系统 SHALL 提供类型化 API 客户端，用于与 Spring Boot 后端通信，并一致处理鉴权、错误和响应包装。

#### Scenario: 成功 API 响应
- **WHEN** 前端调用返回成功 `Result<T>` 的后端接口
- **THEN** API 客户端 SHALL 向调用功能返回类型化数据，页面组件不需要自行解析响应包装

#### Scenario: 会话过期响应
- **WHEN** 后端对受保护接口返回未授权响应
- **THEN** API 客户端 SHALL 清理无效会话状态并引导用户进入统一登录流程

### Requirement: 设计系统令牌与基础组件
系统 SHALL 定义可复用的设计令牌和 UI 基础组件，覆盖字体、颜色、间距、卡片、按钮、表单、表格、弹窗、导航和状态标识。

#### Scenario: 商城和后台共享基础组件
- **WHEN** 商城和后台页面渲染按钮、表单、卡片、弹窗或状态标识
- **THEN** 它们 SHALL 使用共享基础组件和设计令牌，同时允许不同页面区域使用不同信息密度和布局

#### Scenario: 商城响应式布局
- **WHEN** 顾客在手机、平板或桌面设备查看商城页面
- **THEN** 页面 SHALL 自适应布局，不出现横向溢出，并保留可读的商品发现控件

### Requirement: 前端迁移清理
系统 SHALL 在 Next.js 替换完成后移除过时的 Vue/Vite/Naive UI 代码和配置。

#### Scenario: 不保留 Vue 入口
- **WHEN** 前端替换完成
- **THEN** 前端项目 SHALL 不再依赖 Vue 单文件组件、Vite 入口或 Naive UI 专用布局代码
