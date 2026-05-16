## MODIFIED Requirements

### Requirement: 应用容器部署
部署指南 SHALL 反映新的前后端独立 Docker 部署架构，前后端各自拥有独立的 docker-compose.yml，无需手动创建共享网络。

#### Scenario: 启动后端服务
- **WHEN** 开发者在 easymall-backend/ 执行 docker-compose up
- **THEN** MySQL、Redis、RabbitMQ、后端 Spring Boot 服务启动
- **AND** Docker Compose 自动创建默认网络，服务间通过服务名互相访问
- **AND** 后端端口 8080 映射到宿主机

#### Scenario: 启动前端服务（Docker）
- **WHEN** 开发者在 easymall-frontend/ 执行 docker-compose up
- **THEN** 前端通过 Nginx 提供静态文件服务
- **AND** Nginx 通过 host.docker.internal 将 /api 请求代理到宿主机 8080 端口
- **AND** 前端无需与后端共享 Docker 网络

#### Scenario: 启动前端服务（本地开发）
- **WHEN** 开发者在 easymall-frontend/ 执行 npm run dev
- **THEN** Vite 开发服务器启动
- **AND** Vite 代理将 /api 请求转发到 localhost:8080

#### Scenario: 完整系统启动
- **WHEN** 后端 Docker 服务和前端服务（Docker 或本地）都启动
- **THEN** 用户通过前端端口访问系统
- **AND** API 请求自动转发到后端

## REMOVED Requirements

### Requirement: Docker 网络配置
**Reason**: 前后端不再共享 Docker 网络，后端 compose 使用默认网络，前端通过 host.docker.internal 访问后端宿主机端口，无需任何手动网络操作
**Migration**: 直接 docker-compose up 即可

### Requirement: Redis 容器部署
**Reason**: Redis 由后端 docker-compose.yml 管理，无需独立手动部署
**Migration**: 使用后端 docker-compose.yml 统一管理 MySQL、Redis、RabbitMQ

### Requirement: MySQL 数据存储
**Reason**: 存储策略由 docker-compose.yml volumes 定义，不再单独说明
**Migration**: 参见 docs/deployment.md

### Requirement: MySQL 容器部署
**Reason**: MySQL 由后端 docker-compose.yml 管理
**Migration**: 使用后端 docker-compose.yml 统一管理

### Requirement: 镜像拉取准备
**Reason**: 镜像由 docker-compose 自动拉取或 Dockerfile 多阶段构建
**Migration**: 使用 docker-compose build 或 docker pull

### Requirement: Docker 环境检查
**Reason**: 保留在 docs/deployment.md 前提条件部分
**Migration**: 参见 docs/deployment.md

### Requirement: 镜像推送脚本必须自动化构建和发布流程
**Reason**: 旧的推送脚本已随 Docker 重构删除
**Migration**: 使用新的前后端独立 Dockerfile 构建和推送
