# cloud-deployment-guide Specification

## Purpose
TBD - created by archiving change add-docker-cloud-deployment. Update Purpose after archive.
## Requirements
### Requirement: Docker 环境检查
部署者 MUST 确保 Linux 服务器已安装 Docker 且服务正常运行， SHALL 在部署前验证 Docker 版本和权限。

#### Scenario: 检查 Docker 安装
**Given** 开发者登录到 Linux 服务器
**When** 执行 `docker --version`
**Then** 显示 Docker 版本信息
**And** 版本不低于 20.10

#### Scenario: 验证 Docker 服务状态
**Given** Docker 已安装
**When** 执行 `docker info`
**Then** 显示 Docker 系统信息
**And** 无错误信息输出

#### Scenario: 验证 Docker 权限
**Given** 当前用户非 root
**When** 执行 `docker ps`
**Then** 成功显示容器列表
**And** 无权限错误提示

---

### Requirement: 镜像拉取准备
部署者 MUST 从 Docker Hub 拉取所需镜像， SHALL 确保所有镜像拉取成功后再进行部署。

#### Scenario: 拉取应用镜像
**Given** 服务器已安装 Docker
**When** 执行 `docker pull yunluoxincheng/easymall:latest`
**Then** 镜像成功拉取到本地
**And** 可以通过 `docker images` 查看到镜像

#### Scenario: 拉取 MySQL 镜像
**Given** 服务器已安装 Docker
**When** 执行 `docker pull mysql:8.0`
**Then** MySQL 8.0 镜像成功拉取
**And** 镜像大小约 500MB

#### Scenario: 拉取 Redis 镜像
**Given** 服务器已安装 Docker
**When** 执行 `docker pull redis:7-alpine`
**Then** Redis Alpine 镜像成功拉取
**And** 镜像大小约 30MB

---

### Requirement: Docker 网络配置
系统 MUST 创建专用的 Docker 网络， SHALL 使所有服务容器连接到同一网络以实现服务间通信。

#### Scenario: 创建应用网络
**Given** 所有镜像已拉取完成
**When** 执行 `docker network create easymall-net`
**Then** 创建名为 easymall-net 的桥接网络
**And** 可以通过 `docker network ls` 查看到该网络

#### Scenario: 验证网络配置
**Given** easymall-net 网络已创建
**When** 执行 `docker network inspect easymall-net`
**Then** 显示网络详细信息
**And** 驱动类型为 bridge

---

### Requirement: MySQL 数据存储
系统 SHALL 将 MySQL 数据存储在容器内部， MUST 在删除容器前备份重要数据。

#### Scenario: 理解数据存储位置
**Given** MySQL 容器已启动
**When** 执行 `docker exec easymall-mysql ls /var/lib/mysql`
**Then** 显示数据库文件目录
**And** 数据存储在容器内部

#### Scenario: 容器删除后数据行为
**Given** MySQL 容器正在运行且包含数据
**When** 删除容器（不使用 --volumes）
**Then** 容器内部数据一同被删除
**And** 数据无法恢复

---

### Requirement: MySQL 容器部署
部署者 MUST 使用正确的环境变量启动 MySQL 容器， SHALL 确保数据库服务正常可连接。

#### Scenario: 启动 MySQL 容器
**Given** Docker 网络已创建
**When** 执行 MySQL docker run 命令
**Then** MySQL 容器以 detached 模式启动
**And** 容器名称为 easymall-mysql
**And** 连接到 easymall-net 网络
**And** 数据存储在容器内部

#### Scenario: 验证 MySQL 就绪状态
**Given** MySQL 容器已启动
**When** 执行健康检查命令
**Then** MySQL 服务响应 ping 请求
**And** 可以建立数据库连接

---

### Requirement: Redis 容器部署
部署者 MUST 启动 Redis 容器连接到应用网络， SHALL 确保 Redis 服务可被应用容器访问。

#### Scenario: 启动 Redis 容器
**Given** Docker 网络已创建
**When** 执行 `docker run -d --name easymall-redis --network easymall-net redis:7-alpine`
**Then** Redis 容器成功启动
**And** 容器连接到 easymall-net 网络

#### Scenario: 验证 Redis 连接
**Given** Redis 容器已启动
**When** 从应用容器执行 redis-cli ping
**Then** 返回 PONG 响应

---

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

### Requirement: 容器管理操作
部署者 MUST 掌握基本的容器管理命令， SHALL 能够启动、停止、重启和查看容器状态。

#### Scenario: 查看容器状态
**Given** 容器已部署
**When** 执行 `docker ps`
**Then** 显示所有运行中的容器
**And** 包含容器 ID、名称、端口映射等信息

#### Scenario: 停止所有服务
**Given** 所有容器正在运行
**When** 执行 `docker stop easymall-app easymall-mysql easymall-redis`
**Then** 所有容器按顺序停止
**And** 数据卷数据保持不变

#### Scenario: 重启应用服务
**Given** 应用容器已停止
**When** 执行 `docker start easymall-app`
**Then** 应用容器重新启动
**And** 服务恢复正常

---

### Requirement: 日志查看与调试
部署者 MUST 能够查看容器日志进行问题诊断， SHALL 支持实时日志跟踪和历史日志查询。

#### Scenario: 查看应用实时日志
**Given** 应用容器正在运行
**When** 执行 `docker logs -f easymall-app`
**Then** 显示应用实时日志输出
**And** 日志持续更新直到中断

#### Scenario: 查看最近日志
**Given** 应用容器正在运行
**When** 执行 `docker logs --tail 100 easymall-app`
**Then** 显示最后 100 行日志
**And** 包含最近的应用活动

#### Scenario: 查看多个服务日志
**Given** 需要诊断服务间通信问题
**When** 分别查看各个容器日志
**Then** 可以追踪请求在不同服务间的流转

---

### Requirement: 数据备份与恢复
系统 SHALL 提供 MySQL 数据备份和恢复的命令， SHALL 确保生产数据可安全恢复。

#### Scenario: 备份数据库
**Given** MySQL 容器正在运行
**When** 执行 mysqldump 备份命令
**Then** 生成包含所有数据的 SQL 文件
**And** 文件保存到主机指定目录

#### Scenario: 恢复数据库
**Given** 存在有效的备份 SQL 文件
**When** 执行 mysql 恢复命令
**Then** 数据成功导入到数据库
**And** 应用可以访问恢复后的数据

---

### Requirement: 端口访问配置
部署者 MUST 确保服务器防火墙允许应用端口访问， SHALL 配置安全组或防火墙规则。

#### Scenario: 验证端口监听
**Given** 应用容器已启动
**When** 执行 `netstat -tlnp | grep 8080`
**Then** 显示 8080 端口正在监听
**And** 绑定到 0.0.0.0

#### Scenario: 测试应用访问
**Given** 应用端口已监听
**When** 执行 `curl http://localhost:8080/api/health`
**Then** 返回健康检查响应
**And** HTTP 状态码为 200

#### Scenario: 配置防火墙规则
**Given** 云服务器防火墙已启用
**When** 添加 8080 端口到允许列表
**Then** 外部可以访问应用服务
**And** 其他端口保持关闭

---

### Requirement: 环境变量安全
部署者 MUST 安全管理敏感配置信息， SHALL 避免在命令历史中暴露明文密码。

#### Scenario: 使用环境变量文件
**Given** 需要传递多个环境变量
**When** 创建 .env 文件并使用 --env-file
**Then** 所有环境变量从文件读取
**And** 命令历史不包含敏感信息

#### Scenario: 验证配置生效
**Given** 容器使用环境变量启动
**When** 在容器内执行 env 命令
**Then** 显示所有注入的环境变量
**And** 数据库密码等敏感配置正确

---

### Requirement: 部署文档完整性
项目 MUST 提供完整的部署文档， SHALL 包含所有必需的命令和故障排查指南。

#### Scenario: 快速开始指南
**Given** 开发者首次部署
**When** 阅读部署文档快速开始部分
**Then** 可以按顺序执行命令完成部署
**And** 理解每个命令的作用

#### Scenario: 故障排查指南
**Given** 部署过程中遇到问题
**When** 查阅故障排查部分
**Then** 找到对应问题的解决方案
**And** 可以按步骤进行诊断

#### Scenario: 命令参考
**Given** 需要执行特定管理操作
**When** 查阅命令参考部分
**Then** 找到所需命令的完整语法
**And** 包含命令参数说明

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

