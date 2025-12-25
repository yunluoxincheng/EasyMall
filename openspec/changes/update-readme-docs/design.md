# 设计文档: 更新 README 项目文档

## 文档更新策略

### 更新原则

1. **准确性优先**: 确保文档描述与实际代码完全一致
2. **简洁明了**: 保持 README 的简洁性，详细内容引用专门文档
3. **用户友好**: 提供清晰的使用说明和示例
4. **维护性**: 便于后续更新和维护

### 文档结构

README 将保持以下结构：

1. **项目简介** - 项目概述和核心特性
2. **技术栈** - 使用的技术和版本
3. **功能模块** - 核心功能列表（包括后台管理）
4. **项目结构** - 代码组织结构
5. **快速开始** - 本地运行指南
6. **Docker 开发环境** - Docker 部署指南
7. **API 接口文档** - 接口文档引用
8. **会员等级与权益** - 业务规则说明
9. **贡献指南** - 开发协作说明
10. **许可证** - 开源协议

## 关键更新点

### 1. 技术栈更新

**移除**:
- Elasticsearch（已评估不需要）

**保留**:
- Spring Boot 4.0.1
- MySQL 8（新增 FULLTEXT 全文索引说明）
- Redis（缓存、登录态）
- MyBatis Plus
- Spring Security + JWT

**更新说明**:
```markdown
**性能优化**:
- 商品搜索使用 MySQL 全文索引（FULLTEXT）+ Redis 缓存（5分钟过期）
- 支持 LIKE 模糊搜索和全文搜索两种方式，按相关性排序
- 热门商品和新品推荐使用 Redis 缓存
- 商品信息变更时自动清除相关缓存
```

### 2. 功能模块 - 后台管理

**从**:
```markdown
### 7. 后台管理模块（待完善）
- 管理员登录
- 商品管理
- 订单管理
- 用户管理
- 评论管理
- 会员管理
```

**改为**:
```markdown
### 7. 后台管理模块

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
```

### 3. 项目结构更新

**添加**:
```markdown
src/main/java/org/ruikun/
├── config          # 配置类
│   └── RedisConfig.java    # Redis 配置（Spring Boot 4.x 兼容）
├── controller
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
```

### 4. Docker 开发环境更新

**完善代码热重载说明**:
```markdown
**代码热重载**

开发模式支持代码热重载，修改 `src` 目录下的代码会自动触发应用重启：

1. **启动开发模式**
   ```bash
   docker-compose -f docker-compose.yml -f docker-dev.yml up
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
```

### 5. API 接口文档更新

**添加完整文档引用**:
```markdown
## API 接口文档

详细的 API 接口文档请查看: [docs/API.md](docs/API.md)

### 主要接口模块

#### 用户模块
- POST /api/user/register - 用户注册
- POST /api/user/login - 用户登录
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

#### 后台管理模块（需要管理员权限）
- GET /api/admin/products - 商品管理
- GET /api/admin/orders - 订单管理
- GET /api/admin/users - 用户管理
- GET /api/admin/comments - 评论审核
- GET /api/admin/member-levels - 会员等级管理

> 更多接口详情请查看 [docs/API.md](docs/API.md)
```

### 6. 待完善功能更新

**移除已完成**:
- ~~后台管理模块（完整实现）~~

**保留/添加**:
- [ ] 支付接口集成（支付宝/微信支付）
- [ ] 优惠券系统
- [ ] 商品图片上传（MinIO）
- [ ] 会员生日礼包自动发放
- [ ] 积分有效期管理
- [ ] 会员专属活动

## 文档一致性验证

更新完成后，需要验证以下一致性：

1. **pom.xml vs 技术栈**: 确保列出的技术都能在 pom.xml 中找到
2. **功能列表 vs 代码**: 确保描述的功能在 Controller 中有对应实现
3. **项目结构 vs 实际目录**: 确保描述的目录结构存在
4. **Docker 命令 vs 配置文件**: 确保命令可以正常执行

## 文档维护建议

1. **与代码同步**: 每次添加新功能时同步更新 README
2. **版本标记**: 在重要变更后更新版本号
3. **变更日志**: 考虑添加 CHANGELOG.md 记录版本变更
4. **定期审查**: 定期检查文档与代码的一致性
