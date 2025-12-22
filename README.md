# EasyMall B2C电子商城系统

## 项目简介

EasyMall是一个基于Spring Boot开发的B2C电子商城系统，采用前后端分离架构，提供商品展示、购物车、订单管理、用户管理等功能。

## 技术栈

- 后端框架：Spring Boot 4.0.1
- 数据库：MySQL 8
- 缓存：Redis
- 搜索引擎：Elasticsearch（待完善）
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

### 2. 商品与分类模块
- 商品分类管理（支持多级分类）
- 商品信息展示
- 商品搜索（基于Elasticsearch，待完善）
- 热门商品、新品推荐

### 3. 购物车模块
- 添加商品至购物车
- 修改商品数量
- 删除购物车商品
- 商品选择/取消选择

### 4. 订单管理模块
- 创建订单
- 订单支付
- 查看历史订单
- 订单状态流转（待支付→已支付→已发货→已完成）

### 5. 后台管理模块（待完善）
- 管理员登录
- 商品管理
- 订单管理
- 用户管理

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

## API接口文档

### 用户模块
- POST /api/user/login - 用户登录
- POST /api/user/register - 用户注册
- GET /api/user/info - 获取用户信息
- PUT /api/user/info - 更新用户信息
- PUT /api/user/password - 修改密码
- POST /api/user/logout - 退出登录

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

### 购物车模块
- GET /api/cart/list - 获取购物车列表
- GET /api/cart/count - 获取购物车商品数量
- POST /api/cart/add - 添加商品至购物车
- PUT /api/cart/{cartId} - 更新购物车商品
- DELETE /api/cart/{cartId} - 删除购物车商品
- DELETE /api/cart/batch - 批量删除购物车商品
- PUT /api/cart/selectAll/{selected} - 全选/取消全选

### 订单模块
- POST /api/order/create - 创建订单
- GET /api/order/page - 订单列表
- GET /api/order/{orderId} - 订单详情
- PUT /api/order/{orderId}/cancel - 取消订单
- PUT /api/order/{orderId}/pay - 支付订单
- PUT /api/order/{orderId}/confirm - 确认收货

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

- [ ] 评论与收藏模块
- [ ] 后台管理模块（完整实现）
- [ ] Elasticsearch搜索集成
- [ ] 商品图片上传（MinIO）
- [ ] 积分等级系统
- [ ] 优惠券功能
- [ ] 支付宝/微信支付集成

## 贡献指南

欢迎提交Issue和Pull Request来帮助完善项目。

## 许可证

本项目采用 MIT 许可证。