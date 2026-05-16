## ADDED Requirements

### Requirement: 统一部署指南文档
`docs/deployment.md` SHALL 整合本地开发、Docker Compose 和云服务器部署说明。

#### Scenario: 开发者本地启动完整系统
- **WHEN** 开发者查看"本地开发"部分
- **THEN** 看到 MySQL、Redis、RabbitMQ、后端、前端的启动顺序和配置步骤
- **AND** 看到环境变量配置说明（.env.example 的使用）

#### Scenario: 开发者使用 Docker Compose 启动
- **WHEN** 开发者查看"Docker Compose"部分
- **THEN** 看到后端 docker-compose.yml 启动方式（MySQL + Redis + RabbitMQ + 后端）
- **AND** 看到前端 docker-compose.yml 启动方式（Nginx + 前端静态文件 + 反向代理）
- **AND** 理解前端 Docker 通过 host.docker.internal 访问宿主机 8080 端口，后端内部服务使用 Compose 默认网络通信

#### Scenario: 开发者部署到云服务器
- **WHEN** 开发者查看"云服务器部署"部分
- **THEN** 看到镜像构建和推送步骤
- **AND** 看到服务器上的部署命令
- **AND** 看到 Nginx 反向代理配置

#### Scenario: 开发者配置环境变量
- **WHEN** 开发者查看环境变量部分
- **THEN** 看到 .env.example 中所有变量的说明
- **AND** 理解哪些变量是必需的，哪些有默认值
- **AND** 理解使用前端 Docker 部署时后端宿主机端口须保持 8080（APP_PORT 默认值），如修改 APP_PORT 须同步修改前端 nginx.conf 代理地址并重建镜像

#### Scenario: 开发者确认 Docker 版本要求
- **WHEN** 开发者查看前提条件部分
- **THEN** 看到建议 Docker Engine 20.10+（Linux 上 host.docker.internal 依赖 host-gateway 支持）
