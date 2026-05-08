#!/bin/bash

echo "EasyMall B2C电子商城系统启动脚本"
echo "====================================="

echo "检查Java环境..."
if ! command -v java &> /dev/null; then
    echo "错误：未检测到Java环境，请先安装JDK 17"
    exit 1
fi

java -version

echo ""
echo "启动EasyMall项目..."
echo "访问地址：http://localhost:8080"
echo "默认管理员账号：admin/admin123"
echo ""

./mvnw spring-boot:run