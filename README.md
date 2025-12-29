# EasyMall B2C电子商城系统

## 项目简介

EasyMall是一个基于Spring Boot开发的B2C电子商城系统，采用前后端分离架构，提供商品展示、购物车、订单管理、用户管理等功能。系统已完整实现**会员等级体系**和**优惠券系统**，包括积分系统、会员折扣、每日签到、积分兑换、商品评论收藏、优惠券领取使用等核心功能，为用户提供完整的购物体验。

## 技术栈

- 后端框架：Spring Boot 4.0.1
- 数据库：MySQL 8
- 缓存：Redis
- ORM框架：MyBatis Plus
- 认证授权：Spring Security + JWT
- 工具类：Hutool、FastJSON2
- 构建工具：Maven

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
- 商品搜索（基于 MySQL LIKE 查询）
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

### 6. 优惠券模块
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
- **管理功能**
  - 优惠券模板管理
  - 发放/使用记录查询
  - 数据统计分析

### 7. 评论与收藏模块
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

### 8. 后台管理模块（待完善）
- 管理员登录
- 商品管理
- 订单管理
- 用户管理
- 评论管理
- 会员管理

## 项目结构

```
src/main/java/org/ruikun/
├── config          # 配置类
├── controller      # 控制层
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
└── db/migration    # 数据库初始化脚本
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
   docker-compose down

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

使用开发模式启动后，修改 `src` 目录下的代码会自动触发应用重启：

```bash
docker-compose -f docker-compose.yml -f docker-dev.yml up
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

- 表结构创建（V1、V2、V3）
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

### 用户模
- POST /api/user/login - 用户登录
- POST /api/user/register - 用户注册
- GET /api/user/info - 获取用户信息
- PUT /api/user/info - 更新用户信息
- PUT /api/user/password - 修改密码
- POST /api/user/logout - 退出登录

### 会员模块
- GET /api/member/levels - 获取所有会员等级配置
- GET /api/member/level - 获取当前用户的会员等级信息
- GET /api/member/discount - 获取会员折扣率

### 积分模块
- GET /api/points/records - 分页查询积分记录

### 签到模块
- POST /api/signin/do - 用户签到
- GET /api/signin/status - 检查今日是否已签到
- GET /api/signin/continuous - 获取连续签到天数

### 积分兑换模块
- GET /api/points/exchange/products - 获取可兑换商品列表
- POST /api/points/exchange/exchange - 兑换商品
- GET /api/points/exchange/records - 获取兑换记录
- GET /api/points/exchange/detail/{exchangeId} - 获取兑换详情

### 优惠券模块（用户端）
- GET /api/coupon/templates - 获取可领取的优惠券列表
- POST /api/coupon/receive/{templateId} - 领取优惠券
- GET /api/coupon/my - 查看我的优惠券列表
- GET /api/coupon/available - 获取可用优惠券（下单时）
- POST /api/coupon/calculate - 计算优惠金额

### 优惠券模块（管理端）
- GET /api/admin/coupon/templates - 查询优惠券模板列表
- POST /api/admin/coupon/template - 创建优惠券模板
- PUT /api/admin/coupon/template - 更新优惠券模板
- PUT /api/admin/coupon/template/{id}/status - 上下架优惠券
- DELETE /api/admin/coupon/template/{id} - 删除优惠券模板
- GET /api/admin/coupon/template/{id} - 查询优惠券模板详情
- GET /api/admin/coupon/usage-logs - 查询优惠券使用记录
- GET /api/admin/coupon/statistics - 获取优惠券统计数据

### 商品分类模块
- GET /api/category/tree - 获取分类树
- GET /api/category/{id} - 获取分类详情
- POST /api/category - 添加分类（管理员）
- PUT /api/category/{id} - 更新分类（管理员）
- DELETE /api/category/{id} - 删除分类（管理员）

### 商品模块
- GET /api/product/page - 商品分页查询
- GET /api/product/{id} - 商品详情
- GET /api/product/hot - 热门商品
- GET /api/product/new - 新品推荐
- GET /api/product/related - 相关商品
- POST /api/product - 添加商品（管理员）
- PUT /api/product/{id} - 更新商品（管理员）
- DELETE /api/product/{id} - 删除商品（管理员）

### 评论模块
- POST /api/comment/create - 创建商品评论
- GET /api/comment/product/{productId} - 获取商品评论列表
- GET /api/comment/user - 获取用户评论列表
- DELETE /api/comment/{commentId} - 删除评论
- GET /api/comment/count/{productId} - 获取商品评论数量
- GET /api/comment/rating/{productId} - 获取商品平均评分

### 收藏模块
- POST /api/favorite/add/{productId} - 添加收藏
- DELETE /api/favorite/remove/{productId} - 取消收藏
- POST /api/favorite/toggle/{productId} - 切换收藏状态
- GET /api/favorite/check/{productId} - 检查是否已收藏
- GET /api/favorite/page - 获取收藏列表

### 购物车模块
- GET /api/cart/list - 获取购物车列表
- GET /api/cart/count - 获取购物车商品数量
- POST /api/cart/add - 添加商品至购物车
- PUT /api/cart/{cartId} - 更新购物车商品
- DELETE /api/cart/{cartId} - 删除购物车商品
- DELETE /api/cart/batch - 批量删除购物车商品
- PUT /api/cart/selectAll/{selected} - 全选/取消全选

### 订单模块
- POST /api/order/create - 创建订单（自动应用会员折扣）
- GET /api/order/page - 订单列表
- GET /api/order/{orderId} - 订单详情
- PUT /api/order/{orderId}/cancel - 取消订单
- PUT /api/order/{orderId}/pay - 支付订单
- PUT /api/order/{orderId}/confirm - 确认收货（完成后自动发放积分）

## 部署说明

### 本地部署
1. 打包项目：`mvn clean package`
2. 运行jar包：`java -jar target/EasyMall-0.0.1-SNAPSHOT.jar`

### Docker部署（可选）
```bash
# 构建镜像
docker build -t easymall:latest .

# 运行容器
docker run -d -p 8080:8080 easymall:latest
```

## 待完善功能

- [ ] 后台管理模块（完整实现）
  - [ ] 商品管理界面
  - [ ] 订单管理界面
  - [ ] 用户管理界面
  - [ ] 评论审核功能
  - [ ] 会员等级配置管理
  - [ ] 积分兑换商品管理
  - [ ] 优惠券管理界面
- [ ] 商品图片上传（MinIO）
- [ ] 支付宝/微信支付集成
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