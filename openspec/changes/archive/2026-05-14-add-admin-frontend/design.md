## Context

EasyMall 后端已具备完整的 Admin API（`/api/admin/**`），覆盖商品、分类、订单、用户、优惠券、评论、会员等级、积分兑换商品 8 大管理模块。所有接口使用统一的 `Result<T>` 响应封装，支持 JWT 认证和 `@PreAuthorize("hasRole('ADMIN')")` 权限控制。

前端目前仅有 `easymall-frontend/.gitkeep` 空目录占位。需要从零搭建 Vue3 管理端前端，对接全部 Admin API。

后端运行在 `localhost:8080`，前端开发服务器将运行在 `localhost:5173`（Vite 默认），需要通过 Vite 代理解决跨域。

## Goals / Non-Goals

**Goals:**

- 搭建可独立运行的 Vue3 + Vite + TypeScript 管理端项目
- 实现完整的登录认证流程（JWT Token 管理）
- 对接后端所有 8 个 Admin 模块 API
- 每个管理页面按后端接口能力提供列表查询（分页或全量）、搜索（服务端或前端本地过滤）、新增/编辑/删除等操作
- 页面设计使用 ui-ux-pro-max skill 确保质量
- 项目可通过 `npm run dev` 启动开发服务器
- 项目可通过 `npm run build` 构建生产产物

**Non-Goals:**

- 不实现用户端前端（属于 add-user-frontend 提案）
- 不做移动端适配
- 不做 SSR（服务端渲染）
- 不做复杂动画或视觉特效
- 不做国际化
- 不做暗色模式
- 不引入真实支付前端对接
- 不做权限细粒度控制（仅区分已登录/未登录管理员）

## Decisions

### D1: 技术栈选择 — Vue3 + Vite + TypeScript + Naive UI

**选择**: Vue3 Composition API + Vite + TypeScript + Naive UI + Vue Router + Pinia + Axios

**理由**:
- Vue3 + Composition API 是当前 Vue 生态主流，适合中大型管理端项目
- Vite 开发体验好，HMR 快速，构建速度快
- TypeScript 提供类型安全，减少运行时错误
- Naive UI 是项目约定（AGENTS.md）指定的 UI 组件库，Tree-shakable、TypeScript 原生支持、主题定制灵活
- Pinia 是 Vue3 官方状态管理方案，替代 Vuex
- Axios 是最成熟的 HTTP 客户端，支持拦截器

**备选方案**:
- Element Plus: 社区更大，但与项目约定冲突
- Ant Design Vue: 组件丰富，但同样与项目约定冲突

### D2: 项目结构 — 按功能模块组织

**选择**: 按业务模块组织页面和 API，不按文件类型平铺

```
easymall-frontend/
├── src/
│   ├── api/              # API 请求封装（按模块分文件）
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── ...
│   ├── assets/           # 静态资源
│   ├── components/       # 通用组件
│   ├── layouts/          # 布局组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数（request 封装等）
│   └── views/            # 页面组件（按模块分目录）
│       ├── login/
│       ├── product/
│       ├── order/
│       └── ...
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**理由**: 与后端 modules 结构呼应，便于定位和维护。

### D3: 认证方案 — Axios 拦截器 + Pinia Store + 路由守卫

**选择**:
- 登录成功后将 JWT Token 存储到 localStorage 和 Pinia store
- Axios 请求拦截器自动附加 `Authorization: Bearer <token>`
- Axios 响应拦截器处理 401 时自动跳转登录页
- Vue Router beforeEach 守卫检查 Token 是否存在

**理由**: 最简洁有效的 SPA 认证方案，与后端 Spring Security + JWT 完美配合。

### D4: API 封装 — 统一请求工具 + 按模块 API 文件

**选择**:
- `utils/request.ts`: 封装 Axios 实例，统一 baseURL、超时、拦截器
- `api/*.ts`: 按模块封装 API 调用函数，返回类型化的 Promise
- 后端 `Result<T>` 响应结构自动解包（只返回 data 部分，或统一处理错误）
- 定义 `PageResult<T>`（项目自定义分页结构）和 `MyBatisPage<T>`（MyBatis Plus Page 结构）两种分页类型，因后端不同模块返回的分页结构不一致

**理由**: 统一管理 API 调用，减少重复代码，类型安全。

### D5: 页面设计 — 调用 ui-ux-pro-max skill

**选择**: 每个管理页面的实现过程中**必须**调用 ui-ux-pro-max skill

**理由**:
- ui-ux-pro-max skill 提供 67 种风格、96 种配色、57 种字体搭配方案
- 确保管理端页面设计质量一致，不是简单的 CRUD 堆砌
- 利用 skill 的 review 和 optimize 能力优化页面体验
- 与路线图中"工程化可展示"的目标一致

### D6: 开发环境跨域 — Vite Proxy

**选择**: 在 `vite.config.ts` 中配置代理：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

**理由**: 最简单的开发环境跨域解决方案，无需后端配置 CORS。

## Risks / Trade-offs

- **[前端依赖安装]** Node.js 版本不一致可能导致依赖安装失败 → 在 README 中明确 Node.js 18+ 要求
- **[后端接口变更]** 前端开发期间后端接口可能调整 → 以 archive 中已稳定的后端提案为基础，接口变动风险低
- **[Naive UI 学习成本]** 部分复杂组件（如 DataTable、动态表单）需要学习 → Naive UI 文档完善，TypeScript 类型提示好
- **[页面数量多]** 8 个管理模块，每个模块 1-3 个页面 → 按优先级分批实现，商品→订单→用户→其他
- **[Token 过期处理]** JWT Token 过期后前端需要处理 → 响应拦截器统一处理 401，跳转登录页
- **[普通用户误入后台]** 登录接口是共用的 `/api/user/login`，普通用户也可能拿到 Token → 登录成功后必须校验 `role === 1`，非管理员清除 Token 并提示
- **[后端分页结构不统一]** 大部分模块返回 `PageResult<T>`，但优惠券模块返回 MyBatis Plus `Page<T>` → types/api.ts 同时定义两种分页类型
