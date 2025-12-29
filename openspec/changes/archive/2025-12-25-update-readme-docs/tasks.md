# 任务清单: 更新 README 项目文档

## 任务列表

### 1. 更新技术栈部分

**目标**: 反映项目当前使用的技术

**变更内容**:
- 移除 Elasticsearch 引用
- 添加 MySQL FULLTEXT 全文索引说明
- 更新 Redis 配置说明（Spring Boot 4.x 兼容）

**验证**: 技术栈列表与 pom.xml 一致

---

### 2. 更新功能模块 - 后台管理

**目标**: 将后台管理模块从"待完善"改为已完成

**变更内容**:
- 移除"待完善"标记
- 添加完整功能列表:
  - 商品管理（新增、修改、删除、上下架、库存管理）
  - 订单管理（订单列表、订单详情、状态修改、取消订单）
  - 用户管理（用户列表、用户详情、状态管理、角色管理、积分调整）
  - 评论审核（评论列表、审核通过/拒绝、商家回复、删除评论）
  - 会员等级管理（等级配置、新增/修改/删除等级、状态管理）
  - 分类管理（分类列表、新增/修改/删除分类、状态管理）
  - 积分兑换商品管理（兑换商品列表、新增/修改/删除、上下架、库存管理）

**验证**: 功能列表与 admin 包下的 Controller 一致

---

### 3. 更新商品与分类模块 - 搜索功能

**目标**: 反映当前搜索实现

**变更内容**:
- 将"基于 MySQL 模糊查询"改为"基于 MySQL FULLTEXT 全文索引 + Redis 缓存"
- 添加性能优化说明:
  - 商品搜索使用 MySQL 全文索引（FULLTEXT）+ Redis 缓存（5分钟过期）
  - 支持 LIKE 模糊搜索和全文搜索两种方式，按相关性排序
  - 热门商品和新品推荐使用 Redis 缓存
  - 商品信息变更时自动清除相关缓存

**验证**: 描述与 ProductMapper.xml 和 ProductServiceImpl 一致

---

### 4. 更新项目结构

**目标**: 添加新增的包和类

**变更内容**:
```
src/main/java/org/ruikun/
├── config          # 配置类
│   └── RedisConfig.java    # Redis 配置（Spring Boot 4.x 兼容）
├── controller
│   └── admin       # 后台管理控制器
│       ├── AdminProductController.java
│       ├── AdminOrderController.java
│       ├── AdminUserController.java
│       ├── AdminCommentController.java
│       ├── AdminMemberLevelController.java
│       ├── AdminCategoryController.java
│       └── AdminPointsProductController.java
```

**验证**: 目录结构实际存在

---

### 5. 更新 Docker 开发环境说明

**目标**: 完善开发模式特性说明

**变更内容**:
- 添加代码热重载详细说明
- 添加卷挂载开发说明
- 更新服务配置说明

**验证**: 说明与 docker-compose.yml 和 docker-dev.yml 一致

---

### 6. 更新 API 接口文档部分

**目标**: 引用完整的 API 文档

**变更内容**:
- 添加 "详细 API 文档请查看: [docs/API.md](docs/API.md)"
- 添加后台管理接口列表引用

**验证**: 链接有效

---

### 7. 更新待完善功能列表

**目标**: 移除已完成功能，添加实际待开发项

**变更内容**:
- 移除:
  - ~~后台管理模块（完整实现）~~
  - ~~商品图片上传（MinIO）~~
- 添加或保留:
  - 支付接口集成（支付宝/微信支付）
  - 优惠券功能
  - 会员生日礼包自动发放
  - 积分有效期管理
  - 会员专属活动

**验证**: 列表反映实际待开发状态

---

### 8. 更新数据库初始化说明

**目标**: 反映最新的迁移脚本

**变更内容**:
- 更新迁移脚本列表: V1、V2、V3、V4（全文索引）

**验证**: 与 src/main/resources/db/migration/ 目录一致

---

## 依赖关系

- 任务 1-7 可并行执行
- 所有任务完成后需要进行最终验证

## 验证清单

- [x] README.md 内容准确反映项目当前状态
- [x] 所有技术栈与 pom.xml 一致
- [x] 功能列表与代码实现一致
- [x] Docker 命令可以正常执行
- [x] API 文档链接有效
- [x] 项目结构描述准确
