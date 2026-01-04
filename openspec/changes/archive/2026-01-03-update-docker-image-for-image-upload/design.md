# Design: Docker 镜像更新支持图片上传

## Context

项目新增了图片上传和存储功能,允许用户上传商品图片和头像。文件存储在服务器的 `/data/easymall/uploads` 目录,并通过 Nginx 提供静态文件访问。

**当前状态:**
- `Dockerfile.production` 使用多阶段构建,基于 `eclipse-temurin:17-jre-alpine`
- 应用端口: 8080
- 文件上传配置通过环境变量注入
- 使用 Docker Volume 持久化上传文件

**约束条件:**
- 必须保持向后兼容性
- 云服务器 IP: 8.134.192.13
- Docker Hub 用户名: yunluoxincheng
- 镜像名称: yunluoxincheng/easymall:latest

## Goals / Non-Goals

**Goals:**
- Docker 镜像包含最新的图片上传功能代码
- Volume 挂载配置正确,文件持久化存储
- Nginx 可以正确提供静态文件访问
- 部署流程自动化,减少手动操作

**Non-Goals:**
- 不修改图片上传的业务逻辑
- 不改变现有的目录结构
- 不引入新的对象存储服务 (如 MinIO, S3)

## Decisions

### 1. Dockerfile.production 无需修改

**决策:** 现有的 `Dockerfile.production` 无需修改即可支持图片上传功能。

**理由:**
- 图片上传是纯 Java 代码实现,已包含在 jar 包中
- 文件存储路径通过环境变量 `FILE_UPLOAD_BASE_PATH` 配置
- Volume 挂载在 `docker-compose.yml` 中配置
- 多阶段构建已经优化了镜像大小

### 2. docker run 命令配置

**决策:** 云服务器使用 `docker run` 命令启动容器，需要配置环境变量和 Volume 挂载。

**配置参数:**
```bash
docker run -d \
  --name easymall-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  -e SPRING_DATA_REDIS_HOST=host.docker.internal \
  -e SPRING_DATA_REDIS_PORT=6379 \
  -e FILE_UPLOAD_BASE_PATH=/data/easymall/uploads \
  -e FILE_UPLOAD_BASE_URL=http://8.134.192.13/uploads \
  -v /root/EasyMall/uploads:/data/easymall/uploads \
  --restart unless-stopped \
  yunluoxincheng/easymall:latest
```

**关键参数说明:**
- `-v /root/EasyMall/uploads:/data/easymall/uploads`: 挂载本地目录保存上传的图片
- `-e FILE_UPLOAD_BASE_PATH=/data/easymall/uploads`: 容器内文件存储路径
- `-e FILE_UPLOAD_BASE_URL=http://8.134.192.13/uploads`: 图片访问 URL 前缀
- `--restart unless-stopped`: 容器自动重启策略

### 3. Nginx 静态文件服务配置

**决策:** 使用 Nginx 提供上传图片的静态文件访问。

**配置要点:**
- Location: `/uploads/` 映射到 `/root/EasyMall/uploads/`
- 缓存策略: 30 天过期
- 安全限制: 只允许访问图片文件 (.jpg, .jpeg, .png, .gif)
- 文件大小限制: 5MB

### 4. 目录结构设计

**决策:** 按图片类型和年月组织目录结构。

```
uploads/
├── products/           # 商品图片
│   └── 2024/01/       # 按年月组织
│       └── uuid.jpg
└── avatars/           # 用户头像
    └── 2024/01/
        └── uuid.jpg
```

**优势:**
- 便于按时间管理和清理
- 避免单目录文件过多
- 支持按类型统计和监控

### 5. 部署自动化

**决策:** 创建脚本自动化镜像构建、推送和部署流程。

**脚本:**
- `push-docker-image.sh/bat`: 本地构建并推送镜像
- 云服务器更新脚本: 拉取镜像、重启容器

## Risks / Trade-offs

### 风险 1: 文件权限问题

**风险:** 容器内用户无法写入挂载的 Volume。

**缓解措施:**
- 在 Dockerfile 中创建非 root 用户 (spring)
- 在宿主机创建目录并设置正确权限 (755)
- 必要时在 docker-compose.yml 中配置 `USER` 环境变量

### 风险 2: 磁盘空间不足

**风险:** 上传文件过多导致磁盘空间不足。

**缓解措施:**
- 监控磁盘使用情况
- 定期清理旧图片
- 设置文件大小限制 (5MB)
- 考虑实现图片清理策略

### 风险 3: 容器重启文件丢失

**风险:** Volume 配置错误导致容器重启后文件丢失。

**缓解措施:**
- 正确配置 Volume 挂载
- 测试容器重启后文件是否保留
- 定期备份上传文件

## Migration Plan

### 步骤 1: 本地准备

1. 检查 `Dockerfile.production` 确认无需修改
2. 本地构建并测试镜像

### 步骤 2: 推送镜像

1. 登录 Docker Hub: `docker login`
2. 构建镜像: `docker build -f Dockerfile.production -t yunluoxincheng/easymall:latest .`
3. 推送镜像: `docker push yunluoxincheng/easymall:latest`

### 步骤 3: 云服务器更新 (使用 docker run)

1. 连接服务器: `ssh root@8.134.192.13`
2. 拉取最新镜像: `docker pull yunluoxincheng/easymall:latest`
3. 停止并删除旧容器:
   ```bash
   docker stop easymall-app
   docker rm easymall-app
   ```
4. 创建上传目录:
   ```bash
   mkdir -p /root/EasyMall/uploads/products
   mkdir -p /root/EasyMall/uploads/avatars
   chmod 755 /root/EasyMall/uploads
   ```
5. 启动新容器 (使用 docker run):
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
- `host.docker.internal` 用于在容器内访问宿主机的 MySQL 和 Redis
- `-v` 参数挂载本地目录，确保图片持久化保存
- 替换 `your_mysql_password` 为实际的 MySQL 密码

### 步骤 4: Nginx 配置

1. 更新 Nginx 配置文件
2. 测试配置: `nginx -t`
3. 重启 Nginx: `systemctl reload nginx`

### 步骤 5: 验证

1. 测试图片上传接口
2. 验证图片可访问
3. 检查容器日志
4. 确认 Volume 挂载正常

### 回滚计划

如果更新失败,执行以下步骤回滚:

1. 停止并删除新容器:
   ```bash
   docker stop easymall-app
   docker rm easymall-app
   ```
2. 使用旧镜像启动容器:
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
     yunluoxincheng/easymall:old-version-tag
   ```
3. 验证旧版本正常运行:
   ```bash
   docker logs easymall-app
   curl http://localhost:8080/actuator/health
   ```

## Open Questions

1. **镜像版本管理:** 是否需要使用语义化版本号 (如 v1.0.0) 而不是 `latest`?
   - **建议:** 使用 `latest` 用于开发,生产环境使用带版本号的标签

2. **备份策略:** 如何备份上传的图片文件?
   - **建议:** 定期使用 tar 打包 uploads 目录

3. **监控:** 如何监控文件上传和磁盘使用情况?
   - **建议:** 使用 `docker stats` 和 `df -h` 定期检查
