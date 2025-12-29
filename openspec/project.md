# Project Context

## Purpose
EasyMall 是一个基于 B2C 模式的电子商城系统，面向普通消费者提供商品展示、购物、下单及订单管理等功能。项目采用前后端分离架构，后端负责业务逻辑处理、数据持久化与接口服务。

## Tech Stack
- JDK 17
- Spring Boot 4.0.1
- Spring MVC + RESTful API
- Spring Security + JWT 认证
- MyBatis Plus
- MySQL 8（数据库 + 搜索）
- Redis（缓存）

## Project Conventions

### Code Style
- 使用 Lombok 简化实体类代码
- 统一使用 Result<T> 封装 API 响应
- Controller 层使用 `@RequiredArgsConstructor` 进行依赖注入
- 实体类使用 `@TableName` 映射数据库表
- 时间类型统一使用 `LocalDateTime`

### Architecture Patterns
三层架构：
- Controller 层：接收请求、参数校验、返回响应
- Service 层：业务逻辑处理
- Mapper 层：数据库访问（MyBatis Plus）

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
- MemberLevel：会员等级配置
- PointsProduct：积分兑换商品
- PointsExchange：积分兑换记录

## Important Constraints
- 后台管理接口仅管理员角色可访问（`/api/admin/**` 需要 `hasRole("ADMIN")`）
- 使用 JWT 进行用户身份认证
- 敏感操作需要验证用户权限

## External Dependencies
- Redis：存储登录态、缓存热点数据
- MinIO：商品图片对象存储（可选）
