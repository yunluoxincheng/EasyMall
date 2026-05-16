## ADDED Requirements

### Requirement: Cart service unit tests
系统 SHALL 为 CartService 提供单元测试，覆盖添加商品到购物车、修改数量、删除商品、批量删除、全选/取消全选、查询购物车列表等操作。

#### Scenario: Add product to cart successfully
- **WHEN** 用户添加商品到购物车且商品库存充足
- **THEN** 购物车中包含该商品且数量正确

#### Scenario: Add product to cart with insufficient stock
- **WHEN** 用户添加商品到购物车但商品库存不足
- **THEN** 抛出 BusinessException 提示库存不足

#### Scenario: Update cart item quantity
- **WHEN** 用户修改购物车商品数量
- **THEN** 购物车中该商品数量更新为指定值

#### Scenario: Remove cart item
- **WHEN** 用户删除购物车中的商品
- **THEN** 购物车中不再包含该商品

### Requirement: Favorite service unit tests
系统 SHALL 为 FavoriteService 提供单元测试，覆盖添加收藏、取消收藏、检查收藏状态、查询收藏列表、切换收藏状态等操作。

#### Scenario: Add favorite successfully
- **WHEN** 用户收藏一个未收藏的商品
- **THEN** 收藏记录创建成功

#### Scenario: Add duplicate favorite
- **WHEN** 用户重复收藏同一商品
- **THEN** 抛出 BusinessException 提示已收藏

#### Scenario: Remove favorite
- **WHEN** 用户取消收藏
- **THEN** 收藏记录被删除

### Requirement: Comment service unit tests
系统 SHALL 为 CommentService 提供单元测试，覆盖发表评论、查询评论列表、删除评论等操作。

#### Scenario: Create comment successfully
- **WHEN** 已完成订单的用户对商品发表评论
- **THEN** 评论创建成功且状态为待审核

#### Scenario: Create comment for unpaid order
- **WHEN** 未完成订单的用户尝试发表评论
- **THEN** 抛出 BusinessException 提示无法评论

### Requirement: Sign-in service unit tests
系统 SHALL 为 SignInService 提供单元测试，覆盖签到、查询今日签到状态、查询连续签到天数等操作。

#### Scenario: Daily sign-in successfully
- **WHEN** 用户当日首次签到
- **THEN** 签到成功，返回 SignInResultVO 含连续签到天数

#### Scenario: Duplicate sign-in on same day
- **WHEN** 用户重复签到
- **THEN** 抛出 BusinessException 提示今日已签到

### Requirement: User service unit tests
系统 SHALL 为 UserService 提供单元测试，覆盖用户注册、登录、查询用户信息等操作。

#### Scenario: Register with valid data
- **WHEN** 使用有效数据注册新用户
- **THEN** 用户创建成功

#### Scenario: Register with duplicate username
- **WHEN** 使用已存在的用户名注册
- **THEN** 抛出 BusinessException 提示用户名已存在

#### Scenario: Login with correct credentials
- **WHEN** 使用正确的用户名和密码登录
- **THEN** 返回 LoginVO 含 JWT token

#### Scenario: Login with wrong password
- **WHEN** 使用错误的密码登录
- **THEN** 抛出认证异常

### Requirement: Product service unit tests
系统 SHALL 为 ProductService 提供单元测试，覆盖商品分页查询、详情查询、新增、修改、删除等操作。

#### Scenario: Get product by id
- **WHEN** 查询存在的商品 ID
- **THEN** 返回 ProductVO 含商品详情

#### Scenario: Get product by non-existent id
- **WHEN** 查询不存在的商品 ID
- **THEN** 抛出 BusinessException 提示商品不存在

#### Scenario: Get product page
- **WHEN** 分页查询商品列表
- **THEN** 返回 PageResult<ProductVO>

### Requirement: Category service unit tests
系统 SHALL 为 CategoryService 提供单元测试，覆盖分类树查询、分类详情等操作。

#### Scenario: Get category tree
- **WHEN** 查询分类树
- **THEN** 返回按层级组织的分类列表

### Requirement: Controller layer MockMvc tests
系统 SHALL 为核心控制器提供 MockMvc 测试，验证 HTTP 层的路由、参数绑定、响应格式和认证鉴权。覆盖 OrderController（创建订单、查询订单、取消订单、确认收货）、ProductController（分页查询、详情、热门商品、新品）、UserController（注册、登录、用户信息）、CartController（添加购物车、查询购物车、删除商品）、PaymentController（支付、回调）。管理端控制器（AdminProductController 等）的权限测试通过 Security 层面的 401/403 场景统一覆盖。

#### Scenario: Unauthenticated access to protected endpoint
- **WHEN** 未携带 token 访问需要认证的接口
- **THEN** 返回 401 状态码

#### Scenario: User role access to admin endpoint
- **WHEN** 普通用户访问管理员接口
- **THEN** 返回 403 状态码
