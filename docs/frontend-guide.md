# 前端开发指南

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5+ | 前端框架（Composition API） |
| Vite | 8+ | 构建工具 |
| TypeScript | 6+ | 类型安全 |
| Naive UI | 2.44+ | UI 组件库 |
| Pinia | 3+ | 状态管理 |
| Axios | 1.16+ | HTTP 客户端 |
| Vue Router | 4+ | 路由管理 |

## 快速开始

### 安装依赖

```bash
cd easymall-frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 类型检查

```bash
npm run typecheck
```

## API 代理配置

开发环境通过 Vite 内置代理转发 `/api` 请求到后端：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

前端代码中所有 API 请求使用相对路径 `/api/xxx`，由 Vite 在开发环境自动代理，无需手动配置。

## 目录结构

```
easymall-frontend/src/
├── api/                # API 请求封装
├── assets/             # 静态资源（图片、样式等）
├── components/         # 公共组件
├── layouts/            # 布局组件
├── router/             # 路由配置
├── stores/             # Pinia 状态管理
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
└── views/              # 页面组件
    ├── login/          # 登录页
    ├── category/       # 分类管理（管理端）
    ├── comment/        # 评论管理（管理端）
    ├── coupon/         # 优惠券管理（管理端）
    ├── coupon-center/  # 优惠券中心（用户端）
    ├── memberLevel/    # 会员等级管理（管理端）
    ├── pointsProduct/  # 积分商品管理（管理端）
    ├── product/        # 商品管理（管理端）
    ├── user-home/      # 首页（用户端）
    ├── user-cart/      # 购物车（用户端）
    ├── user-checkout/  # 结算（用户端）
    ├── user-orders/    # 我的订单（用户端）
    ├── user-payment/   # 支付（用户端）
    ├── user-coupons/   # 我的优惠券（用户端）
    ├── user-member/    # 会员中心（用户端）
    ├── user-favorites/ # 收藏（用户端）
    ├── user-comments/  # 评论（用户端）
    └── user-login/     # 登录注册（用户端）
```

## 生产构建

### 本地构建

```bash
npm run build
```

输出到 `dist/` 目录，包含静态 HTML、JS、CSS 文件。

### Docker 构建

前端使用多阶段 Dockerfile：

```dockerfile
# 阶段一：Node 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段二：Nginx 托管
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建并运行：

```bash
# 构建镜像
docker compose build

# 启动容器
docker compose up -d
```

### Nginx 配置

生产环境通过 Nginx 提供 SPA 服务并反向代理 API：

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://host.docker.internal:8080/api/;
    }
}
```
