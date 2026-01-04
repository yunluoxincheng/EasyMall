# Implementation Tasks

## 1. Docker 配置验证与更新

- [x] 1.1 检查 `Dockerfile.production` 是否需要修改以支持图片上传功能
- [x] 1.2 验证 `application.yml` 中的文件上传配置是否正确
- [x] 1.3 确认 Docker 镜像中是否需要预创建上传目录

## 2. 本地镜像构建与测试

- [ ] 2.1 使用 `Dockerfile.production` 构建本地镜像
- [ ] 2.2 本地运行容器并测试图片上传功能 (使用 docker run)
- [ ] 2.3 验证 Volume 挂载是否正常工作 (`-v` 参数)
- [ ] 2.4 测试单图上传接口
- [ ] 2.5 测试多图上传接口
- [ ] 2.6 测试图片删除接口

## 3. Docker Hub 推送

- [ ] 3.1 登录 Docker Hub
- [ ] 3.2 给镜像打标签 (tag)
- [ ] 3.3 推送镜像到 Docker Hub (`yunluoxincheng/easymall:latest`)

## 4. 云服务器部署更新 (使用 docker run)

- [ ] 4.1 连接到云服务器 (8.134.192.13)
- [ ] 4.2 拉取最新镜像
- [ ] 4.3 停止并删除旧容器 (`docker stop`, `docker rm`)
- [ ] 4.4 创建或更新上传文件目录 (`mkdir -p /root/EasyMall/uploads/{products,avatars}`)
- [ ] 4.5 设置目录权限 (`chmod 755`)
- [ ] 4.6 使用 `docker run` 命令启动新容器，配置 Volume 挂载和环境变量
- [ ] 4.7 验证服务正常运行 (`docker logs`, `curl`)

## 5. Nginx 配置更新

- [ ] 5.1 更新 Nginx 配置以支持图片静态文件访问
- [ ] 5.2 配置图片缓存策略
- [ ] 5.3 添加文件类型安全限制
- [ ] 5.4 测试并重启 Nginx

## 6. 功能验证

- [ ] 6.1 测试通过 Nginx 访问上传的图片
- [ ] 6.2 测试商品管理功能中的图片上传
- [ ] 6.3 测试用户头像上传功能
- [ ] 6.4 验证图片 URL 可访问性
- [ ] 6.5 检查文件权限和目录结构
- [ ] 6.6 验证容器重启后图片文件是否保留

## 7. 文档更新

- [x] 7.1 更新 `docs/deployment-guide.md` 包含 `docker run` 命令配置
- [x] 7.2 添加 Volume 挂载说明
- [ ] 7.3 确认 `docs/image-upload-guide.md` 完整性
- [ ] 7.4 添加故障排查说明
- [ ] 7.5 添加备份和恢复说明

## 8. 创建部署脚本

- [x] 8.1 更新 `push-docker-image.bat/sh` 脚本使用 Dockerfile.production
- [x] 8.2 创建云服务器更新脚本 (使用 docker run)
- [ ] 8.3 测试脚本功能
