## Context
EasyMall 系统当前已有完整的用户端功能（用户注册登录、商品浏览、购物车、订单、评论、会员积分等），但缺少管理员后台管理 API。系统使用 Spring Security 进行权限控制，用户实体中包含 `role` 字段（0=普通用户，1=管理员）。`SecurityConfig` 已配置 `/api/admin/**` 路径需要 `hasRole("ADMIN")` 权限。

### 现有基础
- 实体类完整：User、Product、Order、Comment、MemberLevel、PointsProduct 等
- Mapper 层完整：使用 MyBatis Plus 进行数据库操作
- Service 层部分功能已存在：IProductService、IOrderService、IUserService 等
- 安全配置：JWT 认证 + Spring Security 权限控制

### 约束条件
- 后台管理接口必须由管理员角色访问
- 遵循现有的三层架构模式
- 复用现有的 Service 和 Mapper，避免代码重复

## Goals / Non-Goals
- Goals:
  - 提供完整的后台管理 RESTful API
  - 支持分页查询、条件筛选、批量操作
  - 统一的响应格式（Result<T>）
  - 完善的权限控制

- Non-Goals:
  - 不实现后台管理前端界面（仅提供 API）
  - 不涉及复杂的权限管理系统（仅区分普通用户和管理员）
  - 不实现操作日志功能（后续可选扩展）

## Decisions

### 1. 架构设计：新建 admin 包还是复用现有 Controller
**决策**：在 `controller` 包下创建 `admin` 子包，新增专用的 Admin Controller。

**原因**：
- 保持代码组织清晰，前后端接口分离
- 后台管理接口可能有不同的业务逻辑（如批量操作、审核流程）
- 便于后续添加后台专用功能（如数据统计、报表）

**替代方案**：在现有 Controller 中添加管理员专用方法。缺点是代码混合，不利于维护。

### 2. Service 层设计：新建 AdminService 还是复用现有 Service
**决策**：复用现有 Service，在 AdminController 中组合调用。

**原因**：
- 避免重复代码
- 保持业务逻辑统一
- 如需后台专用逻辑，可在 Controller 层处理或扩展现有 Service

**替代方案**：新建 AdminService 层。缺点是增加代码复杂度，可能导致业务逻辑分散。

### 3. DTO/VO 设计
**决策**：后台管理使用独立的 DTO 和 VO，不与用户端共用。

**原因**：
- 后台管理接口通常需要更多信息（如用户 ID、创建时间、详细状态）
- 后台管理有特殊需求（如批量操作 ID 列表、审核备注）
- 便于独立演进，不影响用户端接口

### 4. API 路径设计
**决策**：统一使用 `/api/admin/{资源}` 路径格式。

示例：
- `/api/admin/products` - 商品管理
- `/api/admin/orders` - 订单管理
- `/api/admin/users` - 用户管理
- `/api/admin/comments` - 评论管理
- `/api/admin/member-levels` - 会员等级管理
- `/api/admin/points-products` - 积分兑换商品管理

### 5. 权限控制
**决策**：依赖 Spring Security 的路径权限控制，Controller 层不再重复校验角色。

**原因**：
- `SecurityConfig` 已配置 `/api/admin/**` 需要 `hasRole("ADMIN")`
- JWT 过滤器已完成用户身份认证
- Controller 可从 `HttpServletRequest` 获取当前管理员信息

## API 接口设计概览

### 商品管理（/api/admin/products）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/admin/products | 分页查询商品列表（支持名称、分类、状态筛选） |
| GET | /api/admin/products/{id} | 获取商品详情 |
| POST | /api/admin/products | 新增商品 |
| PUT | /api/admin/products/{id} | 修改商品信息 |
| PUT | /api/admin/products/{id}/status | 修改商品状态（上架/下架） |
| PUT | /api/admin/products/{id}/stock | 修改商品库存 |
| DELETE | /api/admin/products/{id} | 删除商品（逻辑删除） |

### 订单管理（/api/admin/orders）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/admin/orders | 分页查询订单列表（支持订单号、用户、状态、时间筛选） |
| GET | /api/admin/orders/{id} | 获取订单详情（含商品明细） |
| PUT | /api/admin/orders/{id}/status | 修改订单状态（发货、完成等） |
| PUT | /api/admin/orders/{id}/cancel | 取消订单 |

### 用户管理（/api/admin/users）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/admin/users | 分页查询用户列表（支持用户名、手机号、状态筛选） |
| GET | /api/admin/users/{id} | 获取用户详情 |
| PUT | /api/admin/users/{id}/status | 修改用户状态（启用/禁用） |
| PUT | /api/admin/users/{id}/role | 修改用户角色（设为/取消管理员） |
| PUT | /api/admin/users/{id}/points | 调整用户积分 |

### 评论审核（/api/admin/comments）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/admin/comments | 分页查询评论列表（支持商品、用户、审核状态筛选） |
| GET | /api/admin/comments/{id} | 获取评论详情 |
| PUT | /api/admin/comments/{id}/approve | 审核通过评论 |
| PUT | /api/admin/comments/{id}/reject | 审核拒绝评论 |
| PUT | /api/admin/comments/{id}/reply | 商家回复评论 |
| DELETE | /api/admin/comments/{id} | 删除评论 |

### 会员等级管理（/api/admin/member-levels）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/admin/member-levels | 查询所有会员等级 |
| GET | /api/admin/member-levels/{id} | 获取会员等级详情 |
| POST | /api/admin/member-levels | 新增会员等级 |
| PUT | /api/admin/member-levels/{id} | 修改会员等级 |
| PUT | /api/admin/member-levels/{id}/status | 修改会员等级状态 |
| DELETE | /api/admin/member-levels/{id} | 删除会员等级 |

### 积分兑换商品管理（/api/admin/points-products）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/admin/points-products | 分页查询积分兑换商品列表 |
| GET | /api/admin/points-products/{id} | 获取积分兑换商品详情 |
| POST | /api/admin/points-products | 新增积分兑换商品 |
| PUT | /api/admin/points-products/{id} | 修改积分兑换商品 |
| PUT | /api/admin/points-products/{id}/status | 修改商品状态（上架/下架） |
| PUT | /api/admin/points-products/{id}/stock | 修改商品库存 |
| DELETE | /api/admin/points-products/{id} | 删除积分兑换商品 |

## Risks / Trade-offs
- **风险**：管理员权限接口如果实现不当，可能被恶意调用导致数据泄露或损坏
  - **缓解**：严格依赖 Spring Security 权限控制，所有接口必须有 JWT 认证

- **权衡**：是否在 Service 层新增后台专用方法
  - **决策**：优先复用现有方法，如需要后台专用逻辑，可扩展现有 Service

## Migration Plan
无需数据迁移，纯新增功能。

## Open Questions
- 暂无
