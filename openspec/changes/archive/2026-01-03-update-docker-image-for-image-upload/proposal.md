# Change: 更新 Docker 镜像以支持图片上传功能

## Why

项目新增了图片上传和存储功能,需要将更新后的代码打包成 Docker 镜像并推送到 Docker Hub,然后在云服务器上更新部署。**重要: 云服务器上只有 Docker,没有 docker-compose,因此需要使用 `docker run` 命令启动容器,并配置 Volume 挂载来持久化保存上传的图片。**

## What Changes

- 验证 `Dockerfile.production` 无需修改 (已包含所有必要代码)
- 使用 `docker run` 命令配置文件上传环境变量和 Volume 挂载
- 挂载本地目录 `/root/EasyMall/uploads` 到容器 `/data/easymall/uploads`
- 构建新的 Docker 镜像并推送到 Docker Hub
- 更新云服务器部署文档以包含 `docker run` 命令配置说明

## Impact

- Affected specs: `cloud-deployment-guide`, `image-upload-and-storage`
- Affected code:
  - `Dockerfile.production` (验证无需修改)
  - `src/main/java/org/ruikun/config/FileUploadProperties.java`
  - `src/main/java/org/ruikun/controller/FileUploadController.java`
  - `docs/deployment-guide.md` (更新为 docker run 命令)
  - `docs/image-upload-guide.md`

**关键变更:**
- 从 docker-compose 部署方式改为使用 `docker run` 命令
- 必须配置 Volume 挂载: `-v /root/EasyMall/uploads:/data/easymall/uploads`
- 必须配置环境变量: `-e FILE_UPLOAD_BASE_PATH` 和 `-e FILE_UPLOAD_BASE_URL`
