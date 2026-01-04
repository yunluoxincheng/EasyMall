#!/bin/bash

# EasyMall 云服务器更新脚本
# 此脚本在云服务器上运行，用于更新 Docker 镜像并重启容器

set -e

# 配置变量
IMAGE_NAME="yunluoxincheng/easymall"
TAG="latest"
CONTAINER_NAME="easymall-app"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-your_mysql_password}"  # 请设置实际的 MySQL 密码
UPLOAD_DIR="/root/EasyMall/uploads"

echo "======================================"
echo "EasyMall 云服务器更新脚本"
echo "======================================"
echo ""

# 1. 拉取最新镜像
echo "1. 拉取最新镜像..."
docker pull ${IMAGE_NAME}:${TAG}
echo "   ✅ 镜像拉取完成"
echo ""

# 2. 停止并删除旧容器
echo "2. 停止并删除旧容器..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME}
    echo "   ✅ 旧容器已删除"
else
    echo "   ℹ️  未找到旧容器"
fi
echo ""

# 3. 创建上传目录
echo "3. 创建上传目录..."
mkdir -p ${UPLOAD_DIR}/products
mkdir -p ${UPLOAD_DIR}/avatars
chmod 755 ${UPLOAD_DIR}
echo "   ✅ 上传目录已创建"
echo ""

# 4. 启动新容器
echo "4. 启动新容器..."
docker run -d \
  --name ${CONTAINER_NAME} \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD} \
  -e SPRING_DATA_REDIS_HOST=host.docker.internal \
  -e SPRING_DATA_REDIS_PORT=6379 \
  -e FILE_UPLOAD_BASE_PATH=/data/easymall/uploads \
  -e FILE_UPLOAD_BASE_URL=http://8.134.192.13/uploads \
  -v ${UPLOAD_DIR}:/data/easymall/uploads \
  --restart unless-stopped \
  ${IMAGE_NAME}:${TAG}

echo "   ✅ 容器已启动"
echo ""

# 5. 等待应用启动
echo "5. 等待应用启动..."
sleep 10
echo ""

# 6. 验证服务状态
echo "6. 验证服务状态..."
echo "   容器状态:"
docker ps --filter "name=${CONTAINER_NAME}" --format "   - 名称: {{.Names}}\n   - 状态: {{.Status}}\n   - 端口: {{.Ports}}"
echo ""

# 7. 检查应用日志
echo "7. 应用日志 (最近 20 行):"
docker logs --tail 20 ${CONTAINER_NAME}
echo ""

# 8. 测试健康检查
echo "8. 测试健康检查..."
if curl -f -s http://localhost:8080/actuator/health > /dev/null; then
    echo "   ✅ 应用健康检查通过"
else
    echo "   ⚠️  应用健康检查失败 (可能需要更多时间启动)"
fi
echo ""

echo "======================================"
echo "✅ 更新完成!"
echo "======================================"
echo ""
echo "容器名称: ${CONTAINER_NAME}"
echo "镜像: ${IMAGE_NAME}:${TAG}"
echo ""
echo "查看日志:"
echo "   docker logs -f ${CONTAINER_NAME}"
echo ""
echo "停止容器:"
echo "   docker stop ${CONTAINER_NAME}"
echo ""
echo "重启容器:"
echo "   docker restart ${CONTAINER_NAME}"
echo ""
