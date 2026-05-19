#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

IMAGE="yunluoxincheng/easymall-frontend:latest"

echo "========== 构建并推送前端镜像 =========="

echo ""
echo ">>> 构建前端镜像..."
docker build -t "${IMAGE}" "${PROJECT_DIR}/easymall-frontend"

echo ""
echo ">>> 推送前端镜像..."
docker push "${IMAGE}"

echo ""
echo "========== 完成 =========="
docker images "${IMAGE}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
