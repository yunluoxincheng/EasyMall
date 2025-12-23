# add-docker-dev-environment

## Summary
添加 Docker 开发环境支持，实现代码热重载开发模式。使用官方 OpenJDK 17 镜像，通过卷挂载实现源代码实时同步，并创建 docker-compose.yml 编排应用、MySQL、Redis 和 Elasticsearch 服务，提供一键启动的完整开发环境。

## Background
当前项目只有一个极简的 Dockerfile（仅基于 ubuntu 镜像运行 top 命令），无法支持实际的应用运行和开发。开发者需要在本地安装 JDK 17、Maven、MySQL、Redis、Elasticsearch 等依赖，环境配置复杂且不统一。

通过添加完善的 Docker 开发环境，可以实现：
- **环境一致性**：所有开发者使用相同的容器化环境
- **快速启动**：一键启动所有必需服务
- **代码热重载**：挂载源代码目录，修改后立即生效
- **依赖隔离**：无需本地安装各种中间件

## Goals
1. 创建生产级的 Dockerfile，基于官方 OpenJDK 17 镜像
2. 实现代码热重载开发模式，通过卷挂载实时同步代码变更
3. 创建 docker-compose.yml 编排所有开发所需服务
4. 支持开发环境配置，通过环境变量覆盖配置

## Non-Goals
1. 不修改应用代码逻辑
2. 不涉及生产环境部署优化
3. 不包含 CI/CD 流程配置

## Out of Scope
- Kubernetes 部署配置
- 镜像仓库推送流程
- 多阶段构建优化（留给后续生产部署需求）

## Proposed Solution

### Dockerfile 设计
使用 `eclipse-temurin:17-jdk` 官方镜像，包含：
- 安装 Maven 用于依赖管理
- 创建工作目录 `/app`
- 暴露应用端口 8080
- 配置 Maven 本地仓库缓存

### 代码热重载机制
通过 Spring Boot Developer Tools 实现自动重启：
- 挂载源代码目录到容器
- 使用 `spring.devtools.restart.enabled=true`
- Maven 依赖缓存到宿主机，避免重复下载

### docker-compose.yml 编排
定义四个服务：
1. **easymall-app**：主应用服务，挂载源代码和 Maven 仓库
2. **mysql**：MySQL 8 数据库，持久化数据卷
3. **redis**：Redis 缓存服务
4. **elasticsearch**：ES 搜索服务

### 环境配置覆盖
通过 `.env` 文件管理开发环境配置：
- 数据库连接信息
- Redis 连接信息
- ES 连接信息
- JWT 配置

## Alternatives Considered

### 方案A：多阶段构建（生产优化）
- **优点**：构建出最小化的生产镜像
- **缺点**：不适合开发环境，无法利用热重载
- **结论**：不采用，留给生产环境需求

### 方案B：仅 Docker 无 Compose
- **优点**：更简单，适合单一服务
- **缺点**：需要手动管理多个容器，开发体验差
- **结论**：不采用，完整开发环境需要编排

## Impact
- **新增文件**：Dockerfile（重写）、docker-compose.yml、.env、.dockerignore
- **修改文件**：可能需要调整 application.yml 支持环境变量覆盖
- **开发者体验**：显著改善，新环境只需 Docker 即可开始开发

## Dependencies
- Docker Engine 20.10+
- Docker Compose 2.0+

## Related Changes
- 无直接依赖的其他变更

## Testing Strategy
1. 验证 Dockerfile 构建成功
2. 验证 docker-compose up 启动所有服务
3. 验证代码修改后应用自动重启
4. 验证数据库连接和持久化
5. 验证 Redis 和 ES 连接

## Rollout Plan
1. 创建 Dockerfile
2. 创建 docker-compose.yml
3. 创建 .env 配置文件
4. 创建 .dockerignore 排除不必要文件
5. 更新文档说明 Docker 开发环境使用方式
