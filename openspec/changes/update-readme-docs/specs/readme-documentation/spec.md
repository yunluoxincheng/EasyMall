# 规格文档: README 项目文档

## MODIFIED Requirements

### Requirement: 技术栈文档准确性
README 中的技术栈部分 SHALL 准确反映项目当前使用的技术和版本，移除未使用的 Elasticsearch 依赖。

#### Scenario: 用户查看项目技术栈
- **WHEN** 用户打开 README.md 文件并查看"技术栈"部分
- **THEN** 应该看到 JDK 17、Spring Boot 4.0.1、MySQL 8、Redis、MyBatis Plus、Spring Security + JWT、Hutool、FastJSON2
- **AND** 不应包含 Elasticsearch（已评估移除）
- **AND** 应该包含性能优化说明（MySQL FULLTEXT 全文索引 + Redis 缓存）

#### Scenario: 查看性能优化说明
- **WHEN** 用户阅读性能优化部分
- **THEN** 应说明商品搜索使用 MySQL 全文索引（FULLTEXT）+ Redis 缓存（5分钟过期）
- **AND** 应说明支持 LIKE 模糊搜索和全文搜索两种方式
- **AND** 应说明热门商品和新品推荐使用 Redis 缓存

#### Scenario: 查看 Spring Boot 4.x 兼容性
- **WHEN** 用户查看"技术栈"部分
- **THEN** 应该说明 Redis 配置使用 JacksonJsonRedisSerializer
- **AND** 应该说明这是为了兼容 Spring Boot 4.x / Jackson 3.x

---

### Requirement: 后台管理模块文档完整性
README 中的后台管理模块部分 SHALL 反映完整实现状态，移除"待完善"标记，包含所有 7 个管理功能模块。

#### Scenario: 用户查看后台管理功能
- **WHEN** 用户打开 README.md 文件并查看"后台管理模块"部分
- **THEN** 应该看到"后台管理模块"而非"后台管理模块（待完善）"
- **AND** 应该包含商品管理、订单管理、用户管理、评论审核、会员等级管理、分类管理、积分兑换商品管理
- **AND** 每个功能应该有简要的功能点说明

#### Scenario: 查看商品管理功能说明
- **WHEN** 用户查看商品管理部分
- **THEN** 应包含商品分页查询、商品详情查询、新增/修改商品、商品上架/下架、库存管理、删除商品

#### Scenario: 查看订单管理功能说明
- **WHEN** 用户查看订单管理部分
- **THEN** 应包含订单分页查询、订单详情查询、订单状态修改、取消订单

#### Scenario: 查看用户管理功能说明
- **WHEN** 用户查看用户管理部分
- **THEN** 应包含用户分页查询、用户详情查询、用户状态启用/禁用、用户角色管理、积分调整

#### Scenario: 查看评论审核功能说明
- **WHEN** 用户查看评论审核部分
- **THEN** 应包含评论分页查询、评论详情查询、审核通过/拒绝、商家回复、删除评论

---

### Requirement: 项目结构文档完整性
README 中的项目结构部分 SHALL 包含所有主要的包和目录，包括新增的 admin 包和 RedisConfig 配置类。

#### Scenario: 用户查看项目结构
- **WHEN** 用户打开 README.md 文件并查看"项目结构"部分
- **THEN** 应包含 config 包（包含 RedisConfig.java）
- **AND** 应包含 controller 包（包含所有前端接口控制器）
- **AND** 应包含 admin 包（包含 7 个后台管理控制器）
- **AND** 应包含 mapper、service、entity/dto/vo 包
- **AND** 应包含 resources/mapper 和 resources/db/migration 目录

#### Scenario: 查看数据库迁移脚本
- **WHEN** 用户查看项目结构中的 db/migration 目录
- **THEN** 应说明包含 V1-V4 脚本
- **AND** V4 应说明是全文索引脚本

---

### Requirement: API 文档引用清晰性
README SHALL 提供完整的 API 文档引用，列出所有主要接口模块。

#### Scenario: 用户查找 API 接口文档
- **WHEN** 用户打开 README.md 文件并查看"API 接口文档"部分
- **THEN** 应该看到指向 docs/API.md 的链接
- **AND** 应该列出用户、商品、订单、购物车、评论、收藏、会员、积分、签到、积分兑换、后台管理等 11 个模块

---

### Requirement: Docker 开发环境文档完整性
README 中的 Docker 部署说明 SHALL 包含代码热重载和卷挂载开发说明。

#### Scenario: 用户使用 Docker 开发环境
- **WHEN** 用户打开 README.md 文件并查看"Docker 开发环境"部分
- **THEN** 应该看到代码热重载的详细说明
- **AND** 应该看到卷挂载说明（./src:/app/src、./pom.xml:/app/pom.xml、${HOME}/.m2:/root/.m2）
- **AND** 应该提供开发模式的启动命令 `docker-compose -f docker-compose.yml -f docker-dev.yml up`

---

### Requirement: 待完善功能列表准确性
README 中的"待完善功能"部分 SHALL 移除已完成的功能。

#### Scenario: 用户查看待开发功能
- **WHEN** 用户打开 README.md 文件并查看"待完善功能"部分
- **THEN** 不应包含"后台管理模块（完整实现）"
- **AND** 应该只包含实际待开发的功能（支付接口集成、优惠券系统、商品图片上传等）

---

## ADDED Requirements

### Requirement: 数据库迁移脚本文档
README SHALL 说明数据库迁移脚本的版本和内容。

#### Scenario: 用户查看数据库初始化
- **WHEN** 用户查看"安装步骤"中的数据库配置部分
- **THEN** 应该说明数据库会自动执行 V1-V4 迁移脚本
- **AND** 应该说明 V4 添加了全文索引
- **AND** 应该说明所有表使用 utf8mb4 字符集

---

## 相关规范

- enhanced-api-response: API 响应格式规范
- docker-dev-environment: Docker 开发环境配置
- api-documentation: API 文档规范
- admin-product-management: 后台商品管理
- admin-order-management: 后台订单管理
- admin-user-management: 后台用户管理
- admin-comment-moderation: 后台评论审核
- admin-member-level-management: 后台会员等级管理
