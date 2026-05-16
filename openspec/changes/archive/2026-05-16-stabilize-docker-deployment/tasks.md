## 1. Nginx 配置更新

- [x] 1.1 修改 `easymall-frontend/nginx.conf`，新增 `/uploads/` location，使用 `alias /data/easymall/uploads/;` 提供静态文件服务
- [x] 1.2 将 Nginx 配置模板化，API 代理上游地址通过环境变量 `BACKEND_HOST` 注入（默认值 `host.docker.internal`）
- [x] 1.3 更新 `easymall-frontend/Dockerfile`，增加 envsubst 处理 Nginx 配置模板的启动脚本

## 2. 根级别统一 Docker Compose

- [x] 2.1 创建根目录 `docker-compose.yml`，定义 easymall-frontend、easymall-app、mysql、redis、rabbitmq 五个服务
- [x] 2.2 配置统一网络 `easymall-net`，所有服务加入
- [x] 2.3 配置构建上下文：easymall-app 指向 `easymall-backend/`，easymall-frontend 指向 `easymall-frontend/`
- [x] 2.4 easymall-app 的 environment 中显式列出所有 prod 必需变量，至少包括 `PAYMENT_MOCK_SIGNATURE`（对照 `application-prod.yml` 逐项检查）
- [x] 2.5 配置 volumes：mysql-data、upload-data；easymall-frontend 也挂载 upload-data 到 `/data/easymall/uploads`
- [x] 2.6 注入 `BACKEND_HOST=easymall-app` 到前端容器的环境变量
- [x] 2.7 配置服务依赖：mysql → redis → rabbitmq → easymall-app → easymall-frontend，使用 `depends_on.condition: service_healthy`

## 3. 健康检查

- [x] 3.1 为 easymall-app 添加 healthcheck：`wget -q --spider http://localhost:8080/actuator/health || exit 1`（alpine 无 curl，用 wget；/actuator/** 已在 SecurityConfig 放行）
- [x] 3.2 为 easymall-frontend 添加 healthcheck：`wget -q --spider http://localhost:80/ || exit 1`
- [x] 3.3 验证 mysql、redis、rabbitmq 已有 healthcheck（复用后端 compose 的配置）

## 4. 环境变量补充

- [x] 4.1 在 `.env.example` 中补充 `FRONTEND_PORT` 变量
- [x] 4.2 在 `.env.example` 中补充 `PAYMENT_MOCK_SIGNATURE` 变量
- [x] 4.3 在 `.env.example` 中标注所有必需变量（MYSQL_PASSWORD、JWT_SECRET 等），确保生产部署时无遗漏

## 5. 部署文档更新

- [x] 5.1 更新部署文档，增加根级别 `docker compose up -d` 一键启动说明
- [x] 5.2 增加必需环境变量清单和 fail fast 说明
- [x] 5.3 增加 RabbitMQ 服务配置说明
- [x] 5.4 增加 Nginx 反向代理 `/api/` 和静态文件 `/uploads/` 的说明
- [x] 5.5 增加故障排查：`docker compose ps` 检查 healthy、`docker compose logs` 查看日志、常见启动错误

## 6. 验证

- [x] 6.1 根级别 `docker compose build` 构建所有镜像成功
- [x] 6.2 根级别 `docker compose up -d` 启动全部 5 个服务，全部 healthy
- [x] 6.3 前端页面可通过 Nginx 端口访问
- [x] 6.4 API 请求通过 Nginx `/api/` 代理到达后端
- [x] 6.5 上传图片通过 Nginx `/uploads/` 路径可访问（Nginx 直接从 volume 读取）
- [x] 6.6 缺少必需环境变量时后端启动失败（fail fast 验证）
- [x] 6.7 子目录 `easymall-backend/docker compose up -d` 仍可独立启动后端相关服务
