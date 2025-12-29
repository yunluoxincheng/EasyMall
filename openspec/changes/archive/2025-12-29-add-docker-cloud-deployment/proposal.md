# Proposal: 云服务器 Docker 命令行部署指南

## Metadata
- **Change ID**: add-docker-cloud-deployment
- **Status**: Proposed
- **Created**: 2025-12-29

## Problem Statement
用户已将 EasyMall 后端项目构建为 Docker 镜像并推送到 Docker Hub（yunluoxincheng/easymall:latest），现在需要在 Linux 云服务器上通过纯 Docker 命令部署整个应用栈（应用 + MySQL + Redis）。

当前项目已有的 `docker-dev-environment` 规范仅适用于本地开发环境，使用 Docker Compose 和代码热重载。生产环境需要：
1. 使用已推送的镜像而非本地构建
2. 使用纯 Docker 命令而非 Docker Compose
3. 独立管理每个容器的生命周期
4. 通过环境变量注入敏感配置
5. 理解容器数据存储特性（数据存储在容器内部）

## Goals
提供清晰的生产环境 Docker 命令部署指南，使开发者能够：
1. 快速在云服务器上部署完整的应用栈
2. 理解各个容器的启动顺序和依赖关系
3. 正确配置网络、卷挂载和环境变量
4. 掌握容器管理的基本命令（启动、停止、重启、查看日志）
5. 了解数据备份和恢复的基本操作

## Non-Goals
- 不涉及 Docker 安装和环境配置（假设服务器已安装 Docker）
- 不涉及 Nginx 反向代理配置（后续需求）
- 不涉及容器编排工具（如 Kubernetes）
- 不涉及 CI/CD 自动化部署流程

## Proposed Solution
创建一个新的规范 `cloud-deployment-guide`，提供：

1. **部署前准备清单**
   - 检查 Docker 安装
   - 准备环境变量
   - 确认服务器端口可用性

2. **逐步部署命令**
   - 创建网络
   - 启动 MySQL 容器（数据存储在容器内部）
   - 启动 Redis 容器
   - 启动应用容器

3. **容器管理指南**
   - 常用管理命令
   - 日志查看
   - 服务重启

4. **故障排查**
   - 常见问题及解决方案

## Alternatives Considered
1. **继续使用 Docker Compose**
   - 优点：更简洁，一个文件管理所有服务
   - 缺点：用户明确要求使用纯 Docker 命令学习

2. **使用云数据库服务**
   - 优点：无需管理数据库容器
   - 缺点：增加额外成本，用户希望完整部署

## Impact
- 新增规范：`cloud-deployment-guide`
- 不修改现有代码
- 新增文档：`docs/cloud-deployment.md`

## Dependencies
- Docker Hub 镜像：yunluoxincheng/easymall:latest
- 服务器已安装 Docker
- 服务器防火墙已开放必要端口

## Success Criteria
1. 用户能够按照文档成功部署完整应用栈
2. 所有服务（应用、MySQL、Redis）正常运行
3. 用户理解数据存储在容器内部的特性
4. 用户能够在删除容器前正确备份数据
5. 服务间网络通信正常

## Open Questions
1. MySQL 初始化脚本如何执行？（需要确认镜像是否包含）
2. 是否需要容器开机自启配置？
3. 数据备份策略是否需要在指南中体现？

## Tasks
参见 `tasks.md`
