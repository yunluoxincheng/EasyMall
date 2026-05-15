# Docker 镜像构建与部署指南

## 镜像信息

- **镜像名称**: `yunluoxincheng/easymall:latest`
- **Docker Hub**: https://hub.docker.com/r/yunluoxincheng/easymall
- **基础镜像**: `eclipse-temurin:17-jdk`
- **应用端口**: 8080

## 推送镜像到 Docker Hub

### 步骤 1: 登录 Docker Hub

在终端执行以下命令登录：

```bash
docker login
```

输入您的 Docker Hub 用户名和密码。

### 步骤 2: 推送镜像

```bash
docker push yunluoxincheng/easymall:latest
```

推送成功后，镜像将可在 Docker Hub 上访问。

## 云服务器部署步骤

### 1. SSH 连接到云服务器

```bash
ssh root@8.134.192.13
```

### 2. 创建项目目录

```bash
cd /root
mkdir -p EasyMall
cd EasyMall
```

### 3. 拉取最新镜像

```bash
docker pull yunluoxincheng/easymall:latest
```

### 4. 创建环境变量文件

创建 `.env` 文件：

```bash
cat > .env << 'EOF'
# MySQL 配置
MYSQL_PASSWORD=your_mysql_password

# 应用端口配置
APP_PORT=8080

# MySQL 端口配置
MYSQL_PORT=3306

# Redis 端口配置
REDIS_PORT=6379
EOF
```

**重要**: 将 `your_mysql_password` 替换为实际的 MySQL 密码。

### 5. (可选) 使用 docker run 部署 (适用于只有 Docker 的环境)

如果您的云服务器上只有 Docker，没有 docker-compose，可以使用 `docker run` 命令部署。

#### 5.1 创建上传文件目录

```bash
mkdir -p /root/EasyMall/uploads/products
mkdir -p /root/EasyMall/uploads/avatars
chmod 755 /root/EasyMall/uploads
```

#### 5.2 使用 docker run 启动容器

```bash
docker run -d \
  --name easymall-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_mysql_password \
  -e SPRING_DATA_REDIS_HOST=host.docker.internal \
  -e SPRING_DATA_REDIS_PORT=6379 \
  -e FILE_UPLOAD_BASE_PATH=/data/easymall/uploads \
  -e FILE_UPLOAD_BASE_URL=http://8.134.192.13/uploads \
  -v /root/EasyMall/uploads:/data/easymall/uploads \
  --restart unless-stopped \
  yunluoxincheng/easymall:latest
```

**重要说明:**
- `host.docker.internal`: 用于在容器内访问宿主机的 MySQL 和 Redis
- `-v /root/EasyMall/uploads:/data/easymall/uploads`: Volume 挂载，确保上传的图片持久化保存
- 替换 `your_mysql_password` 为实际的 MySQL 密码

#### 5.3 使用更新脚本

您也可以使用提供的更新脚本自动部署：

```bash
# 上传脚本到服务器
scp update-cloud-server.sh root@8.134.192.13:/root/

# 在服务器上执行
chmod +x update-cloud-server.sh
export MYSQL_PASSWORD=your_actual_password
./update-cloud-server.sh
```

### 6. 创建 docker-compose.yml (适用于有 docker-compose 的环境)

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # EasyMall 应用服务
  easymall-app:
    image: yunluoxincheng/easymall:latest
    container_name: easymall-app
    ports:
      - "${APP_PORT:-8080}:8080"
    environment:
      # 数据源配置
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
      # Redis 配置
      - SPRING_DATA_REDIS_HOST=redis
      - SPRING_DATA_REDIS_PORT=6379
      - SPRING_DATA_REDIS_PASSWORD=
      # 文件上传配置
      - FILE_UPLOAD_BASE_PATH=/data/easymall/uploads
      - FILE_UPLOAD_BASE_URL=http://8.134.192.13/uploads
    volumes:
      # 文件上传目录挂载
      - ./uploads:/data/easymall/uploads
    depends_on:
      - mysql
      - redis
    networks:
      - easymall-network
    restart: unless-stopped

  # MySQL 数据库服务
  mysql:
    image: mysql:8.0
    container_name: easymall-mysql
    command: >
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --default-authentication-plugin=mysql_native_password
      --init-connect="SET NAMES utf8mb4"
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_DATABASE=easymall
      - TZ=Asia/Shanghai
    ports:
      - "${MYSQL_PORT:-3306}:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      # 挂载数据库初始化脚本
      - ./db/migration:/docker-entrypoint-initdb.d:ro
    networks:
      - easymall-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis 缓存服务
  redis:
    image: redis:7-alpine
    container_name: easymall-redis
    ports:
      - "${REDIS_PORT:-6379}:6379"
    networks:
      - easymall-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

networks:
  easymall-network:
    driver: bridge

volumes:
  mysql-data:
    driver: local
EOF
```

### 7. 配置 Nginx

创建或编辑 Nginx 配置文件：

```bash
cat > /etc/nginx/conf.d/easymall.conf << 'EOF'
server {
    listen 80;
    server_name 8.134.192.13;

    # 静态文件访问 - 上传的图片
    location /uploads/ {
        alias /root/EasyMall/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";

        # 安全限制 - 只允许图片文件
        location ~ \.(jpg|jpeg|png|gif)$ {
            # 允许访问
        }
        # 拒绝访问其他文件
        location /uploads/ {
            location ~ \.[^.]+$ {
                return 403;
            }
        }
    }

    # API 代理到 Spring Boot 应用
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 文件上传相关配置
        client_max_body_size 5M;
        proxy_request_buffering off;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:8080/actuator/health;
        access_log off;
    }
}
EOF
```

测试并重启 Nginx：

```bash
nginx -t
systemctl reload nginx
```

### 8. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f easymall-app

# 查看服务状态
docker-compose ps
```

### 9. 验证部署

#### 检查应用健康状态

```bash
curl http://localhost:8080/actuator/health
```

#### 测试 API 接口

```bash
# 测试商品列表接口
curl http://8.134.192.13/api/product/page

# 测试用户注册接口
curl -X POST http://8.134.192.13/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "nickname": "测试用户"
  }'
```

#### 测试图片上传

```bash
# 先登录获取 Token
TOKEN=$(curl -X POST http://8.134.192.13/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | jq -r '.data.token')

# 上传图片
curl -X POST http://8.134.192.13/api/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "type=product"
```

## 服务管理命令

### 使用 docker run 的管理命令

如果您使用 `docker run` 部署：

#### 查看容器状态

```bash
docker ps -a | grep easymall-app
```

#### 查看应用日志

```bash
# 查看实时日志
docker logs -f easymall-app

# 查看最近 100 行日志
docker logs --tail 100 easymall-app
```

#### 重启容器

```bash
docker restart easymall-app
```

#### 停止并删除容器

```bash
docker stop easymall-app
docker rm easymall-app
```

#### 更新镜像并重启

```bash
# 拉取最新镜像
docker pull yunluoxincheng/easymall:latest

# 停止并删除旧容器
docker stop easymall-app
docker rm easymall-app

# 重新启动容器 (使用之前的 docker run 命令)
docker run -d \
  --name easymall-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_mysql_password \
  -e SPRING_DATA_REDIS_HOST=host.docker.internal \
  -e SPRING_DATA_REDIS_PORT=6379 \
  -e FILE_UPLOAD_BASE_PATH=/data/easymall/uploads \
  -e FILE_UPLOAD_BASE_URL=http://8.134.192.13/uploads \
  -v /root/EasyMall/uploads:/data/easymall/uploads \
  --restart unless-stopped \
  yunluoxincheng/easymall:latest
```

### 使用 docker-compose 的管理命令

如果您使用 `docker-compose` 部署：

#### 查看服务状态

```bash
docker-compose ps
```

#### 查看应用日志

```bash
docker-compose logs -f easymall-app
```

#### 重启应用

```bash
docker-compose restart easymall-app
```

#### 停止所有服务

```bash
docker-compose down
```

#### 更新镜像并重启

```bash
# 拉取最新镜像
docker pull yunluoxincheng/easymall:latest

# 停止并删除旧容器
docker-compose down

# 启动新容器
docker-compose up -d
```

### 进入容器调试

```bash
docker exec -it easymall-app bash
```

## 备份与恢复

### 备份上传的图片

```bash
# 创建备份
cd /root/EasyMall
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# 列出备份文件
ls -lh uploads-backup-*.tar.gz
```

### 备份数据库

```bash
# 导出数据库
docker exec easymall-mysql mysqldump -uroot -p${MYSQL_PASSWORD} easymall > easymall-backup-$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
# 导入数据库
docker exec -i easymall-mysql mysql -uroot -p${MYSQL_PASSWORD} easymall < easymall-backup-YYYYMMDD.sql
```

## 常见问题

### 1. 容器启动失败

查看详细日志：

```bash
docker-compose logs easymall-app
```

### 2. 无法访问上传的图片

检查：
- Nginx 配置是否正确
- uploads 目录权限是否正确
- 文件是否存在于服务器上

```bash
ls -la /root/EasyMall/uploads/
```

### 3. 数据库连接失败

检查：
- MySQL 容器是否运行
- 环境变量配置是否正确
- 数据库是否已初始化

```bash
docker-compose logs mysql
docker exec -it easymall-mysql mysql -uroot -p
```

### 4. 端口被占用

检查端口占用：

```bash
netstat -tlnp | grep 8080
netstat -tlnp | grep 3306
```

修改 `.env` 文件中的端口配置。

### 5. 镜像拉取失败

检查网络连接，或使用国内镜像源：

```bash
# 配置 Docker 镜像加速
sudo vim /etc/docker/daemon.json
```

添加内容：

```json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

重启 Docker：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 监控与维护

### 查看容器资源使用情况

```bash
docker stats
```

### 查看磁盘使用情况

```bash
df -h
docker system df
```

### 清理未使用的资源

```bash
docker system prune -a
```

### 定时清理日志

```bash
# 添加 crontab 任务
crontab -e

# 每天凌晨 3 点清理 7 天前的日志
0 3 * * * docker logs --since 7d easymall-app > /dev/null 2>&1 && truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

## 安全建议

1. **修改默认密码**: 修改 MySQL root 密码和 Redis 密码
2. **配置防火墙**: 只开放必要的端口 (80, 443, 22)
3. **使用 HTTPS**: 配置 SSL 证书
4. **定期备份**: 定期备份数据库和上传文件
5. **更新镜像**: 及时更新 Docker 镜像以修复安全漏洞

## 生产环境优化建议

1. **使用多阶段构建**: 优化镜像大小
2. **配置日志轮转**: 防止日志文件过大
3. **设置资源限制**: 限制容器使用的 CPU 和内存
4. **使用健康检查**: 确保服务可用性
5. **配置监控告警**: 使用 Prometheus + Grafana
6. **使用编排工具**: 考虑使用 Kubernetes

## 技术支持

如有问题，请检查：
- 应用日志: `docker-compose logs easymall-app`
- Nginx 日志: `/var/log/nginx/error.log`
- MySQL 日志: `docker-compose logs mysql`
