# Design: Remove Elasticsearch Dependency

## Architecture Overview

当前商品搜索架构：
```
前端请求 -> ProductController -> ProductService -> ProductMapper (MySQL LIKE)
                                         |
                                         v
                                    Redis 缓存 (5分钟过期)
```

移除 ES 后，保持当前架构不变，仅清理未使用的依赖和配置。

## Component Changes

### 1. pom.xml
移以下依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
</dependency>
```

### 2. application.yml
移除以下配置：
```yaml
spring:
  elasticsearch:
    uris: http://localhost:9200
```

### 3. docker-compose.yml
移除以下内容：
1. elasticsearch 服务定义
2. es-data 卷定义
3. easymall-app 中的 ES 环境变量配置
4. easymall-app 对 elasticsearch 的依赖

修改前：
```yaml
services:
  easymall-app:
    environment:
      - SPRING_ELASTICSEARCH_URIS=http://elasticsearch:9200
    depends_on:
      - mysql
      - redis
      - elasticsearch

  elasticsearch:
    image: elasticsearch:8.11.0
    ...

volumes:
  es-data:
    driver: local
```

修改后：
```yaml
services:
  easymall-app:
    environment:
      # 移除 ES 配置
    depends_on:
      - mysql
      - redis
      # 移除 elasticsearch 依赖

  # 移除 elasticsearch 服务定义

volumes:
  mysql-data:
    driver: local
  # 移除 es-data
```

### 4. openspec/project.md
更新技术栈描述：
```yaml
## Tech Stack
- JDK 17
- Spring Boot 4.0.1
- Spring MVC + RESTful API
- Spring Security + JWT 认证
- MyBatis Plus
- MySQL 8（数据库 + 全文搜索）
- Redis（缓存）
# 移除: Elasticsearch（商品搜索）
```

### 5. openspec/specs/docker-dev-environment/spec.md
更新 "Docker Compose service orchestration" 需求：
- 从 "四个服务" 改为 "三个服务"
- 移除 elasticsearch 相关场景

## Data Migration

无需数据迁移，因为未实际使用 ES。

## Testing Strategy

1. **编译测试**: 验证项目编译成功
2. **启动测试**: 验证应用可以正常启动（无 ES 连接错误）
3. **功能测试**: 验证商品搜索功能正常工作
4. **Docker 测试**: 验证 docker-compose up 可以正常启动所有服务

## Rollback Plan

如需恢复 ES 支持：
1. 恢复 pom.xml 中的 ES 依赖
2. 恢复 application.yml 和 docker-compose.yml 中的 ES 配置
3. 更新相关文档
