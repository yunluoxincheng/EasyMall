@echo off
setlocal enabledelayedexpansion

set IMAGE=yunluoxincheng/easymall-frontend:latest

echo ========== Build and Push Frontend Image ==========

echo.
echo ^>^>^> Building frontend image...
docker build -t "%IMAGE%" "%~dp0..\easymall-frontend"
if errorlevel 1 goto :error

echo.
echo ^>^>^> Pushing frontend image...
docker push "%IMAGE%"
if errorlevel 1 goto :error

echo.
echo ========== Done ==========
docker images "%IMAGE%" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
goto :eof

:error
echo.
echo ========== Build or Push Failed ==========
exit /b 1
