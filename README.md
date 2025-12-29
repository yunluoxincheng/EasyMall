# EasyMall B2C电子商城系统

## 项目简介

EasyMall是一个基于Spring Boot开发的B2C电子商城系统，采用前后端分离架构，提供商品展示、购物车、订单管理、用户管理等功能。系统已完整实现**会员等级体系**，包括积分系统、会员折扣、每日签到、积分兑换、商品评论收藏等核心功能，为用户提供完整的购物体验。

## 技术栈

- 后端框架：Spring Boot 4.0.1
- 数据库：MySQL 8
- 缓存：Redis（商品搜索结果缓存、热门/新品商品缓存、登录态缓存）
- ORM框架：MyBatis Plus
- 认证授权：Spring Security + JWT
- 工具类：Hutool、FastJSON2
- 构建工具：Maven

**性能优化**:
- 商品搜索使用 MySQL 全文索引（FULLTEXT）+ Redis 缓存（5分钟过期）
- 支持 LIKE 模糊搜索和全文搜索两种方式，按相关性排序
- 热门商品和新品推荐使用 Redis 缓存
- 商品信息变更时自动清除相关缓存

## 功能模块

### 1. 用户与会员模块
- 用户注册与登录
- JWT认证
- 个人信息管理
- 密码修改
- **会员等级系统**（5个等级：普通、铜牌、银牌、金牌、钻石）
- **会员积分系统**
  - 订单完成获得积分（每消费1元获得1积分）
  - 商品评价获得积分（每次评价获得10积分）
  - 每日签到获得积分（5-25积分）
- **会员折扣**（不同等级享受不同折扣，最高85折）
- **积分兑换**（使用积分兑换商品/优惠券）
- **每日签到**（连续签到额外奖励）

### 2. 商品与分类模块
- 商品分类管理（支持多级分类）
- 商品信息展示
- 商品搜索（基于 MySQL FULLTEXT 全文索引 + Redis 缓存）
- 热门商品、新品推荐
- **商品评价系统**（评分、评论、图片）
- **商品收藏功能**

### 3. 购物车模块
- 添加商品至购物车
- 修改商品数量
- 删除购物车商品
- 商品选择/取消选择
- **会员折扣自动应用**

### 4. 订单管理模块
- 创建订单
- **会员折扣自动计算**
- 订单支付
- 查看历史订单
- 订单状态流转（待支付→已支付→已发货→已完成）
- **订单完成后自动发放积分**

### 5. 会员积分模块
- **积分获取**
  - 订单完成：消费金额 × 1
  - 商品评价：10积分/次
  - 每日签到：5-25积分（连续签到额外奖励）
- **积分消耗**
  - 积分兑换商品
  - 积分兑换优惠券
- **积分记录**：完整的积分变动历史查询
- **会员等级**：根据积分自动升级

### 6. 评论与收藏模块
- **商品评论**
  - 评论商品（需订单完成后）
  - 评分（1-5星）
  - 上传评论图片
  - 查看商品评论列表
  - 商家回复功能
- **商品收藏**
  - 添加/取消收藏
  - 收藏列表管理
  - 收藏状态查询

### 7. 优惠券模块
- **优惠券类型**
  - 固定金额券（满减券）：满100减10
  - 百分比折扣券（折扣券）：85折优惠券
  - 新人专享券：注册自动发放
  - 会员专属券：会员升级自动发放
- **领取方式**
  - 用户主动领取（优惠券中心）
  - 积分兑换优惠券
  - 系统自动发放（新人注册、会员升级）
- **使用规则**
  - 每笔订单限用一张优惠券
  - 优惠券在会员折扣后的金额基础上计算
  - 订单取消自动返还优惠券
  - 支持使用门槛、会员等级限制、有效期等配置

### 8. 后台管理模块

#### 管理员权限
- 所有后台接口需要管理员角色（`ROLE_ADMIN`）
- 使用 `@PreAuthorize("hasRole('ADMIN')")` 注解进行权限控制

#### 商品管理
- 商品分页查询（支持名称、分类、状态筛选）
- 商品详情查询
- 新增/修改商品
- 商品上架/下架
- 库存管理
- 删除商品

#### 订单管理
- 订单分页查询（支持订单号、用户、状态筛选）
- 订单详情查询
- 订单状态修改
- 取消订单

#### 用户管理
- 用户分页查询（支持用户名、手机、状态、角色筛选）
- 用户详情查询
- 用户状态启用/禁用
- 用户角色管理
- 积分调整

#### 评论审核
- 评论分页查询（支持商品、用户、状态、评分筛选）
- 评论详情查询
- 审核通过/拒绝
- 商家回复
- 删除评论

#### 会员等级管理
- 等级配置列表
- 新增/修改/删除等级
- 等级状态管理

#### 分类管理
- 分类分页查询
- 新增/修改/删除分类
- 分类状态管理

#### 积分兑换商品管理
- 兑换商品列表
- 新增/修改/删除兑换商品
- 商品上架/下架
- 库存管理

## 项目结构

```
src/main/java/org/ruikun/
├── config          # 配置类
│   └── RedisConfig.java    # Redis 配置（Spring Boot 4.x 兼容）
├── controller      # 控制层
│   ├── UserAuthController.java   # 用户认证（登录、注册）
│   ├── ProductController.java    # 商品接口
│   ├── OrderController.java      # 订单接口
│   ├── CommentController.java    # 评论接口
│   ├── FavoriteController.java   # 收藏接口
│   ├── MemberController.java     # 会员接口
│   ├── PointsController.java     # 积分接口
│   ├── SignInController.java     # 签到接口
│   ├── PointsExchangeController.java  # 积分兑换接口
│   └── admin              # 后台管理控制器
│       ├── AdminProductController.java    # 商品管理
│       ├── AdminOrderController.java      # 订单管理
│       ├── AdminUserController.java       # 用户管理
│       ├── AdminCommentController.java    # 评论审核
│       ├── AdminMemberLevelController.java # 会员等级管理
│       ├── AdminCategoryController.java   # 分类管理
│       └── AdminPointsProductController.java # 积分兑换商品管理
├── dto             # 数据传输对象
├── entity          # 实体类
├── exception       # 异常处理
├── mapper          # 数据访问层
├── security        # 安全配置
├── service         # 业务层
│   └── impl        # 业务层实现
├── utils           # 工具类
├── vo              # 视图对象
└── common          # 公共类

src/main/resources/
├── mapper          # MyBatis映射文件
├── static          # 静态资源
├── templates       # 模板文件
├── application.yml # 应用配置
└── db/migration    # 数据库迁移脚本
    ├── V1__Create_initial_tables.sql      # 基础表结构
    ├── V2__Create_member_tables.sql       # 会员相关表
    ├── V3__Create_points_exchange_tables.sql # 积分兑换表
    ├── V4__Add_fulltext_search_index.sql  # 全文索引
    └── test-data.sql                      # 测试数据
```

## 快速开始

### 环境要求
- JDK 17
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/yunluoxincheng/EasyMall.git
   cd EasyMall
   ```

2. **配置数据库**
   - 创建数据库 `easymall`
   - 执行数据库初始化脚本：`src/main/resources/db/migration/V1__Create_initial_tables.sql`

3. **修改配置文件**
   编辑 `src/main/resources/application.yml`，修改数据库和Redis连接信息：
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/easymall?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC
       username: your_username
       password: your_password
     redis:
       host: localhost
       port: 6379
   ```

4. **启动项目**
   ```bash
   mvn spring-boot:run
   ```

5. **访问接口**
   - 接口地址：http://localhost:8080/api
   - 默认管理员账号：admin/admin123

### Docker 开发环境（推荐）

使用 Docker 可以快速搭建完整的开发环境，无需手动安装 MySQL、Redis 等依赖。

**环境要求**
- Docker Engine 20.10+
- Docker Compose 2.0+

**快速启动**

1. **启动所有服务**
   ```bash
   # 使用 docker-compose 启动（基础模式）
   docker-compose up -d

   # 或使用开发模式（启用代码热重载）
   docker-compose -f docker-compose.yml -f docker-dev.yml up -d
   ```

2. **查看服务状态**
   ```bash
   docker-compose ps
   ```

3. **查看应用日志**
   ```bash
   # 查看所有服务日志
   docker-compose logs -f

   # 仅查看应用日志
   docker-compose logs -f easymall-app
   ```

4. **停止所有服务**
   ```bash
   docker-compose stop

   # 停止并删除数据卷（清空数据库数据）
   docker-compose down -v
   ```

**服务说明**

| 服务 | 容器名 | 端口映射 | 说明 |
|------|--------|----------|------|
| EasyMall 应用 | easymall-app | 8080:8080 | Spring Boot 应用 |
| MySQL | easymall-mysql | 3306:3306 | 数据库 |
| Redis | easymall-redis | 6379:6379 | 缓存 |

**代码热重载**

开发模式支持代码热重载，修改 `src` 目录下的代码会自动触发应用重启：

1. **启动开发模式**
   ```bash
   docker-compose -f docker-compose.yml -f docker-dev.yml up -d
   ```

2. **卷挂载说明**
   - `./src:/app/src` - 源代码目录
   - `./pom.xml:/app/pom.xml` - Maven 配置文件
   - `${HOME}/.m2:/root/.m2` - Maven 仓库缓存

3. **热重载触发条件**
   - 修改 Java 源代码
   - 修改配置文件
   - 修改 pom.xml

4. **查看日志**
   ```bash
   docker-compose logs -f easymall-app
   ```

5. **手动重启**（如需要）
   ```bash
   docker-compose restart easymall-app
   ```

**环境配置**

可通过 `.env` 文件自定义配置：

```bash
# 应用端口
APP_PORT=8080

# MySQL 配置
MYSQL_PORT=3306
MYSQL_PASSWORD=123456

# Redis 配置
REDIS_PORT=6379
```

**常见问题**

1. **Maven 依赖下载缓慢**
   - 首次启动会下载依赖，请耐心等待
   - 依赖会缓存到宿主机 `~/.m2` 目录，后续启动更快

2. **端口冲突**
   - 修改 `.env` 文件中的端口配置
   - 或关闭占用端口的服务

**数据库初始化**

使用 Docker 首次启动时，数据库会自动执行初始化脚本（位于 `src/main/resources/db/migration/` 目录），包括：

- 表结构创建（V1、V2、V3、V4）
- 测试数据导入（test-data.sql）

所有表和字段均使用 **utf8mb4** 字符集，确保中文数据正常存储。

**重新初始化数据库**

如需清空数据重新初始化：

```bash
# 停止并删除所有容器和数据卷
docker-compose -f docker-compose.yml -f docker-dev.yml down -v

# 重新启动（自动初始化）
docker-compose -f docker-compose.yml -f docker-dev.yml up -d
```

## API接口文档

详细的 API 接口文档请查看: [docs/API.md](docs/API.md)

### 主要接口模块

#### 用户模块
- POST /api/user/login - 用户登录
- POST /api/user/register - 用户注册
- GET /api/user/info - 获取用户信息
- PUT /api/user/password - 修改密码

#### 商品模块
- GET /api/product/page - 商品分页查询（支持关键词搜索）
- GET /api/product/{id} - 商品详情
- GET /api/product/hot - 热门商品
- GET /api/product/new - 新品推荐

#### 订单模块
- POST /api/order/create - 创建订单（自动应用会员折扣）
- GET /api/order/page - 订单列表
- PUT /api/order/{orderId}/pay - 支付订单

#### 会员模块
- GET /api/member/level - 获取会员等级
- GET /api/member/discount - 获取会员折扣

#### 优惠券模块（用户端）
- GET /api/coupon/templates - 获取可领取的优惠券列表
- POST /api/coupon/receive/{templateId} - 领取优惠券
- GET /api/coupon/my - 查看我的优惠券列表
- GET /api/coupon/available - 获取可用优惠券（下单时）
- POST /api/coupon/calculate - 计算优惠金额

#### 优惠券模块（管理端）
- GET /api/admin/coupon/templates - 查询优惠券模板列表
- POST /api/admin/coupon/template - 创建优惠券模板
- PUT /api/admin/coupon/template - 更新优惠券模板
- PUT /api/admin/coupon/template/{id}/status - 上下架优惠券
- DELETE /api/admin/coupon/template/{id} - 删除优惠券模板
- GET /api/admin/coupon/usage-logs - 查询优惠券使用记录

#### 后台管理模块（需要管理员权限）
- GET /api/admin/products - 商品管理
- GET /api/admin/orders - 订单管理
- GET /api/admin/users - 用户管理
- GET /api/admin/comments - 评论审核
- GET /api/admin/member-levels - 会员等级管理

> 更多接口详情请查看 [docs/API.md](docs/API.md)

## 部署说明

### 本地部署
1. 打包项目：`mvn clean package`
2. 运行jar包：`java -jar target/EasyMall-0.0.1-SNAPSHOT.jar`

### Docker 部署（生产环境）

> 📘 **详细的云服务器部署指南**: 查看 [Docker 云服务器部署文档](docs/cloud-deployment.md)

项目提供多种 Docker 部署方式：

#### 方式一：快速部署（推荐）

使用预初始化的 MySQL 镜像，自动完成数据库初始化，无需手动导入 SQL 文件。

```bash
# 1. 拉取镜像
docker pull yunluoxincheng/easymall:latest
docker pull yunluoxincheng/easymall-mysql:init
docker pull redis:7-alpine

# 2. 创建网络
docker network create easymall-net

# 3. 启动 MySQL（自动初始化数据库）
docker run -d \
  --name easymall-mysql \
  --network easymall-net \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=easymall \
  -e TZ=Asia/Shanghai \
  yunluoxincheng/easymall-mysql:init

# 4. 等待 30-60 秒让数据库初始化完成

# 5. 启动 Redis
docker run -d --name easymall-redis --network easymall-net redis:7-alpine

# 6. 启动应用
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

# 7. 验证部署
curl http://localhost:8080/api/public/products
```

**特点**：
- ✅ 预初始化 MySQL 镜像，无需手动导入 SQL
- ✅ 启动即用，快速部署
- ✅ 适合云服务器部署

#### 方式二：标准部署

使用官方 MySQL 镜像，需要手动初始化数据库。

```bash
# 1. 拉取镜像
docker pull yunluoxincheng/easymall:latest
docker pull mysql:8.0
docker pull redis:7-alpine

# 2. 创建网络
docker network create easymall-net

# 3. 启动 MySQL（需手动导入数据库）
docker run -d \
  --name easymall-mysql \
  --network easymall-net \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=easymall \
  -e TZ=Asia/Shanghai \
  mysql:8.0

# 4. 手动导入数据库脚本（详见部署文档）
# 使用 WinSCP 或 scp 上传 migration 目录下的 SQL 文件

# 5-7. 同方式一
```

#### 更多部署选项

- 📘 **完整部署指南**: [docs/cloud-deployment.md](docs/cloud-deployment.md)
  - 构建和推送应用镜像
  - 快速部署（预初始化 MySQL）
  - WinSCP 图形化上传方法
  - 命令行部署详细步骤
  - 故障排查指南
  - 数据备份恢复
  - 防火墙配置

#### 构建和推送镜像

如果需要从源代码构建应用镜像：

```bash
# 1. 克隆项目
git clone https://github.com/yunluoxincheng/EasyMall.git
cd EasyMall

# 2. 登录 Docker Hub
docker login

# 3. 构建镜像
docker build -t yunluoxincheng/easymall:latest .

# 4. 推送到 Docker Hub
docker push yunluoxincheng/easymall:latest
```

详细步骤请查看：[构建和推送镜像](docs/cloud-deployment.md#构建和推送应用镜像可选)

#### 生产版 Dockerfile 特点

| 特性 | 说明 |
|------|------|
| 多阶段构建 | 构建和运行分离，最终镜像只包含 JRE 和 jar 包 |
| 镜像体积 | 使用 Alpine 基础镜像，体积更小 |
| 安全性 | 使用非 root 用户运行应用 |
| 时区设置 | 预设为上海时区 |
| JVM 优化 | 支持通过环境变量自定义 JVM 参数 |

## 待完善功能

- [ ] 支付接口集成（支付宝/微信支付）
- [ ] 商品图片上传（MinIO）
- [ ] 会员生日礼包自动发放
- [ ] 积分有效期管理
- [ ] 会员专属活动

## 会员等级与权益说明

### 会员等级

| 等级 | 名称 | 积分范围 | 折扣 |
|------|------|----------|------|
| 1 | 普通会员 | 0-999 | 无折扣 |
| 2 | 铜牌会员 | 1000-4999 | 98折 |
| 3 | 银牌会员 | 5000-19999 | 95折 |
| 4 | 金牌会员 | 20000-49999 | 9折 |
| 5 | 钻石会员 | 50000+ | 85折 |

### 积分获取规则

| 获取方式 | 积分值 | 说明 |
|---------|-------|------|
| 订单完成 | 订单金额×1 | 每消费1元获得1积分 |
| 商品评价 | 10积分 | 每次评价获得10积分 |
| 每日签到 | 5-25积分 | 基础5分，连续签到额外奖励 |

### 签到积分规则

- 基础积分：5积分/天
- 连续签到第3天：额外+5积分
- 连续签到第4天：额外+10积分
- 连续签到第5天：额外+15积分
- 连续签到第6天及以上：额外+20积分

### 积分兑换商品示例

- 100元优惠券 - 500积分
- 精美定制水杯 - 2000积分
- 蓝牙耳机 - 5000积分
- 智能手表 - 10000积分

## 贡献指南

欢迎提交Issue和Pull Request来帮助完善项目。

## 许可证

本项目采用 MIT 许可证。