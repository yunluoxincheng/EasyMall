## Context

EasyMall 后端和前端已有各自独立的 Docker Compose 编排：

- `easymall-backend/docker-compose.yml`：编排后端 app、MySQL、Redis、RabbitMQ，服务间通过 Docker 内部网络通信
- `easymall-frontend/docker-compose.yml`：仅编排前端 Nginx 容器，通过 `host.docker.internal` 访问后端

两者独立运行可行，但缺少统一的一键启动入口。前端 Nginx 只代理 `/api/`，未代理 `/uploads/`，生产部署时用户无法访问上传的图片。

## Goals / Non-Goals

**Goals:**

- 根级别 `docker-compose.yml` 一键启动全部 5 个服务（frontend、backend、mysql、redis、rabbitmq）
- 前端 Nginx 代理 `/api/` 到后端，通过挂载 volume 直接提供 `/uploads/` 静态文件
- 生产环境下前端和后端通过 Docker 内部网络通信（不再依赖 host.docker.internal）
- 保留各子目录的独立 compose 文件用于单独开发

**Non-Goals:**

- 不引入 Kubernetes
- 不做云平台自动化部署
- 不做多节点高可用
- 不修改后端 Dockerfile 或构建流程
- 不改变现有 Docker 网络架构（前后端各自独立网络的模式保持不变用于开发）

## Decisions

### D1: 根级别 compose 文件引用子目录 Dockerfile

根级别 `docker-compose.yml` 通过 `build.context` 分别指向 `easymall-backend/` 和 `easymall-frontend/`，复用现有 Dockerfile，不重复维护构建逻辑。

理由：避免在根目录维护第二套 Dockerfile，减少构建配置漂移。

### D2: 生产模式使用共享 Docker 网络

根级别 compose 中，所有服务加入同一个 Docker 网络 `easymall-net`。前端 Nginx 直接通过服务名 `easymall-app` 代理到后端，不再使用 `host.docker.internal`。

理由：同一 compose 文件内的服务天然共享网络，服务名即主机名，更简洁可靠。

### D3: 前端 Nginx 通过挂载 Volume 直接提供 /uploads/ 静态文件

后端 `FileUploadController` 只提供上传接口 `/api/upload`，文件存储在 `FILE_UPLOAD_BASE_PATH`（容器内 `/data/easymall/uploads`），后端没有 `/uploads/**` 的静态资源映射。

因此 `/uploads/` 不应代理到后端（会 404），而是让 Nginx 直接挂载同一个 `upload-data` volume，通过 `alias /data/easymall/uploads/;` 提供静态文件服务。这是生产环境提供静态文件的标准做法，性能也优于经过 Spring Boot。

替代方案：在后端新增 `WebMvcConfigurer` 映射 `/uploads/**` → `file:${FILE_UPLOAD_BASE_PATH}/`，然后 Nginx 反代。但引入额外的后端代码只为代理静态文件没有必要，Nginx 直接服务更简洁。

### D4: 生产环境必需变量缺失时 fail fast

`application-prod.yml` 中 `SPRING_DATASOURCE_*`、`JWT_SECRET`、`FILE_UPLOAD_BASE_PATH`、`FILE_UPLOAD_BASE_URL`、`PAYMENT_MOCK_SIGNATURE` 均无默认值。根级别 compose 的 `.env` 缺少这些变量时后端应启动失败，而非静默使用弱默认密钥。

文档中 MUST 明确列出所有必需环境变量。

### D5: 保留子目录独立 compose 用于开发

`easymall-backend/docker-compose.yml` 和 `easymall-frontend/docker-compose.yml` 保持不变，各自 `docker compose up` 仍可独立运行，通过 `host.docker.internal` 跨网络通信。

理由：开发时经常只启动后端调试，不应强制启动全部服务。

## Risks / Trade-offs

- **风险：前端 Nginx 成为单点** → 当前规模可接受，后续如需独立扩展 Nginx 再拆分
- **风险：根 compose 和子目录 compose 的 Nginx 上游地址不同** → 通过环境变量区分：根 compose 注入 `BACKEND_HOST=easymall-app`，子目录 compose 使用 `host.docker.internal` 默认值
- **风险：开发环境 compose 文件 drift** → 根 compose 和子目录 compose 职责不同（生产 vs 开发），各有独立维护理由
- **风险：根 compose 未注入所有 prod 必需变量** → 根 compose 的 easymall-app environment 中 MUST 显式列出所有 `application-prod.yml` 引用的环境变量，至少包括 `PAYMENT_MOCK_SIGNATURE`
