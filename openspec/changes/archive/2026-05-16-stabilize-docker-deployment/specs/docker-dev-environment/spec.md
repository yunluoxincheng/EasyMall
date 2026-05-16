## MODIFIED Requirements

### Requirement: Docker Compose service orchestration
项目 MUST 包含一个 docker-compose.yml 文件，SHALL 编排后端相关服务（easymall-app、MySQL、Redis、RabbitMQ），SHALL 实现一键启动完整开发环境。

#### Scenario: 启动所有服务
- **WHEN** 在 `easymall-backend/` 目录下执行 `docker compose up -d`
- **THEN** 四个服务（easymall-app、mysql、redis、rabbitmq）全部启动
- **AND** 服务之间可以正常通信

#### Scenario: 独立开发不受根 compose 影响
- **WHEN** 在 `easymall-backend/` 目录下执行 `docker compose up -d`
- **THEN** 仅启动后端相关服务
- **AND** 不受根级别 `docker-compose.yml` 影响
