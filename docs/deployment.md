# 部署指南

## 前提条件

- **Docker Engine 20.10+**（Linux 上 `host.docker.internal` 依赖 `host-gateway` 支持）
- **Docker Compose 2.0+**
- 至少 2GB 可用内存

## 本地开发启动

### 1. 配置环境变量

```bash
# 在仓库根目录下
cp .env.example easymall-backend/.env
```

本地 `mvn spring-boot:run` 使用 dev profile（`application-dev.yml`），MySQL 密码硬编码为 `123456`。`.env` 中的 `MYSQL_PASSWORD` 仅供 Docker Compose 使用，不会覆盖 dev profile 的数据库连接。如果本地 MySQL 密码不是 `123456`，需要修改 `application-dev.yml` 或通过启动参数 `--spring.datasource.password=xxx` 覆盖。

### 2. 启动基础设施

```bash
cd easymall-backend
docker compose up -d mysql redis rabbitmq
```

或手动启动 MySQL 8.0、Redis 7、RabbitMQ 3 服务。

### 3. 初始化数据库

dev profile 默认关闭 Flyway（`spring.flyway.enabled: false`），需要手动初始化数据库：

```bash
cd easymall-backend
mysql -u root -p123456 easymall < src/main/resources/db/migration/V1__Create_initial_tables.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/V2__Create_member_tables.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/V3__Create_points_exchange_tables.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/V5__Add_coupon_tables.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/V6__Create_inventory_tables.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/V7__Create_payment_tables.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/V8__Create_message_consume_log.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/V9__Add_points_record_unique_constraint.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/V10__Add_coupon_lifecycle_indexes.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/V11__Add_points_biz_columns.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/test-data.sql
```

> Docker 全栈部署（prod profile）会自动执行 Flyway 迁移，无需手动导入。详见下方 Docker Compose 部署章节。

### 4. 启动后端

```bash
cd easymall-backend
mvn spring-boot:run
```

### 5. 启动前端

```bash
cd easymall-frontend
npm install
npm run dev
```

### 5. 访问系统

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173 |
| 后端 API | http://localhost:8080/api |
| RabbitMQ 管理 | http://localhost:15672（guest/guest） |

## Docker Compose 部署

### 启动后端全栈

```bash
# 在仓库根目录下配置环境变量
cp .env.example easymall-backend/.env
# 编辑 easymall-backend/.env 填入 MYSQL_PASSWORD、JWT_SECRET 等

# 启动 MySQL + Redis + RabbitMQ + Spring Boot
cd easymall-backend
docker compose up -d
```

后端使用 Docker Compose 默认网络，服务间通过服务名互访（如 `mysql:3306`、`redis:6379`、`rabbitmq:5672`）。

### 启动前端

```bash
cd easymall-frontend
docker compose up -d
```

前端通过 `host.docker.internal` 访问宿主机上的后端 8080 端口，无需与后端共享 Docker 网络。

### 网络架构

```
┌─────────────────────────────────────┐
│ 后端 Docker Compose（默认网络）       │
│  ├── easymall-app  → mysql:3306     │
│  │                 → redis:6379     │
│  │                 → rabbitmq:5672  │
│  ├── mysql                          │
│  ├── redis                          │
│  └── rabbitmq                       │
│        ↕ 宿主机端口映射 :8080        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 前端 Docker Compose                  │
│  └── nginx                          │
│       → host.docker.internal:8080   │
│       （extra_hosts: host-gateway）  │
└─────────────────────────────────────┘
```

### 服务端口

| 服务 | 容器端口 | 宿主机端口 |
|------|---------|-----------|
| Spring Boot | 8080 | `${APP_PORT:-8080}` |
| MySQL | 3306 | `${MYSQL_PORT:-3306}` |
| Redis | 6379 | `${REDIS_PORT:-6379}` |
| RabbitMQ | 5672 | `${RABBITMQ_PORT:-5672}` |
| RabbitMQ 管理 | 15672 | `${RABBITMQ_MGMT_PORT:-15672}` |
| Nginx（前端） | 80 | `${FRONTEND_PORT:-80}` |

## 云服务器部署

### 1. 构建并推送镜像

```bash
# 后端镜像
cd easymall-backend
docker build -t yunluoxincheng/easymall:latest .
docker push yunluoxincheng/easymall:latest

# 前端镜像
cd easymall-frontend
docker build -t yunluoxincheng/easymall-frontend:latest .
docker push yunluoxincheng/easymall-frontend:latest
```

### 2. 服务器上创建配置

```bash
# 创建 .env 文件
cat > .env << 'EOF'
SPRING_PROFILES_ACTIVE=prod
APP_PORT=8080
MYSQL_PASSWORD=your_strong_password
JWT_SECRET=your_jwt_secret_key_at_least_256_bits_long
FILE_UPLOAD_BASE_URL=http://your-server-ip:8080/uploads
EOF
```

### 3. 启动服务

```bash
# 启动后端
cd easymall-backend
docker compose up -d

# 等待后端就绪后启动前端
cd ../easymall-frontend
docker compose up -d
```

### 4. 验证部署

```bash
curl http://localhost:8080/api/product/page?page=1&size=5
```

### 5. Nginx 配置（如需域名访问）

前端容器已内置 Nginx 配置。如需自定义域名或 HTTPS，可在宿主机安装 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:80;  # 前端容器端口
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
    }
}
```

## 环境变量配置

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `MYSQL_PASSWORD` | MySQL root 密码 | `your_strong_password` |
| `JWT_SECRET` | JWT 签名密钥 | `至少 256 位的随机字符串` |

### 可选变量（有默认值）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring Profile |
| `APP_PORT` | `8080` | 后端端口 |
| `MYSQL_PORT` | `3306` | MySQL 端口 |
| `REDIS_PASSWORD` | 空 | Redis 密码 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `RABBITMQ_USERNAME` | `guest` | RabbitMQ 用户名 |
| `RABBITMQ_PASSWORD` | `guest` | RabbitMQ 密码 |
| `RABBITMQ_PORT` | `5672` | RabbitMQ 端口 |
| `RABBITMQ_MGMT_PORT` | `15672` | RabbitMQ 管理端口 |
| `FRONTEND_PORT` | `80` | 前端端口 |
| `FILE_UPLOAD_BASE_URL` | `http://localhost:8080/uploads` | 图片访问 URL |

> **注意**：前端 Docker 部署时，`APP_PORT` 须保持默认值 `8080`。因为前端 `nginx.conf` 中 `proxy_pass` 地址为 `http://host.docker.internal:8080`，如修改 `APP_PORT`，须同步修改 `nginx.conf` 并重新构建前端镜像。

## 常见问题

### Maven 依赖下载缓慢

首次启动会下载依赖，依赖缓存到宿主机 `~/.m2` 目录，后续启动更快。

### 端口冲突

修改 `.env` 中的端口配置，或关闭占用端口的服务。

### 重新初始化数据库

```bash
cd easymall-backend
docker compose down -v
docker compose up -d
```

`-v` 删除数据卷，下次启动时 Flyway 会重新执行迁移。

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f easymall-app
```
