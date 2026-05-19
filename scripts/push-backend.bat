@echo off
setlocal enabledelayedexpansion

set IMAGE=yunluoxincheng/easymall-backend:latest

echo ========== Build and Push Backend Image ==========

echo.
echo ^>^>^> Building backend image...
docker build -t "%IMAGE%" "%~dp0..\easymall-backend"
if errorlevel 1 goto :error

echo.
echo ^>^>^> Pushing backend image...
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
