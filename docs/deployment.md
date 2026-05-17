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
mysql -u root -p123456 easymall < src/main/resources/db/migration/V12__Add_favorite_redundant_columns.sql
mysql -u root -p123456 easymall < src/main/resources/db/migration/test-data.sql
```

> Docker 全栈部署（prod profile）会自动执行 Flyway 迁移，无需手动导入。详见下方统一编排部署章节。

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

### 6. 访问系统

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173 |
| 后端 API | http://localhost:8080/api |
| RabbitMQ 管理 | http://localhost:15672（guest/guest） |

## Docker Compose 部署

### 方式一：统一编排一键启动（推荐）

根级别 `docker-compose.yml` 统一编排 5 个服务：easymall-frontend、easymall-app、mysql、redis、rabbitmq，通过共享网络 `easymall-net` 互通。

**1. 配置环境变量**

```bash
# 在仓库根目录下
cp .env.example .env
# 编辑 .env，填入所有必需变量（参见下方环境变量章节）
```

**2. 一键启动**

```bash
# 在项目根目录下
docker compose up -d
```

所有服务按依赖顺序启动：mysql → redis → rabbitmq → easymall-app → easymall-frontend。

**3. 验证**

```bash
# 查看服务状态（等待所有服务 healthy）
docker compose ps

# 前端页面
curl http://localhost

# API 代理
curl http://localhost/api/product/page?page=1&size=5
```

**网络架构**

```
┌──────────────────────────────────────────────────────┐
│ 根 docker-compose.yml（easymall-net 网络）             │
│                                                       │
│  easymall-frontend → easymall-app:8080 /api/          │
│  easymall-frontend → /data/easymall/uploads/ /uploads/│
│  easymall-app      → mysql:3306                       │
│  easymall-app      → redis:6379                       │
│  easymall-app      → rabbitmq:5672                    │
│                                                       │
│  easymall-frontend :80 ← 宿主机 :80                   │
│  easymall-app      :8080 ← 宿主机 :8080               │
│  mysql             :3306 ← 宿主机 :3306               │
│  redis             :6379 ← 宿主机 :6379               │
│  rabbitmq          :5672/:15672 ← 宿主机              │
└──────────────────────────────────────────────────────┘
```

**Nginx 代理说明**

| 路径 | 代理目标 | 说明 |
|------|---------|------|
| `/` | 前端静态文件（SPA） | `try_files` 回退到 `index.html` |
| `/api/` | `easymall-app:8080` | 反向代理，传递 `X-Real-IP`、`X-Forwarded-For` |
| `/uploads/` | 本地 `/data/easymall/uploads/` | Nginx 直接从共享 volume 读取，不经过后端 |

`/uploads/` 路径通过 Nginx `alias` 指令直接从 `upload-data` volume 读取静态文件，无需经过 Spring Boot 处理，性能更优。

**RabbitMQ 配置**

RabbitMQ 使用 `rabbitmq:3-management-alpine` 镜像，同时提供 AMQP 服务（5672）和管理面板（15672）。健康检查使用 `rabbitmq-diagnostics check_port_connectivity`。默认用户名/密码为 `guest/guest`，生产环境建议修改。

### 方式二：子目录独立启动（开发用）

可分别启动后端和前端，适用于只调试某一端的场景。

**启动后端全栈**

```bash
# 在仓库根目录下配置环境变量
cp .env.example easymall-backend/.env
# 编辑 easymall-backend/.env 填入 MYSQL_PASSWORD、JWT_SECRET 等

cd easymall-backend
docker compose up -d
```

**启动前端**

```bash
cd easymall-frontend
docker compose up -d
```

后端使用 Docker Compose 默认网络，服务间通过服务名互访（如 `mysql:3306`、`redis:6379`、`rabbitmq:5672`）。前端通过 `host.docker.internal` 访问宿主机上的后端 8080 端口。

### 服务端口

| 服务 | 容器端口 | 宿主机端口 |
|------|---------|-----------|
| Nginx（前端） | 80 | `${FRONTEND_PORT:-80}` |
| Spring Boot | 8080 | `${APP_PORT:-8080}` |
| MySQL | 3306 | `${MYSQL_PORT:-3306}` |
| Redis | 6379 | `${REDIS_PORT:-6379}` |
| RabbitMQ | 5672 | `${RABBITMQ_PORT:-5672}` |
| RabbitMQ 管理 | 15672 | `${RABBITMQ_MGMT_PORT:-15672}` |

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
FRONTEND_PORT=80
MYSQL_PASSWORD=your_strong_password
JWT_SECRET=your_jwt_secret_key_at_least_256_bits_long
PAYMENT_MOCK_SIGNATURE=your_mock_payment_signature
FILE_UPLOAD_BASE_URL=http://your-server-ip/uploads
EOF
```

### 3. 启动服务

```bash
# 在项目根目录下一键启动
docker compose up -d
```

### 4. 验证部署

```bash
# 检查所有服务状态
docker compose ps

# 验证前端
curl http://localhost

# 验证 API 代理
curl http://localhost/api/product/page?page=1&size=5
```

## 环境变量配置

### 必需变量

以下变量**必须**在 `.env` 中配置，缺失时后端启动会失败（fail fast）：

| 变量 | 说明 | 示例 |
|------|------|------|
| `MYSQL_PASSWORD` | MySQL root 密码 | `your_strong_password` |
| `JWT_SECRET` | JWT 签名密钥 | `至少 256 位的随机字符串` |
| `PAYMENT_MOCK_SIGNATURE` | 支付模拟签名密钥 | `your_mock_payment_signature` |

> **Fail Fast 机制**：`docker-compose.yml` 中 `MYSQL_PASSWORD`、`JWT_SECRET`、`PAYMENT_MOCK_SIGNATURE` 使用 `${VAR:?error}` 语法。如果 `.env` 中缺少这些变量，`docker compose up` 会直接报错退出，不会将空值传入容器。

### 可选变量（有默认值）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring Profile |
| `APP_PORT` | `8080` | 后端端口 |
| `FRONTEND_PORT` | `80` | 前端端口 |
| `MYSQL_PORT` | `3306` | MySQL 端口 |
| `REDIS_PASSWORD` | 空 | Redis 密码 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `RABBITMQ_USERNAME` | `guest` | RabbitMQ 用户名 |
| `RABBITMQ_PASSWORD` | `guest` | RabbitMQ 密码 |
| `RABBITMQ_PORT` | `5672` | RabbitMQ 端口 |
| `RABBITMQ_MGMT_PORT` | `15672` | RabbitMQ 管理端口 |
| `FILE_UPLOAD_BASE_URL` | `http://localhost/uploads` | 图片访问 URL（统一编排下由 Nginx 提供静态文件） |

## 故障排查

### 检查服务健康状态

```bash
# 查看所有服务状态，关注 healthy/unhealthy
docker compose ps

# 查看特定服务健康状态
docker inspect --format='{{.State.Health.Status}}' easymall-app
```

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f easymall-app
docker compose logs -f easymall-frontend

# 查看最近 100 行日志
docker compose logs --tail 100 easymall-app
```

### 常见启动错误

| 问题 | 现象 | 解决方案 |
|------|------|---------|
| 必需变量缺失 | easymall-app 启动失败，日志中显示 `${...}` 解析错误 | 检查 `.env` 是否包含 `MYSQL_PASSWORD`、`JWT_SECRET`、`PAYMENT_MOCK_SIGNATURE` |
| MySQL 未就绪 | easymall-app 报连接拒绝 | 等待 mysql healthy 后重试，或检查 healthcheck 配置 |
| 前端无法访问后端 API | 浏览器控制台 502/504 | 统一编排模式下检查 `BACKEND_HOST` 是否为 `easymall-app`；独立模式下检查 `host.docker.internal` |
| 端口冲突 | 启动报端口已被占用 | 修改 `.env` 中的 `APP_PORT`、`FRONTEND_PORT` 等 |
| 图片上传后无法访问 | `/uploads/` 返回 404 | 统一编排模式下 Nginx 直接读取 volume；独立模式下需确认后端 `FILE_UPLOAD_BASE_URL` 配置正确 |
| RabbitMQ 连接失败 | 后端日志报 RabbitMQ 连接异常 | 检查 rabbitmq 服务是否 healthy，确认 `RABBITMQ_USERNAME`/`RABBITMQ_PASSWORD` 配置 |

### 重新初始化数据库

```bash
docker compose down -v
docker compose up -d
```

`-v` 删除数据卷（包括 mysql-data 和 upload-data），下次启动时 Flyway 会重新执行迁移。

### 重新构建镜像

```bash
# 重新构建所有镜像
docker compose build

# 重新构建并启动
docker compose up -d --build

# 仅重新构建后端
docker compose build easymall-app
```
