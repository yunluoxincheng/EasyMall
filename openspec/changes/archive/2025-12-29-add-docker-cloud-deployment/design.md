
# Design: 云服务器 Docker 命令行部署

## Overview
本设计描述如何在 Linux 云服务器上使用纯 Docker 命令部署 EasyMall 完整应用栈。

## Architecture

### 容器架构
```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                    (easymall-net)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  easymall    │  │    mysql     │  │    redis     │  │
│  │    :8080     │  │    :3306     │  │    :6379     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                 │                             │
└─────────┼─────────────────┼─────────────────────────────┘
          │                 │
    ┌─────┴─────────┐  ┌────┴─────────┐
    │ Port 8080     │  │ Port 3306    │
    │ (Optional)    │  │ (Internal)   │
    └───────────────┘  └──────────────┘
```

### 数据存储说明
- MySQL 数据存储在容器内部 `/var/lib/mysql`
- **重要**: 容器删除后数据将丢失，务必定期使用 mysqldump 备份数据

## Deployment Flow

### 阶段 1: 准备环境
```bash
# 1. 拉取镜像
docker pull yunluoxincheng/easymall:latest
docker pull mysql:8.0
docker pull redis:7-alpine

# 2. 创建网络
docker network create easymall-net
```

### 阶段 2: 启动依赖服务
```bash
# 启动 MySQL（数据存储在容器内部）
docker run -d \
  --name easymall-mysql \
  --network easymall-net \
  -e MYSQL_ROOT_PASSWORD=your_secure_password \
  -e MYSQL_DATABASE=easymall \
  -e TZ=Asia/Shanghai \
  mysql:8.0

# 等待 MySQL 就绪
docker run --rm --network easymall-net \
  mysql:8.0 mysqladmin ping -h easymall-mysql \
  -uroot -pyour_secure_password

# 启动 Redis
docker run -d \
  --name easymall-redis \
  --network easymall-net \
  redis:7-alpine
```

### 阶段 3: 启动应用
```bash
docker run -d \
  --name easymall-app \
  --network easymall-net \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://easymall-mysql:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_secure_password \
  -e SPRING_DATA_REDIS_HOST=easymall-redis \
  -e SPRING_DATA_REDIS_PORT=6379 \
  yunluoxincheng/easymall:latest
```

## Container Management

### 启动/停止
```bash
docker start easymall-app easymall-mysql easymall-redis
docker stop easymall-app easymall-mysql easymall-redis
```

### 重启服务
```bash
docker restart easymall-app
```

### 查看日志
```bash
docker logs -f easymall-app
docker logs --tail 100 easymall-mysql
```

### 进入容器
```bash
docker exec -it easymall-app bash
docker exec -it easymall-mysql mysql -uroot -p
```

## Data Backup & Recovery

### MySQL 备份
```bash
docker exec easymall-mysql mysqldump -uroot -pyour_password easymall > backup.sql
```

### MySQL 恢复
```bash
docker exec -i easymall-mysql mysql -uroot -pyour_password easymall < backup.sql
```

## Security Considerations

1. **密码安全**: 使用强密码，避免明文写在命令历史中
2. **端口暴露**: 生产环境建议不直接暴露 MySQL 端口
3. **网络隔离**: 使用 Docker 内部网络隔离服务
4. **资源限制**: 可添加 `--memory` 和 `--cpus` 限制资源使用

## Troubleshooting

### 常见问题
1. 容器启动失败 → 查看日志 `docker logs <container>`
2. 网络连接问题 → 检查网络 `docker network inspect easymall-net`
3. MySQL 容器删除后数据丢失 → 这是预期行为，使用备份恢复
4. 端口冲突 → 检查端口占用 `netstat -tlnp | grep 8080`

### 健康检查
```bash
# 检查容器状态
docker ps

# 检查应用健康
curl http://localhost:8080/api/health

# 检查数据库连接
docker exec easymall-mysql mysqladmin ping -h localhost
```
