@echo off
setlocal enabledelayedexpansion

set IMAGE_PREFIX=yunluoxincheng

echo ========== Build and Push All Images ==========

echo.
echo ^>^>^> Building backend image...
docker build -t "%IMAGE_PREFIX%/easymall-backend:latest" "%~dp0..\easymall-backend"
if errorlevel 1 goto :error

echo.
echo ^>^>^> Pushing backend image...
docker push "%IMAGE_PREFIX%/easymall-backend:latest"
if errorlevel 1 goto :error

echo.
echo ^>^>^> Building frontend image...
docker build -t "%IMAGE_PREFIX%/easymall-frontend:latest" "%~dp0..\easymall-frontend"
if errorlevel 1 goto :error

echo.
echo ^>^>^> Pushing frontend image...
docker push "%IMAGE_PREFIX%/easymall-frontend:latest"
if errorlevel 1 goto :error

echo.
echo ========== All Done ==========
docker images "%IMAGE_PREFIX%/easymall-*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
goto :eof

:error
echo.
echo ========== Build or Push Failed ==========
exit /b 1
