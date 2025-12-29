# Proposal: Remove Elasticsearch Dependency

## Metadata
- **ID**: remove-elasticsearch-dependency
- **Status**: Draft
- **Created**: 2025-12-29
- **Author**: AI Assistant

## Problem Statement

当前项目在 git 分支还原后，pom.xml 中包含了 Elasticsearch 依赖，并且 docker-compose.yml 和 application.yml 中也有 ES 相关配置。但实际上商品搜索功能使用的是 MySQL LIKE 模糊查询，并没有真正使用 Elasticsearch。

这种不一致导致了：
1. **不必要的依赖**：项目依赖了未使用的 ES 库，增加了打包体积
2. **启动问题**：如果 Docker Compose 配置了 ES 服务但应用未使用，会浪费资源
3. **配置混乱**：application.yml 中有 ES 配置但实际不生效，容易造成误解

## Proposed Solution

完全移除 Elasticsearch 相关的依赖和配置，保持使用 MySQL 全文索引（FULLTEXT）+ Redis 缓存的搜索方案：

1. **移除 ES Maven 依赖**：从 pom.xml 中移除 spring-boot-starter-data-elasticsearch
2. **移除 ES 配置**：从 application.yml 和 docker-compose.yml 中移除 elasticsearch 配置
3. **更新项目文档**：更新 openspec/project.md 和 README.md，移除 ES 相关描述
4. **更新 Docker 配置**：从 docker-compose.yml 中移除 elasticsearch 服务

## Alternatives Considered

### Alternative 1: 保留 ES 并实现搜索功能
- **优点**: ES 提供更强大的全文搜索能力
- **缺点**: 增加系统复杂度，需要额外的 ES 服务维护，与当前简化的 MySQL + Redis 方案不符

### Alternative 2: 使用 MySQL 全文索引替代 LIKE 查询
- **优点**: 比 LIKE 查询性能更好，支持相关性排序
- **缺点**: 需要修改 ProductMapper.xml 和数据库表结构
- **决策**: 本次变更不涉及，可后续单独评估

## Impact Assessment

### Affected Components
- pom.xml：移除 ES 依赖
- application.yml：移除 spring.elasticsearch 配置
- docker-compose.yml：移除 elasticsearch 服务
- openspec/project.md：更新技术栈描述
- openspec/specs/docker-dev-environment/spec.md：更新 Docker 环境规范

### Risk Assessment
- **风险等级**: 低
- **原因**: 代码中未实际使用 ES，移除配置和依赖不会影响现有功能

## Dependencies

- 无前置依赖

## Success Criteria

1. pom.xml 中不再包含 elasticsearch 依赖
2. application.yml 中不再包含 spring.elasticsearch 配置
3. docker-compose.yml 中不再包含 elasticsearch 服务
4. 项目可以正常启动和运行
5. 商品搜索功能正常工作（使用 MySQL LIKE 查询）
