# docker-dev-environment Specification Delta

## Purpose
从 Docker 开发环境中移除 Elasticsearch 服务，简化部署架构。

## MODIFIED Requirements

### Requirement: Docker Compose service orchestration (MODIFIED)
项目 MUST 包含一个 docker-compose.yml 文件， SHALL 编排应用、MySQL、Redis 三个服务， SHALL 实现一键启动完整开发环境。

#### Scenario: 启动所有服务
**Given** docker-compose.yml 配置正确
**When** 执行 `docker-compose up -d`
**Then** 三个服务（easymall-app, mysql, redis）全部启动
**And** 服务之间可以正常通信

#### Scenario: 服务依赖关系
**Given** docker-compose.yml 定义了服务依赖
**When** 服务启动
**Then** mysql 和 redis 在 easymall-app 之前启动

---

### Requirement: Data persistence (MODIFIED)
系统 MUST 持久化 MySQL 数据， SHALL 确保容器重启后数据不丢失。

#### Scenario: MySQL 数据持久化
**Given** mysql 服务运行并创建了数据库表
**When** 停止并重新启动容器
**Then** 之前创建的表和数据仍然存在
