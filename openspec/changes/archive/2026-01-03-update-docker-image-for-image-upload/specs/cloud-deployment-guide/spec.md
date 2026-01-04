## ADDED Requirements

### Requirement: Docker 镜像必须包含图片上传功能代码

Docker 镜像构建 SHALL 包含所有图片上传相关的 Java 代码和配置,无需修改现有的 `Dockerfile.production`。

#### Scenario: 验证镜像包含图片上传功能

**Given** 使用 `Dockerfile.production` 构建镜像
**When** 镜像构建完成
**Then** 镜像包含 `FileUploadController.class`
**And** 镜像包含 `FileStorageService.class`
**And** 镜像包含 `FileUploadProperties.class`
**And** 镜像大小合理 (不超过 500MB)

#### Scenario: 验证镜像运行环境

**Given** Docker 镜像已构建
**When** 启动容器
**Then** 容器使用 `eclipse-temurin:17-jre-alpine` 基础镜像
**And** 容器暴露端口 8080
**And** Spring Profile 为 `prod`

---

### Requirement: docker run 命令必须配置文件上传环境变量和 Volume 挂载

使用 `docker run` 命令启动容器时,SHALL 配置文件上传相关的环境变量和 Volume 挂载。

#### Scenario: 配置文件上传环境变量

**Given** 云服务器上只有 Docker
**When** 使用 `docker run` 命令启动容器
**Then** 添加 `-e FILE_UPLOAD_BASE_PATH=/data/easymall/uploads` 参数
**And** 添加 `-e FILE_UPLOAD_BASE_URL=http://8.134.192.13/uploads` 参数

#### Scenario: 配置 Volume 挂载

**Given** 云服务器上只有 Docker
**When** 使用 `docker run` 命令启动容器
**Then** 添加 `-v /root/EasyMall/uploads:/data/easymall/uploads` 参数
**And** 上传文件持久化存储在宿主机 `/root/EasyMall/uploads` 目录

#### Scenario: 完整的 docker run 命令

**Given** 云服务器上只有 Docker
**When** 执行 `docker run` 命令启动容器
**Then** 命令包含所有必要的环境变量和 Volume 挂载
**And** 命令格式如下:
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

---

### Requirement: 云服务器部署必须预创建上传目录

云服务器部署脚本 SHALL 在启动容器前创建必要的上传目录结构。

#### Scenario: 创建上传目录结构

**Given** 云服务器已连接
**When** 执行部署脚本
**Then** 创建 `/root/EasyMall/uploads/products` 目录
**And** 创建 `/root/EasyMall/uploads/avatars` 目录
**And** 目录权限设置为 755
**And** 目录所有者为容器运行用户

#### Scenario: 验证目录权限

**Given** 上传目录已创建
**When** 检查目录权限
**Then** 目录权限为 755 (rwxr-xr-x)
**And** 容器内用户可以读写该目录

---

### Requirement: Nginx 必须提供上传图片的静态文件访问

Nginx 配置 SHALL 提供上传图片的 HTTP 访问,并配置缓存策略。

#### Scenario: 配置图片静态文件访问

**Given** Nginx 配置文件 `/etc/nginx/conf.d/easymall.conf`
**When** 配置 `/uploads/` location
**Then** `/uploads/` 映射到 `/root/EasyMall/uploads/` 目录
**And** 添加 `Cache-Control: public, immutable` 响应头
**And** 设置过期时间为 30 天

#### Scenario: 限制图片文件类型访问

**Given** Nginx 配置已设置
**When** 用户访问 `/uploads/` 路径
**Then** 只允许访问 `.jpg`, `.jpeg`, `.png`, `.gif` 文件
**And** 访问其他文件类型返回 403 禁止访问

#### Scenario: 测试图片访问

**Given** 图片已上传到 `uploads/products/2024/01/test.jpg`
**When** 访问 `http://8.134.192.13/uploads/products/2024/01/test.jpg`
**Then** 返回 HTTP 200 状态码
**And** Content-Type 为 `image/jpeg`
**And** 响应包含缓存控制头

---

### Requirement: 镜像推送脚本必须自动化构建和发布流程

项目 SHALL 提供脚本自动化 Docker 镜像的构建、打标签和推送流程。

#### Scenario: Windows 脚本推送镜像

**Given** `push-docker-image.bat` 脚本存在
**When** 执行脚本
**Then** 自动登录 Docker Hub
**And** 使用 `Dockerfile.production` 构建镜像
**And** 给镜像打标签为 `yunluoxincheng/easymall:latest`
**And** 推送镜像到 Docker Hub

#### Scenario: Linux/Mac 脚本推送镜像

**Given** `push-docker-image.sh` 脚本存在
**When** 执行脚本
**Then** 自动登录 Docker Hub
**And** 使用 `Dockerfile.production` 构建镜像
**And** 给镜像打标签为 `yunluoxincheng/easymall:latest`
**And** 推送镜像到 Docker Hub

---

### Requirement: 云服务器更新脚本必须自动化部署流程

项目 SHALL 提供脚本自动化云服务器上的镜像更新和容器重启流程。

#### Scenario: 更新云服务器镜像

**Given** 云服务器更新脚本存在
**When** 执行更新脚本
**Then** 停止并删除旧容器
**And** 拉取最新镜像 `yunluoxincheng/easymall:latest`
**And** 启动新容器
**And** 验证服务正常运行

#### Scenario: 更新失败时回滚

**Given** 更新脚本执行失败
**When** 检测到错误
**Then** 脚本自动回滚到旧版本
**And** 记录错误日志
**And** 通知管理员

---

### Requirement: 部署文档必须包含图片上传配置说明

部署文档 SHALL 详细说明图片上传功能的配置、验证和故障排查步骤。

#### Scenario: 文档包含环境变量配置

**Given** 查阅 `docs/deployment-guide.md`
**When** 查找文件上传配置
**Then** 文档说明 `FILE_UPLOAD_BASE_PATH` 配置
**And** 文档说明 `FILE_UPLOAD_BASE_URL` 配置

#### Scenario: 文档包含 Nginx 配置示例

**Given** 查阅 `docs/deployment-guide.md`
**When** 查找 Nginx 配置
**Then** 文档提供完整的 Nginx 配置示例
**And** 文档说明如何重启 Nginx

#### Scenario: 文档包含故障排查步骤

**Given** 查阅 `docs/deployment-guide.md`
**When** 查找故障排查
**Then** 文档列出常见问题和解决方案
**And** 文档说明如何检查容器日志
**And** 文档说明如何验证文件权限

---

## MODIFIED Requirements

### Requirement: 应用容器部署

部署者 MUST 使用环境变量注入配置启动应用容器， SHALL 配置正确的端口映射和服务发现。对于图片上传功能，必须配置 Volume 挂载以确保文件持久化存储。

#### Scenario: 启动应用容器

**Given** MySQL 和 Redis 容器已运行
**When** 执行应用 docker run 命令
**Then** 应用容器成功启动
**And** 端口 8080 映射到主机
**And** 连接到 easymall-net 网络
**And** 注入所有必需的环境变量

#### Scenario: 配置数据库连接

**Given** 应用容器启动中
**When** 设置 SPRING_DATASOURCE_URL 环境变量
**Then** 值为 jdbc:mysql://easymall-mysql:3306/easymall?...
**And** 使用容器名称作为主机名

#### Scenario: 配置 Redis 连接

**Given** 应用容器启动中
**When** 设置 SPRING_DATA_REDIS_HOST 环境变量
**Then** 值为 easymall-redis
**And** 使用容器名称作为主机名

#### Scenario: 配置文件上传 Volume 挂载

**Given** 应用容器需要支持图片上传功能
**When** 执行 docker run 命令
**Then** 添加 `-v /root/EasyMall/uploads:/data/easymall/uploads` 参数
**And** 添加 `-e FILE_UPLOAD_BASE_PATH=/data/easymall/uploads` 环境变量
**And** 添加 `-e FILE_UPLOAD_BASE_URL=http://8.134.192.13/uploads` 环境变量
**And** 上传文件持久化保存在宿主机

#### Scenario: 验证应用启动

**Given** 应用容器已启动
**When** 执行 `docker logs easymall-app`
**Then** 显示 Spring Boot 启动成功日志
**And** 监听端口为 8080
