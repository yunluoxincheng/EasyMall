#!/bin/bash

# EasyMall Docker 镜像构建和推送脚本

set -e

IMAGE_NAME="yunluoxincheng/easymall"
TAG="latest"

echo "======================================"
echo "EasyMall Docker 镜像推送脚本"
echo "======================================"
echo ""

# 检查是否已登录 Docker Hub
echo "1. 检查 Docker Hub 登录状态..."
if ! docker info | grep -q "Username: yunluoxincheng"; then
    echo "   ❌ 未登录 Docker Hub"
    echo ""
    echo "请先登录 Docker Hub:"
    echo "   docker login"
    echo ""
    echo "或者使用非交互式登录:"
    echo "   echo \"YOUR_PASSWORD\" | docker login -u yunluoxincheng --password-stdin"
    echo ""
    exit 1
fi

echo "   ✅ 已登录 Docker Hub"
echo ""

# 重新构建镜像
echo "2. 重新构建镜像 (使用 Dockerfile.production)..."
docker build -f Dockerfile.production -t ${IMAGE_NAME}:${TAG} .
echo "   ✅ 镜像构建完成"
echo ""

# 推送镜像
echo "3. 推送镜像到 Docker Hub..."
echo "   镜像: ${IMAGE_NAME}:${TAG}"
echo ""
docker push ${IMAGE_NAME}:${TAG}

echo ""
echo "======================================"
echo "✅ 镜像推送成功!"
echo "======================================"
echo ""
echo "镜像地址: https://hub.docker.com/r/yunluoxincheng/easymall"
echo ""
echo "在云服务器上拉取镜像:"
echo "   docker pull ${IMAGE_NAME}:${TAG}"
echo ""
