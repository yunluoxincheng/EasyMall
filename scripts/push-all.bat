@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set IMAGE_PREFIX=yunluoxincheng

echo ========== 构建并推送全部镜像 ==========

echo.
echo ^>^>^> 构建后端镜像...
docker build -t "%IMAGE_PREFIX%/easymall-backend:latest" "%~dp0..\easymall-backend"
if errorlevel 1 goto :error

echo.
echo ^>^>^> 推送后端镜像...
docker push "%IMAGE_PREFIX%/easymall-backend:latest"
if errorlevel 1 goto :error

echo.
echo ^>^>^> 构建前端镜像...
docker build -t "%IMAGE_PREFIX%/easymall-frontend:latest" "%~dp0..\easymall-frontend"
if errorlevel 1 goto :error

echo.
echo ^>^>^> 推送前端镜像...
docker push "%IMAGE_PREFIX%/easymall-frontend:latest"
if errorlevel 1 goto :error

echo.
echo ========== 全部镜像构建并推送完成 ==========
docker images "%IMAGE_PREFIX%/easymall-*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
goto :eof

:error
echo.
echo ========== 构建或推送失败 ==========
exit /b 1
