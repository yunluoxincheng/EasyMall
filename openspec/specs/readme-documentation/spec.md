# readme-documentation Specification

## Purpose
TBD - created by archiving change update-readme-docs. Update Purpose after archive.
## Requirements
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

README 中的"待完善功能"部分 SHALL 移除已实现的图片上传功能，并准确反映当前的开发状态。

#### Scenario: 用户查看待开发功能
- **WHEN** 用户打开 README.md 文件并查看"待完善功能"部分
- **THEN** 不应包含"商品图片上传（MinIO）"（已使用本地存储实现）
- **AND** 可以保留其他未实现功能（如支付接口集成、会员生日礼包自动发放等）

---

### Requirement: 数据库迁移脚本文档
README SHALL 说明数据库迁移脚本的版本和内容。

#### Scenario: 用户查看数据库初始化
- **WHEN** 用户查看"安装步骤"中的数据库配置部分
- **THEN** 应该说明数据库会自动执行 V1-V4 迁移脚本
- **AND** 应该说明 V4 添加了全文索引
- **AND** 应该说明所有表使用 utf8mb4 字符集

---

### Requirement: 图片上传功能文档说明

README SHALL 包含图片上传功能的说明，包括技术实现方式和功能特性。

#### Scenario: 查看技术栈中的文件存储说明
- **WHEN** 用户查看"技术栈"部分
- **THEN** 应该看到"本地文件存储"或类似说明
- **AND** 应该说明支持商品图片和用户头像上传
- **AND** 可以提到文件验证、大小限制等安全机制

#### Scenario: 查看商品模块中的图片上传功能
- **WHEN** 用户查看"商品与分类模块"部分
- **THEN** 应该包含商品图片上传功能说明
- **AND** 应该说明支持单图/多图上传
- **AND** 应该说明支持文件类型验证和大小限制

#### Scenario: 查看用户模块中的头像上传功能
- **WHEN** 用户查看"用户与会员模块"部分
- **THEN** 应该包含用户头像上传功能说明
- **AND** 应该说明支持个人头像更换

---

### Requirement: 图片上传文档引用

README SHALL 提供图片上传功能详细文档的引用链接。

#### Scenario: 查找图片上传使用指南
- **WHEN** 用户在 README 中查找图片上传相关文档
- **THEN** 应该看到指向 `docs/image-upload-guide.md` 的链接
- **AND** 链接描述应该清晰（如"图片上传使用指南"或类似文字）

---

### Requirement: 部署配置中包含图片存储说明

README 中的部署说明 SHALL 包含图片存储目录的配置要求。

#### Scenario: 查看本地部署的图片存储配置
- **WHEN** 用户查看"本地部署"部分
- **THEN** 应该说明需要创建图片存储目录
- **AND** 应该提供目录权限设置建议

#### Scenario: 查看 Docker 部署的 volume 挂载
- **WHEN** 用户查看"Docker 部署"部分
- **THEN** 应该说明 uploads 目录的 volume 挂载配置
- **AND** 应该说明挂载路径（如 `./uploads:/data/easymall/uploads`）

#### Scenario: 查看云服务器部署的 Nginx 配置
- **WHEN** 用户查看云服务器部署文档
- **THEN** 应该说明 Nginx 静态文件服务配置
- **AND** 应该提供 `/uploads/` 路径的 location 配置示例

