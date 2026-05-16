## ADDED Requirements

### Requirement: Nginx 反向代理 API 请求
前端 Nginx SHALL 将 `/api/` 路径的请求反向代理到后端服务。

#### Scenario: 代理 API 请求到后端
- **WHEN** 用户访问 `http://<host>/api/product/list`
- **THEN** Nginx 将请求代理到 `http://easymall-app:8080/api/product/list`
- **AND** 返回后端响应给用户

#### Scenario: 传递客户端真实 IP
- **WHEN** Nginx 代理 API 请求
- **THEN** 请求头包含 `X-Real-IP`
- **AND** 请求头包含 `X-Forwarded-For`

### Requirement: Nginx 通过挂载 Volume 提供上传文件静态服务
前端 Nginx SHALL 挂载与后端相同的 `upload-data` volume，MUST 通过 `alias` 指令将 `/uploads/` 映射到容器内 `/data/easymall/uploads/` 目录，直接提供静态文件服务。

#### Scenario: 访问已上传的图片
- **WHEN** 用户访问 `http://<host>/uploads/products/2024/01/test.jpg`
- **THEN** Nginx 从 `/data/easymall/uploads/products/2024/01/test.jpg` 直接返回文件
- **AND** Content-Type 为对应的图片类型

#### Scenario: 文件不存在时返回 404
- **WHEN** 用户访问 `/uploads/nonexistent.jpg`
- **THEN** Nginx 返回 404 Not Found

#### Scenario: 根级别 compose 中前端挂载 upload-data volume
- **WHEN** 通过根级别 `docker compose up` 启动
- **THEN** easymall-frontend 容器挂载 `upload-data` volume 到 `/data/easymall/uploads`
- **AND** Nginx 的 `/uploads/` location 使用 `alias /data/easymall/uploads/;`

### Requirement: Nginx 后端地址可配置
Nginx 配置中的后端地址 MUST 通过环境变量注入，SHALL 支持开发模式（host.docker.internal）和生产模式（easymall-app）。

#### Scenario: 生产模式使用服务名
- **WHEN** 通过根级别 `docker compose up` 启动
- **THEN** Nginx 通过环境变量 `BACKEND_HOST=easymall-app` 代理到后端
- **AND** 前端和后端通过 Docker 内部网络通信

#### Scenario: 开发模式使用 host.docker.internal
- **WHEN** 通过 `easymall-frontend/docker compose up` 独立启动前端
- **THEN** Nginx 使用默认值 `host.docker.internal` 代理到宿主机上的后端
