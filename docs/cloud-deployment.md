# 云服务器 Docker 命令行部署指南

本指南介绍如何在 Linux 云服务器上使用纯 Docker 命令部署 EasyMall 完整应用栈。

## 前置要求

- 服务器已安装 Docker（版本 >= 20.10）
- 服务器防火墙已开放必要端口（8080 用于应用访问）
- 有 Docker Hub 账户访问权限

---

## 快速部署概览（推荐方式）

### 一键部署脚本

将以下脚本保存为 `deploy-easymall.sh`，然后在服务器上执行：

```bash
#!/bin/bash
set -e

echo "=== EasyMall 云服务器快速部署脚本 ==="
echo ""

# 配置变量
MYSQL_PASSWORD="123456"
IMAGE_TAG="latest"

# 1. 创建图片存储目录
echo "步骤 1: 创建图片存储目录..."
mkdir -p /root/EasyMall/uploads/products
mkdir -p /root/EasyMall/uploads/avatars
chmod 755 /root/EasyMall/uploads
echo "✓ 图片存储目录创建完成"

# 2. 拉取镜像
echo ""
echo "步骤 2: 拉取 Docker 镜像..."
docker pull yunluoxincheng/easymall:$IMAGE_TAG
docker pull yunluoxincheng/easymall-mysql:init
docker pull redis:7-alpine
echo "✓ 镜像拉取完成"

# 3. 创建网络
echo ""
echo "步骤 3: 创建 Docker 网络..."
docker network create easymall-net 2>/dev/null || echo "网络已存在"
echo "✓ 网络创建完成"

# 4. 启动 MySQL
echo ""
echo "步骤 4: 启动 MySQL 容器..."
docker run -d \
  --name easymall-mysql \
  --network easymall-net \
  -e MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD \
  -e MYSQL_DATABASE=easymall \
  -e TZ=Asia/Shanghai \
  yunluoxincheng/easymall-mysql:init

echo "✓ MySQL 容器已启动"
echo "等待数据库初始化（约 30 秒）..."
sleep 30

# 5. 验证数据库
echo ""
echo "步骤 5: 验证数据库初始化..."
docker exec easymall-mysql mysql -uroot -p$MYSQL_PASSWORD -e "USE easymall; SHOW TABLES;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ 数据库初始化成功"
else
    echo "✗ 数据库初始化失败"
    exit 1
fi

# 6. 启动 Redis
echo ""
echo "步骤 6: 启动 Redis 容器..."
docker run -d \
  --name easymall-redis \
  --network easymall-net \
  redis:7-alpine
echo "✓ Redis 容器已启动"

# 7. 启动应用
echo ""
echo "步骤 7: 启动应用容器..."
docker run -d \
  --name easymall-app \
  --network easymall-net \
  -p 8080:8080 \
  -v /root/EasyMall/uploads:/data/easymall/uploads \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://easymall-mysql:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC" \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=$MYSQL_PASSWORD \
  -e SPRING_DATA_REDIS_HOST=easymall-redis \
  -e SPRING_DATA_REDIS_PORT=6379 \
  yunluoxincheng/easymall:$IMAGE_TAG

echo "✓ 应用容器已启动"

# 8. 等待应用启动
echo ""
echo "等待应用启动（约 20 秒）..."
sleep 20

# 9. 验证部署
echo ""
echo "步骤 8: 验证部署..."
docker ps | grep easymall-app > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ 所有容器运行正常"
else
    echo "✗ 应用容器启动失败"
    docker logs easymall-app
    exit 1
fi

# 测试 API
curl -s http://localhost:8080/api/public/products > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ API 接口响应正常"
else
    echo "⚠ API 接口测试失败，请检查日志"
fi

echo ""
echo "=== 部署完成！ ==="
echo ""
echo "访问地址："
echo "  - HTTP: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "默认管理员账号："
echo "  - 用户名: admin"
echo "  - 密码: admin123"
echo ""
echo "常用命令："
echo "  - 查看日志: docker logs -f easymall-app"
echo "  - 查看状态: docker ps"
echo "  - 停止服务: docker stop easymall-app easymall-mysql easymall-redis"
echo "  - 启动服务: docker start easymall-mysql easymall-redis easymall-app"
```

**使用方法**：

```bash
# 在服务器上创建脚本
cat > deploy-easymall.sh << 'EOF'
# 将上面的脚本内容粘贴到这里
EOF

# 赋予执行权限
chmod +x deploy-easymall.sh

# 执行部署
./deploy-easymall.sh
```

---

### 手动部署步骤（分步详解）

如果您希望手动执行每个步骤，请参考以下详细说明。

#### 步骤 1：创建图片存储目录

```bash
# 创建上传文件存储目录
mkdir -p /root/EasyMall/uploads/products
mkdir -p /root/EasyMall/uploads/avatars

# 设置目录权限
chmod 755 /root/EasyMall/uploads

# 验证目录创建
ls -la /root/EasyMall/uploads/
```

**说明**：
- `/root/EasyMall/uploads/products` - 存储商品图片
- `/root/EasyMall/uploads/avatars` - 存储用户头像
- 应用运行时会自动在该目录下按年月创建子目录（如 `products/2024/01/`）

#### 步骤 2：拉取镜像

```bash
# 拉取应用镜像
docker pull yunluoxincheng/easymall:latest

# 拉取预初始化的 MySQL 镜像（已包含数据库结构）
docker pull yunluoxincheng/easymall-mysql:init

# 拉取 Redis 镜像
docker pull redis:7-alpine
```

#### 步骤 3：创建 Docker 网络

```bash
# 创建网络（容器间通信）
docker network create easymall-net

# 验证网络创建
docker network ls | grep easymall-net
```

#### 步骤 4：启动 MySQL 容器

```bash
docker run -d \
  --name easymall-mysql \
  --network easymall-net \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=easymall \
  -e TZ=Asia/Shanghai \
  yunluoxincheng/easymall-mysql:init
```

**等待 MySQL 初始化**：

```bash
# 等待 30-60 秒
sleep 30

# 查看日志确认初始化完成
docker logs easymall-mysql | tail -20
```

**验证数据库**：

```bash
# 查看所有表
docker exec easymall-mysql mysql -uroot -p123456 -e "USE easymall; SHOW TABLES;"

# 预期输出包含 15 个表
```

#### 步骤 5：启动 Redis 容器

```bash
docker run -d \
  --name easymall-redis \
  --network easymall-net \
  redis:7-alpine

# 验证 Redis 运行
docker ps | grep easymall-redis
```

#### 步骤 6：启动应用容器

```bash
docker run -d \
  --name easymall-app \
  --network easymall-net \
  -p 8080:8080 \
  -v /root/EasyMall/uploads:/data/easymall/uploads \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://easymall-mysql:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC" \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=123456 \
  -e SPRING_DATA_REDIS_HOST=easymall-redis \
  -e SPRING_DATA_REDIS_PORT=6379 \
  yunluoxincheng/easymall:latest
```

**参数说明**：

| 参数 | 说明 |
|------|------|
| `-d` | 后台运行 |
| `--name easymall-app` | 容器名称 |
| `--network easymall-net` | 连接到网络 |
| `-p 8080:8080` | 端口映射（主机:容器） |
| `-v /root/EasyMall/uploads:/data/easymall/uploads` | 挂载图片存储目录 |
| `-e SPRING_DATASOURCE_URL=...` | 数据库连接 URL |
| `-e SPRING_DATASOURCE_USERNAME=root` | 数据库用户名 |
| `-e SPRING_DATASOURCE_PASSWORD=123456` | 数据库密码 |
| `-e SPRING_DATA_REDIS_HOST=easymall-redis` | Redis 主机 |
| `-e SPRING_DATA_REDIS_PORT=6379` | Redis 端口 |

#### 步骤 7：验证部署

```bash
# 检查所有容器状态
docker ps

# 应该看到三个容器在运行
# easymall-app、easymall-mysql、easymall-redis

# 测试 API 接口
curl http://localhost:8080/api/public/products

# 查看应用日志
docker logs -f easymall-app
```

#### 步骤 8：配置 Nginx（可选）

如果需要通过 Nginx 提供静态文件服务，添加以下配置：

```nginx
# /etc/nginx/conf.d/easymall.conf

server {
    listen 80;
    server_name your-domain.com;

    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 图片静态文件服务
    location /uploads/ {
        alias /root/EasyMall/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";

        # 允许跨域访问（如果需要）
        add_header Access-Control-Allow-Origin *;
    }
}
```

重启 Nginx：

```bash
# 测试配置
nginx -t

# 重新加载配置
nginx -s reload
```

---

## 常用管理命令

### 查看状态

```bash
# 查看所有容器
docker ps

# 查看容器资源使用
docker stats

# 查看应用日志
docker logs -f easymall-app
```

### 启动/停止服务

```bash
# 停止所有服务
docker stop easymall-app easymall-mysql easymall-redis

# 启动所有服务（注意顺序）
docker start easymall-mysql easymall-redis easymall-app

# 重启应用
docker restart easymall-app
```

### 清理和重新部署

```bash
# 停止并删除所有容器
docker stop easymall-app easymall-mysql easymall-redis
docker rm easymall-app easymall-mysql easymall-redis

# 删除网络
docker network rm easymall-net

# 重新执行部署脚本
./deploy-easymall.sh
```

---

--

## 构建和推送应用镜像（可选）

如果你需要从源代码构建应用镜像并推送到 Docker Hub，请按以下步骤操作。

### 准备工作

1. **克隆项目源代码**
   ```bash
   git clone https://github.com/yunluoxincheng/EasyMall.git
   cd EasyMall
   ```

2. **检查 Dockerfile**
   项目根目录下应包含 `Dockerfile`，用于构建应用镜像。

3. **登录 Docker Hub**
   ```bash
   docker login
   # 输入你的 Docker Hub 用户名和密码
   ```

### 构建应用镜像

使用项目提供的 Dockerfile 构建镜像：

```bash
# 从项目根目录构建
docker build -t yunluoxincheng/easymall:latest .

# 或添加版本标签
docker build -t yunluoxincheng/easymall:v1.0.0 .
```

**构建参数说明**：

| 参数 | 说明 |
|------|------|
| `-t` | 指定镜像名称和标签 |
| `yunluoxincheng/easymall:latest` | 镜像名:标签格式 |
| `.` | Dockerfile 所在路径（`.` 表示当前目录） |

**自定义构建参数**：

```bash
# 指定 Dockerfile 路径
docker build -f /path/to/Dockerfile -t yunluoxincheng/easymall:latest .

# 添加构建参数（如果 Dockerfile 支持 ARG）
docker build --build-arg JAR_FILE=target/EasyMall.jar -t yunluoxincheng/easymall:latest .
```

### 验证镜像

```bash
# 查看本地镜像
docker images | grep easymall

# 预期输出：
# yunluoxincheng/easymall   latest   xxxxxxx   x minutes ago   xxxMB
```

### 推送到 Docker Hub

```bash
# 推送 latest 标签
docker push yunluoxincheng/easymall:latest

# 推送版本标签
docker push yunluoxincheng/easymall:v1.0.0
```

**推送进度示例**：
```
The push refers to repository [docker.io/yunluoxincheng/easymall]
xxxxxx: Pushed
xxxxxx: Pushed
xxxxxx: Pushed
latest: digest: sha256:xxxxxxxxxxxxxxxx size: xxxx
```

### 验证推送结果

```bash
# 在 Docker Hub 网站查看
# https://hub.docker.com/r/yunluoxincheng/easymall

# 或在另一台机器拉取验证
docker pull yunluoxincheng/easymall:latest
```

### 常见问题

**问题 1: 构建失败 - 找不到 Dockerfile**
```bash
# 确保在项目根目录执行
cd EasyMall
ls Dockerfile  # 确认文件存在

# 或指定 Dockerfile 路径
docker build -f /path/to/EasyMall/Dockerfile -t yunluoxincheng/easymall:latest /path/to/EasyMall
```

**问题 2: 推送失败 - 权限不足**
```bash
# 重新登录
docker logout
docker login

# 确保镜像名称前缀与你的 Docker Hub 用户名一致
# 格式: username/imagename:tag
```

**问题 3: 镜像体积过大**
```bash
# 查看镜像大小
docker images yunluoxincheng/easymall

# 使用多阶段构建减小镜像体积（已在 Dockerfile 中实现）
# 生产环境镜像通常应在 200-400MB 之间
```

**问题 4: 构建速度慢**
```bash
# 使用 Docker 构建缓存
# 确保 .dockerignore 文件存在，排除不必要的文件
cat .dockerignore

# 典型内容：
# target/
# *.log
# .git/
# .idea/
```

### 自动化构建脚本

创建一个构建脚本 `build-and-push.sh`：

```bash
#!/bin/bash
set -e

# 配置
IMAGE_NAME="yunluoxincheng/easymall"
VERSION=${1:-latest}

echo "开始构建镜像: $IMAGE_NAME:$VERSION"

# 构建镜像
docker build -t "$IMAGE_NAME:$VERSION" .

# 推送镜像
echo "推送镜像到 Docker Hub..."
docker push "$IMAGE_NAME:$VERSION"

echo "构建和推送完成！"
echo "镜像: $IMAGE_NAME:$VERSION"
```

使用方式：
```bash
chmod +x build-and-push.sh

# 使用默认 latest 标签
./build-and-push.sh

# 或指定版本号
./build-and-push.sh v1.0.0
```

---

## 快速开始

**两种部署方式：**

1. **快速部署（推荐）**: 使用预初始化 MySQL 镜像，无需手动导入 SQL 文件
2. **标准部署**: 使用官方 MySQL 镜像，需要手动导入数据库脚本

---

### 方式一：快速部署（预初始化 MySQL 镜像）

此方式使用内置数据库结构的自定义 MySQL 镜像，启动后自动完成表结构创建和初始数据导入。

#### 拉取镜像

```bash
# 拉取应用镜像
docker pull yunluoxincheng/easymall:latest

# 拉取预初始化的 MySQL 镜像（已包含数据库结构）
docker pull yunluoxincheng/easymall-mysql:init

# 拉取 Redis 镜像
docker pull redis:7-alpine
```

#### 创建网络

```bash
docker network create easymall-net
```

#### 启动 MySQL（自动初始化数据库）

```bash
docker run -d `
  --name easymall-mysql `
  --network easymall-net `
  -e MYSQL_ROOT_PASSWORD=123456 `
  -e MYSQL_DATABASE=easymall `
  -e TZ=Asia/Shanghai `
  yunluoxincheng/easymall-mysql:init
```

> **说明**: 镜像内置了所有数据库迁移脚本，容器首次启动时会自动执行，无需手动导入。

#### 等待 MySQL 初始化完成

```bash
# 等待约 30-60 秒，让 MySQL 完成初始化
# 查看日志确认初始化完成
docker logs easymall-mysql

# 当看到类似 "/docker-entrypoint-initdb.d/执行完成" 的日志表示初始化成功
```

#### 验证数据库

```bash
# 查看所有表
sudo docker exec easymall-mysql mysql -uroot -p123456 -e "USE easymall; SHOW TABLES;"

# 预期输出包含 15 个表：
# category, comment, coupon, favorite, member_level, order, order_item,
# points_exchange, points_product, points_record, product, sign_in,
# user, user_coupon
```

#### 启动 Redis 和应用

```bash
# 启动 Redis
docker run -d --name easymall-redis --network easymall-net redis:7-alpine

# 启动应用
docker run -d `
  --name easymall-app `
  --network easymall-net `
  -p 8080:8080 `
  -e SPRING_DATASOURCE_URL="jdbc:mysql://easymall-mysql:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC" `
  -e SPRING_DATASOURCE_USERNAME=root `
  -e SPRING_DATASOURCE_PASSWORD=123456 `
  -e SPRING_DATA_REDIS_HOST=easymall-redis `
  -e SPRING_DATA_REDIS_PORT=6379 `
  yunluoxincheng/easymall:latest
```

#### 验证部署

```bash
# 检查所有容器
docker ps

# 测试应用
curl http://localhost:8080/api/public/products
```

**完成！** 你的 EasyMall 应用已经成功部署。

---

### 方式二：标准部署（需要手动初始化数据库）

如果你更喜欢使用官方 MySQL 镜像并手动控制数据库初始化过程，请参考以下步骤。

### 1. 部署前准备

#### 检查 Docker 安装

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker 服务状态
docker info

# 验证 Docker 权限（非 root 用户）
docker ps
```

#### 准备环境变量

创建一个安全的环境变量文件（可选，用于避免密码出现在命令历史中）：

```bash
# 创建环境变量文件
cat > easymall.env << EOF
MYSQL_ROOT_PASSWORD=your_secure_password_here
MYSQL_DATABASE=easymall
TZ=Asia/Shanghai
EOF

# 设置文件权限（仅当前用户可读写）
chmod 600 easymall.env
```

> **安全提示**: 不要将 `easymall.env` 文件提交到版本控制系统。

### 2. 拉取镜像

从 Docker Hub 拉取所需的镜像：

```bash
# 拉取应用镜像
docker pull yunluoxincheng/easymall:latest

# 拉取 MySQL 镜像
docker pull mysql:8.0

# 拉取 Redis 镜像
docker pull redis:7-alpine

# 验证镜像已拉取成功
docker images
```

### 3. 创建 Docker 网络

创建一个专用网络使容器间可以相互通信：

```bash
# 创建网络
docker network create easymall-net

# 验证网络创建成功
docker network ls | grep easymall-net
```

### 4. 启动 MySQL 容器

```bash
# 启动 MySQL
docker run -d \
  --name easymall-mysql \
  --network easymall-net \
  -e MYSQL_ROOT_PASSWORD=your_secure_password \
  -e MYSQL_DATABASE=easymall \
  -e TZ=Asia/Shanghai \
  mysql:8.0
```

#### 等待 MySQL 就绪

MySQL 首次启动需要几秒钟初始化。等待服务就绪：

```bash
# 等待 MySQL 就绪（大约需要 10-30 秒）
docker run --rm --network easymall-net \
  mysql:8.0 mysqladmin ping -h easymall-mysql \
  -uroot -pyour_secure_password

# 当看到 "mysqld is alive" 表示 MySQL 已就绪
```

#### 数据存储说明

> **重要**: MySQL 数据存储在容器内部 `/var/lib/mysql` 目录。
>
> - 容器存在期间数据会保留
> - 删除容器后数据**将永久丢失**
> - 务必定期使用 mysqldump 备份数据（见备份恢复章节）

### 5. 初始化数据库

MySQL 容器启动后会创建空的 `easymall` 数据库，但需要导入表结构和初始数据。

#### 方法一：使用 WinSCP 上传（推荐，Windows 用户）

**步骤 1: 下载并安装 WinSCP**

1. 访问 https://winscp.net/ 下载安装
2. 安装完成后启动 WinSCP

**步骤 2: 连接到服务器**

- 主机名：`你的服务器IP`（如 8.134.192.13）
- 用户名：`root`
- 密码：你的服务器密码
- 点击"登录"

**步骤 3: 上传数据库迁移文件**

1. 在 WinSCP 左侧（本地）导航到项目目录：
   ```
   E:\clion&vs\Project1\IDEA\EasyMall\src\main\resources\db\migration
   ```

2. 在 WinSCP 右侧（远程）导航到 `/tmp` 目录

3. 将 `migration` 文件夹中的所有 `.sql` 文件拖拽到右侧 `/tmp` 目录：
   - `V1__Create_initial_tables.sql`
   - `V2__Create_member_tables.sql`
   - `V3__Create_points_exchange_tables.sql`
   - `V5__Add_coupon_tables.sql`
   - `test-data.sql`

**步骤 4: 在服务器上导入数据库**

通过 SSH 登录到服务器后执行：

```bash
# 确认文件已上传
ls -lh /tmp/*.sql

# 按顺序逐个导入数据库
cd /tmp

sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < V1__Create_initial_tables.sql
sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < V2__Create_member_tables.sql
sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < V3__Create_points_exchange_tables.sql
sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < V5__Add_coupon_tables.sql
sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < test-data.sql

# 验证导入结果
sudo docker exec easymall-mysql mysql -uroot -p123456 -e "USE easymall; SHOW TABLES;"
```

#### 方法二：使用 scp 命令上传

**步骤 1: 在 Windows 本地打包 migration 目录**

```cmd
# 进入项目目录（CMD）
cd E:\clion&vs\Project1\IDEA\EasyMall

# 使用 PowerShell 打包
Compress-Archive -Path "src\main\resources\db\migration" -DestinationPath "migration.zip"

# 或使用 Git Bash（如果有）
tar -czf migration.tar.gz src/main/resources/db/migration/
```

**步骤 2: 上传到服务器**

```cmd
# 上传压缩包
scp migration.zip root@你的服务器IP:/tmp/

# 或
scp migration.tar.gz root@你的服务器IP:/tmp/
```

**步骤 3: 在服务器上解压并导入**

```bash
# 解压文件
unzip /tmp/migration.zip -d /tmp/
# 或
tar -xzf /tmp/migration.tar.gz -C /tmp/

# 进入目录并导入
cd /tmp/src/main/resources/db/migration/

sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < V1__Create_initial_tables.sql
sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < V2__Create_member_tables.sql
sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < V3__Create_points_exchange_tables.sql
sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < V5__Add_coupon_tables.sql
sudo docker exec -i easymall-mysql mysql -uroot -p123456 easymall < test-data.sql
```

#### 方法三：逐个上传文件

如果上述方法不适用，可以逐个上传每个 SQL 文件：

```cmd
# 在 Windows 上逐个上传
scp src\main\resources\db\migration\V1__Create_initial_tables.sql root@你的服务器IP:/tmp/
scp src\main\resources\db\migration\V2__Create_member_tables.sql root@你的服务器IP:/tmp/
scp src\main\resources\db\migration\V3__Create_points_exchange_tables.sql root@你的服务器IP:/tmp/
scp src\main\resources\db\migration\V5__Add_coupon_tables.sql root@你的服务器IP:/tmp/
scp src\main\resources\db\migration\test-data.sql root@你的服务器IP:/tmp/
```

然后在服务器上执行导入命令（同方法一步骤 4）。

> **重要提示**：
> - **不要使用 Windows 的 `copy` 命令合并 SQL 文件**，这会导致编码错误
> - 始终使用原始的 SQL 文件进行导入
> - 导入顺序很重要：V1 → V2 → V3 → V5 → test-data
> - 如果密码不是 `123456`，请替换为实际密码

#### 验证数据库初始化

```bash
# 查看所有表
sudo docker exec easymall-mysql mysql -uroot -p123456 -e "USE easymall; SHOW TABLES;"

# 预期输出包含：
# category, comment, coupon, favorite, member_level, order, order_item,
# points_exchange, points_product, points_record, product, sign_in,
# user, user_coupon

# 查看数据量
sudo docker exec easymall-mysql mysql -uroot -p123456 -e "USE easymall; SELECT COUNT(*) FROM user; SELECT COUNT(*) FROM product;"

# 清理临时文件（可选）
rm /tmp/V*.sql /tmp/test-data.sql
```

### 6. 启动 Redis 容器

```bash
# 启动 Redis
docker run -d \
  --name easymall-redis \
  --network easymall-net \
  redis:7-alpine

# 验证 Redis 运行状态
docker ps | grep easymall-redis
```

### 7. 启动应用容器

```bash
# 启动 EasyMall 应用
docker run -d \
  --name easymall-app \
  --network easymall-net \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://easymall-mysql:3306/easymall?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=123456 \
  -e SPRING_DATA_REDIS_HOST=easymall-redis \
  -e SPRING_DATA_REDIS_PORT=6379 \
  yunluoxincheng/easymall:latest
```

#### 验证应用启动

```bash
# 查看应用日志
docker logs -f easymall-app

# 当看到类似 "Started EasyMallApplication in X seconds" 表示启动成功
```

### 8. 验证部署

```bash
# 检查所有容器运行状态
docker ps

# 应该看到三个容器：
# - easymall-app
# - easymall-mysql
# - easymall-redis

# 测试应用访问（如果有健康检查端点）
curl http://localhost:8080/api/health

# 或者测试 API 端点
curl http://localhost:8080/api/public/products
```

## 容器管理

### 查看容器状态

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括已停止的）
docker ps -a

# 查看容器详细信息
docker inspect easymall-app
```

### 启动/停止容器

```bash
# 停止所有服务
docker stop easymall-app easymall-mysql easymall-redis

# 启动所有服务
docker start easymall-mysql easymall-redis easymall-app

# 重启应用服务
docker restart easymall-app
```

> **注意**: 启动顺序很重要：先启动 MySQL，再启动 Redis，最后启动应用。

### 查看日志

```bash
# 实时查看应用日志
docker logs -f easymall-app

# 查看最近 100 行日志
docker logs --tail 100 easymall-app

# 查看特定时间范围的日志
docker logs --since 2024-12-29T10:00:00 easymall-app

# 查看 MySQL 日志
docker logs --tail 50 easymall-mysql

# 查看 Redis 日志
docker logs easymall-redis
```

### 进入容器

```bash
# 进入应用容器
docker exec -it easymall-app bash

# 进入 MySQL 容器并连接数据库
docker exec -it easymall-mysql mysql -uroot -p

# 进入 Redis 容器
docker exec -it easymall-redis redis-cli
```

## 数据备份与恢复

### MySQL 备份

```bash
# 备份整个数据库
docker exec easymall-mysql mysqldump -uroot -pyour_password easymall > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份并压缩
docker exec easymall-mysql mysqldump -uroot -pyour_password easymall | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### MySQL 恢复

```bash
# 从备份文件恢复
docker exec -i easymall-mysql mysql -uroot -pyour_password easymall < backup_20241229_100000.sql

# 从压缩备份恢复
gunzip -c backup_20241229_100000.sql.gz | docker exec -i easymall-mysql mysql -uroot -pyour_password easymall
```

### 定期备份建议

创建一个定时备份脚本：

```bash
#!/bin/bash
# 保存为 /path/to/backup.sh

BACKUP_DIR="/path/to/backups"
MYSQL_PASSWORD="your_password"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
docker exec easymall-mysql mysqldump -uroot -p$MYSQL_PASSWORD easymall | gzip > $BACKUP_DIR/easymall_$(date +%Y%m%d_%H%M%S).sql.gz

# 删除 7 天前的备份
find $BACKUP_DIR -name "easymall_*.sql.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/easymall_$(date +%Y%m%d_%H%M%S).sql.gz"
```

添加到 crontab（每天凌晨 2 点执行）：

```bash
# 编辑 crontab
crontab -e

# 添加以下行
0 2 * * * /path/to/backup.sh >> /path/to/backup.log 2>&1
```

## 防火墙配置

### 开放应用端口

```bash
# 如果使用 firewalld（CentOS/RHEL）
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# 如果使用 ufw（Ubuntu/Debian）
sudo ufw allow 8080/tcp

# 验证端口开放
sudo firewall-cmd --list-ports
# 或
sudo ufw status
```

### 云服务器安全组

如果使用云服务提供商（阿里云、腾讯云等），还需要在控制台配置安全组规则：
- 入站规则：允许 TCP 端口 8080

## 故障排查

### 容器启动失败

```bash
# 查看容器状态
docker ps -a

# 查看失败容器的日志
docker logs easymall-app
docker logs easymall-mysql

# 常见原因：
# - 端口已被占用
# - 环境变量配置错误
# - 镜像拉取失败
```

### 网络连接问题

```bash
# 检查网络
docker network inspect easymall-net

# 从应用容器测试数据库连接
docker exec easymall-app ping easymall-mysql

# 从应用容器测试数据库端口
docker exec easymall-app nc -zv easymall-mysql 3306
```

### 端口冲突

```bash
# 检查端口占用
netstat -tlnp | grep 8080

# 或使用 ss 命令
ss -tlnp | grep 8080

# 如果端口被占用，可以：
# 1. 停止占用端口的进程
# 2. 或使用其他端口映射，如 -p 8081:8080
```

### MySQL 容器删除后数据丢失

这是**预期行为**。数据存储在容器内部，删除容器后数据无法恢复。

解决方案：
1. 在删除容器前先备份数据
2. 使用备份文件恢复到新容器

### 应用无法连接数据库

```bash
# 检查 MySQL 是否运行
docker ps | grep easymall-mysql

# 检查网络连接
docker exec easymall-app ping easymall-mysql

# 检查环境变量
docker exec easymall-app env | grep SPRING_DATASOURCE

# 查看 MySQL 日志
docker logs easymall-mysql
```

## 健康检查

定期检查服务健康状态：

```bash
#!/bin/bash
# 保存为 health-check.sh

# 检查容器状态
echo "=== 容器状态 ==="
docker ps --filter "name=easymall-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 检查应用响应
echo -e "\n=== 应用健康检查 ==="
curl -s http://localhost:8080/api/health || echo "应用无响应"

# 检查 MySQL 连接
echo -e "\n=== MySQL 连接检查 ==="
docker exec easymall-mysql mysqladmin ping -h localhost || echo "MySQL 无响应"

# 检查 Redis 连接
echo -e "\n=== Redis 连接检查 ==="
docker exec easymall-redis redis-cli ping || echo "Redis 无响应"
```

## 清理和卸载

### 停止并删除容器

```bash
# 停止所有服务
docker stop easymall-app easymall-mysql easymall-redis

# 删除容器（数据将丢失！）
docker rm easymall-app easymall-mysql easymall-redis

# 删除网络
docker network rm easymall-net
```

### 清理镜像（可选）

```bash
# 删除项目相关镜像
docker rmi yunluoxincheng/easymall:latest mysql:8.0 redis:7-alpine

# 清理所有未使用的镜像
docker image prune -a
```

## 安全建议

1. **使用强密码**: 生产环境使用复杂的数据库密码
2. **避免密码明文**: 使用环境变量文件而非命令行参数
3. **限制端口暴露**: 不要暴露 MySQL 和 Redis 端口到公网
4. **定期备份**: 设置自动备份任务
5. **日志监控**: 定期检查日志，及时发现异常
6. **更新镜像**: 定期拉取最新镜像以获取安全补丁

## 下一步

部署完成后，可以：
1. 配置 Nginx 反向代理
2. 设置 SSL 证书（HTTPS）
3. 配置域名解析
4. 设置监控告警
5. 配置日志收集

## 参考资料

- [Docker 官方文档](https://docs.docker.com/)
- [MySQL Docker 镜像](https://hub.docker.com/_/mysql)
- [Redis Docker 镜像](https://hub.docker.com/_/redis)
