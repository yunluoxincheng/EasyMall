@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set IMAGE=yunluoxincheng/easymall-backend:latest

echo ========== 构建并推送后端镜像 ==========

echo.
echo ^>^>^> 构建后端镜像...
docker build -t "%IMAGE%" "%~dp0..\easymall-backend"
if errorlevel 1 goto :error

echo.
echo ^>^>^> 推送后端镜像...
docker push "%IMAGE%"
if errorlevel 1 goto :error

echo.
echo ========== 完成 ==========
docker images "%IMAGE%" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
goto :eof

:error
echo.
echo ========== 构建或推送失败 ==========
exit /b 1
