@echo off
REM EasyMall Docker 镜像构建和推送脚本 (Windows)

setlocal

set IMAGE_NAME=yunluoxincheng/easymall
set TAG=latest

echo ======================================
echo EasyMall Docker 镜像推送脚本
echo ======================================
echo.

REM 检查是否已登录 Docker Hub
echo 1. 检查 Docker Hub 登录状态...
docker info | findstr "Username: yunluoxincheng" >nul
if errorlevel 1 (
    echo    ❌ 未登录 Docker Hub
    echo.
    echo 请先登录 Docker Hub:
    echo    docker login
    echo.
    pause
    exit /b 1
)

echo    ✅ 已登录 Docker Hub
echo.

REM 重新构建镜像
echo 2. 重新构建镜像 (使用 Dockerfile.production)...
docker build -f Dockerfile.production -t %IMAGE_NAME%:%TAG% .
if errorlevel 1 (
    echo    ❌ 镜像构建失败
    pause
    exit /b 1
)
echo    ✅ 镜像构建完成
echo.

REM 推送镜像
echo 3. 推送镜像到 Docker Hub...
echo    镜像: %IMAGE_NAME%:%TAG%
echo.
docker push %IMAGE_NAME%:%TAG%
if errorlevel 1 (
    echo    ❌ 镜像推送失败
    pause
    exit /b 1
)

echo.
echo ======================================
echo ✅ 镜像推送成功!
echo ======================================
echo.
echo 镜像地址: https://hub.docker.com/r/yunluoxincheng/easymall
echo.
echo 在云服务器上拉取镜像:
echo    docker pull %IMAGE_NAME%:%TAG%
echo.

pause
