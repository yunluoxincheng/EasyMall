# Design: add-docker-dev-environment

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Compose                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   easymall  │    │    mysql    │    │   redis     │         │
│  │     app     │────�─────────────┼─────────────────┼────────┐ │
│  │  (Spring    │    │  (MySQL 8)  │    │   (Redis)   │        │ │
│  │   Boot)     │    │             │    │             │        │ │
│  └─────────────┘    └─────────────┘    └─────────────┘        │ │
│        │                                                   │    │ │
│        │    ┌─────────────┐                               │    │ │
│        └────│elasticsearch│                               │    │ │
│             │  (ES 8.x)   │                               │    │ │
│             └─────────────┘                               │    │ │
│                                                           │    │ │
│  Volume Mounts (Development):                            │    │ │
│  ├── ./src -> /app/src (热重载)                          │    │ │
│  ├── ./pom.xml -> /app/pom.xml                           │    │ │
│  ├── ~/.m2 -> /root/.m2 (Maven 仓库缓存)                 │    │ │
│  └── mysql-data -> /var/lib/mysql (数据持久化)            │    │ │
│                                                           │    │ │
└───────────────────────────────────────────────────────────┘    │ │
     │                                                        │    │ │
     ▼                                                        │    │ │
┌─────────────────────────────────────────────────────────┐ │    │ │
│                   Host Machine                            │ │    │ │
│  ┌─────────────────────────────────────────────────┐    │ │    │ │
│  │  Developer edits code in IDE                     │    │ │    │ │
│  │  ────────────────────────────────────────>       │    │    │ │
│  │  Changes sync to container via volume mount      │    │    │ │
│  │  ────────────────────────────────────────>       │    │    │ │
│  │  Spring Boot DevTools triggers auto-restart      │    │    │ │
│  └─────────────────────────────────────────────────┘    │    │ │
└─────────────────────────────────────────────────────────┘ ┘    │
                                                                  │
                                                                  │
```

## Component Design

### Dockerfile

```dockerfile
# 基础镜像：官方 OpenJDK 17
FROM eclipse-temurin:17-jdk

# 维护者信息
LABEL authors="yunluoxincheng"
LABEL description="EasyMall Spring Boot Application"

# 安装 Maven
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

# 创建工作目录
WORKDIR /app

# 复制 Maven 配置（如果需要自定义 settings.xml）
# COPY mvn-settings.xml /root/.m2/settings.xml

# 暴露应用端口
EXPOSE 8080

# 启动命令（开发模式）
ENTRYPOINT ["mvn", "spring-boot:run", "-Dspring-boot.run.fork=false"]
```

### Docker Compose Services

#### easymall-app 服务
```yaml
easymall-app:
  build:
    context: .
    dockerfile: Dockerfile
  container_name: easymall-app
  ports:
    - "8080:8080"
  environment:
    - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/easymall?...
    - SPRING_DATASOURCE_USERNAME=root
    - SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
    - SPRING_DATA_REDIS_HOST=redis
    - SPRING_ELASTICSEARCH_URIS=http://elasticsearch:9200
    - SPRING_DEVTOOLS_RESTART_ENABLED=true
  volumes:
    - ./src:/app/src
    - ./pom.xml:/app/pom.xml
    - ~/.m2:/root/.m2
  depends_on:
    - mysql
    - redis
    - elasticsearch
```

#### mysql 服务
```yaml
mysql:
  image: mysql:8.0
  container_name: easymall-mysql
  environment:
    - MYSQL_ROOT_PASSWORD=${MYSQL_PASSWORD}
    - MYSQL_DATABASE=easymall
  ports:
    - "3306:3306"
  volumes:
    - mysql-data:/var/lib/mysql
```

#### redis 服务
```yaml
redis:
  image: redis:7-alpine
  container_name: easymall-redis
  ports:
    - "6379:6379"
```

#### elasticsearch 服务
```yaml
elasticsearch:
  image: elasticsearch:8.11.0
  container_name: easymall-es
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
    - ES_JAVA_OPTS=-Xms512m -Xmx512m
  ports:
    - "9200:9200"
  volumes:
    - es-data:/usr/share/elasticsearch/data
```

### 热重载机制

Spring Boot DevTools 工作原理：
1. 监控 classpath 资源变化
2. 检测到变化后触发应用上下文重启
3. 使用两个 ClassLoader：
   - base ClassLoader：加载第三方依赖（不变）
   - restart ClassLoader：加载应用代码（重新加载）

优化配置：
- `spring.devtools.restart.exclude`：排除不需要监控的路径
- `spring.devtools.restart.additional-exclude`：额外排除静态资源

## Configuration Management

### .env 文件结构
```bash
# MySQL
MYSQL_PASSWORD=123456

# JWT
JWT_SECRET=easymall-jwt-secret-key-2023-...

# 可选：覆盖默认端口
APP_PORT=8080
```

### 配置优先级
1. 容器环境变量（docker-compose.yml 中定义）
2. .env 文件（docker-compose 自动加载）
3. application.yml（应用默认配置）

## Data Persistence

### Volume 策略
| Volume | 目标路径 | 用途 |
|--------|----------|------|
| mysql-data | /var/lib/mysql | MySQL 数据持久化 |
| es-data | /usr/share/elasticsearch/data | ES 索引数据持久化 |

## Network Design

使用 Docker 默认 bridge 网络：
- 所有服务在同一网络中
- 服务间通过服务名互相访问
- 自动 DNS 解析

## Security Considerations

1. **开发环境特定**：
   - ES 禁用安全认证（xpack.security.enabled=false）
   - 数据库暴露 3306 端口便于工具连接

2. **生产环境需要注意**：
   - 使用密钥管理服务
   - 限制网络访问
   - 启用所有安全特性

## Performance Optimization

1. **Maven 依赖缓存**：挂载宿主机 ~/.m2 到容器
2. **ES 内存限制**：设置合理的堆内存（-Xms512m -Xmx512m）
3. **日志输出**：开发环境控制台输出，便于调试

## Troubleshooting

### 常见问题
1. **热重载不生效**：确认 spring-devtools 依赖存在且 enabled=true
2. **Maven 下载缓慢**：检查 ~/.m2 挂载是否正确
3. **ES 启动失败**：检查 vm.max_map_count 内核参数
4. **数据库连接失败**：确认 depends_on 启动顺序
