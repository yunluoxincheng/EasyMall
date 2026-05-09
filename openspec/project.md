# Project Context

## Purpose
EasyMall 是一个基于 B2C 模式的电子商城系统，面向普通消费者提供商品展示、购物、下单及订单管理等功能。项目采用前后端分离架构，后端负责业务逻辑处理、数据持久化与接口服务。

## Tech Stack
- JDK 17
- Spring Boot 4.0.1
- Spring MVC + RESTful API
- Spring Security + JWT 认证
- MyBatis Plus
- MySQL 8（数据库 + FULLTEXT 搜索）
- Redis（缓存）

## Repository Layout

```
EasyMall/
├── easymall-backend/         # Spring Boot 后端
│   ├── src/main/java/org/ruikun/
│   │   ├── common/           # 通用类（Result, ResponseCode, ErrorDetail 等）
│   │   ├── enums/            # 共享枚举
│   │   ├── exception/        # 异常处理
│   │   ├── infrastructure/   # 基础设施（config, security, TraceIdUtil）
│   │   └── modules/          # 业务模块（模块化包结构）
│   │       ├── user/         # 用户、会员、签到、折扣
│   │       ├── product/      # 商品、分类
│   │       ├── order/        # 订单、购物车
│   │       ├── coupon/       # 优惠券
│   │       ├── points/       # 积分
│   │       ├── comment/      # 评论
│   │       ├── favorite/     # 收藏
│   │       ├── upload/       # 文件上传
│   │       └── admin/        # 后台管理
│   ├── src/main/resources/
│   │   ├── application.yml       # 基础配置
│   │   ├── application-dev.yml   # 开发环境
│   │   ├── application-prod.yml  # 生产环境
│   │   ├── mapper/               # MyBatis XML
│   │   └── db/migration/         # SQL 脚本
│   └── pom.xml
├── easymall-frontend/        # Vue 3 前端（占位）
├── docker/                   # Docker 文件（compose, Dockerfile, mysql init）
├── .env.example              # 环境变量示例
└── openspec/                 # 变更管理
```

## Project Conventions

### Code Style
- 使用 Lombok 简化实体类代码
- 统一使用 Result<T> 封装 API 响应
- Controller 层使用 `@RequiredArgsConstructor` 进行依赖注入
- 实体类使用 `@TableName` 映射数据库表
- 时间类型统一使用 `LocalDateTime`

### Architecture Patterns
模块化架构，按业务域组织：
- 每个模块包含独立的 controller、dto、entity、mapper、service、vo 子包
- Service 接口与实现类放在同一 `service/` 包中（不使用 impl 子包）
- 公共逻辑在 `common/` 和 `infrastructure/` 中
- 后台管理代码集中在 `modules/admin/`

### Configuration
- Spring Profile 分环境管理：base / dev / prod
- `application-prod.yml` 无硬编码默认值，所有敏感配置通过环境变量注入
- `@MapperScan` 显式列出所有模块 mapper 包
- `type-aliases-package` 显式列出所有模块 entity 包

### Testing Strategy
- 单元测试覆盖核心业务逻辑
- API 接口测试验证端点行为

### Git Workflow
- 主分支：master
- 提交信息：简洁描述变更内容

## Domain Context

### 用户角色
- 普通用户（role=0）：可浏览商品、下单、管理个人信息
- 管理员（role=1）：可访问后台管理接口

### 核心实体
- User：用户信息（包含积分、等级）
- Product：商品信息
- Category：商品分类
- Order/OrderItem：订单及订单明细
- Cart：购物车
- Comment：商品评论（含审核状态）
- CouponTemplate/UserCoupon/CouponUsageLog：优惠券体系
- PointsRecord/PointsProduct/PointsExchange：积分体系
- MemberLevel：会员等级配置
- Favorite：商品收藏

## Important Constraints
- 后台管理接口仅管理员角色可访问（`/api/admin/**` 需要 `hasRole("ADMIN")`）
- 使用 JWT 进行用户身份认证
- 敏感操作需要验证用户权限
- 生产环境不得包含硬编码密钥

## External Dependencies
- Redis：存储登录态、缓存热点数据
- 本地文件系统：商品图片、用户头像存储
