#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

IMAGE="yunluoxincheng/easymall-backend:latest"

echo "========== 构建并推送后端镜像 =========="

echo ""
echo ">>> 构建后端镜像..."
docker build -t "${IMAGE}" "${PROJECT_DIR}/easymall-backend"

echo ""
echo ">>> 推送后端镜像..."
docker push "${IMAGE}"

echo ""
echo "========== 完成 =========="
docker images "${IMAGE}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
