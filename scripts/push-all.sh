#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

IMAGE_PREFIX="yunluoxincheng"

echo "========== 构建并推送全部镜像 =========="

echo ""
echo ">>> 构建后端镜像..."
docker build -t "${IMAGE_PREFIX}/easymall-backend:latest" "${PROJECT_DIR}/easymall-backend"

echo ""
echo ">>> 推送后端镜像..."
docker push "${IMAGE_PREFIX}/easymall-backend:latest"

echo ""
echo ">>> 构建前端镜像..."
docker build -t "${IMAGE_PREFIX}/easymall-frontend:latest" "${PROJECT_DIR}/easymall-frontend"

echo ""
echo ">>> 推送前端镜像..."
docker push "${IMAGE_PREFIX}/easymall-frontend:latest"

echo ""
echo "========== 全部镜像构建并推送完成 =========="
docker images "${IMAGE_PREFIX}/easymall-*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
