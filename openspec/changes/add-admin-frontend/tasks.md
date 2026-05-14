## 1. 项目初始化

- [ ] 1.1 在 easymall-frontend/ 下初始化 Vue3 + Vite + TypeScript 项目（npm create vite@latest）
- [ ] 1.2 安装核心依赖：naive-ui、vue-router、pinia、axios
- [ ] 1.3 配置 vite.config.ts（代理 /api 到 localhost:8080）
- [ ] 1.4 配置 tsconfig.json
- [ ] 1.5 创建 src 目录结构（api/、assets/、components/、layouts/、router/、stores/、types/、utils/、views/）

## 2. 基础工具层

- [ ] 2.1 创建 utils/request.ts（Axios 实例、请求/响应拦截器、Token 自动附加、401 处理）
- [ ] 2.2 创建 types/api.ts（Result<T>、PageResult<T>、MyBatisPage<T> 等通用类型定义）
- [ ] 2.3 创建 stores/auth.ts（Pinia auth store：Token 存储、登录状态、用户角色、登出）
- [ ] 2.4 创建 router/index.ts（Vue Router 配置，含路由守卫 beforeEach）

## 3. 登录认证（admin-auth）

- [ ] 3.1 创建 api/auth.ts（登录接口封装）
- [ ] 3.2 调用 ui-ux-pro-max skill 设计登录页面
- [ ] 3.3 创建 views/login/index.vue（登录页面：用户名/密码表单、表单验证、错误提示）
- [ ] 3.4 实现登录成功后校验 role === 1：管理员存入 Token 并跳转后台首页，非管理员清除 Token 并提示"非管理员账号"
- [ ] 3.5 实现登录失败错误提示（用户名或密码错误）
- [ ] 3.6 验证：管理员可以登录并进入后台、普通用户登录被拒绝、Token 自动附加、401 自动跳转

## 4. 管理后台布局（admin-layout）

- [ ] 4.1 调用 ui-ux-pro-max skill 设计后台布局
- [ ] 4.2 创建 layouts/AdminLayout.vue（侧边栏 + 顶栏 + 主内容区，使用 Naive UI NLayout 组件）
- [ ] 4.3 实现侧边栏导航菜单（8 个管理模块 + 路由高亮）
- [ ] 4.4 实现侧边栏折叠功能
- [ ] 4.5 实现顶栏（页面标题、面包屑、登出按钮）
- [ ] 4.6 配置路由使用 AdminLayout 作为父布局

## 5. 商品管理页面（admin-product-management）

- [ ] 5.1 创建 api/product.ts（商品 CRUD 接口封装）
- [ ] 5.2 创建 types/product.ts（商品相关类型定义）
- [ ] 5.3 调用 ui-ux-pro-max skill 设计商品管理页面
- [ ] 5.4 创建 views/product/ProductList.vue（商品列表表格、分页、搜索筛选）
- [ ] 5.5 创建 views/product/ProductForm.vue（新增/编辑表单对话框、表单验证）
- [ ] 5.6 实现商品上下架切换操作
- [ ] 5.7 实现商品删除（确认对话框）
- [ ] 5.8 验证：商品列表查询、新增、编辑、上下架、删除功能正常

## 6. 分类管理页面（admin-category-management）

- [ ] 6.1 创建 api/category.ts（分类 CRUD 接口封装）
- [ ] 6.2 创建 types/category.ts（分类相关类型定义）
- [ ] 6.3 调用 ui-ux-pro-max skill 设计分类管理页面
- [ ] 6.4 创建 views/category/CategoryList.vue（分类列表表格、分页、搜索）
- [ ] 6.5 创建 views/category/CategoryForm.vue（新增/编辑表单对话框）
- [ ] 6.6 实现分类状态启用/禁用切换
- [ ] 6.7 实现分类删除（确认对话框）
- [ ] 6.8 验证：分类 CRUD、状态管理功能正常

## 7. 订单管理页面（admin-order-management）

- [ ] 7.1 创建 api/order.ts（订单查询、详情、状态变更接口封装）
- [ ] 7.2 创建 types/order.ts（订单相关类型定义，含 OrderStatus 枚举）
- [ ] 7.3 调用 ui-ux-pro-max skill 设计订单管理页面
- [ ] 7.4 创建 views/order/OrderList.vue（订单列表表格、分页、按订单号/状态筛选）
- [ ] 7.5 创建 views/order/OrderDetail.vue（订单详情抽屉/对话框：订单信息 + 明细列表）
- [ ] 7.6 实现订单发货操作（状态流转确认对话框）
- [ ] 7.7 实现取消订单操作（确认对话框）
- [ ] 7.8 验证：订单列表查询、详情查看、发货、取消功能正常

## 8. 用户管理页面（admin-user-management）

- [ ] 8.1 创建 api/user.ts（用户查询、详情、状态变更、角色管理、积分调整接口封装）
- [ ] 8.2 创建 types/user.ts（用户相关类型定义）
- [ ] 8.3 调用 ui-ux-pro-max skill 设计用户管理页面
- [ ] 8.4 创建 views/user/UserList.vue（用户列表表格、分页、多条件筛选）
- [ ] 8.5 创建 views/user/UserDetail.vue（用户详情：基本信息 + 会员等级 + 积分）
- [ ] 8.6 实现用户启用/禁用状态切换
- [ ] 8.7 实现用户角色切换
- [ ] 8.8 实现管理员调整用户积分（弹窗表单：仅积分数量，后端接口仅接受 points 参数）
- [ ] 8.9 验证：用户查询、详情、状态管理、角色切换、积分调整功能正常

## 9. 优惠券管理页面（admin-coupon-management）

- [ ] 9.1 创建 api/coupon.ts（优惠券模板 CRUD、上下架、使用日志、统计接口封装，使用 MyBatisPage<T> 处理分页）
- [ ] 9.2 创建 types/coupon.ts（优惠券相关类型定义，含 MyBatisPage 兼容类型）
- [ ] 9.3 调用 ui-ux-pro-max skill 设计优惠券管理页面
- [ ] 9.4 创建 views/coupon/CouponList.vue（优惠券模板列表表格，使用 MyBatisPage 分页）
- [ ] 9.5 创建 views/coupon/CouponForm.vue（新增/编辑表单对话框：类型、面额、门槛、有效期）
- [ ] 9.6 实现优惠券上下架切换
- [ ] 9.7 创建 views/coupon/UsageLogs.vue（使用记录列表，支持按模板/用户筛选）
- [ ] 9.8 实现优惠券统计数据展示
- [ ] 9.9 验证：优惠券模板 CRUD、上下架、使用日志、统计功能正常

## 10. 评论审核页面（admin-comment-moderation）

- [ ] 10.1 创建 api/comment.ts（评论查询、审核、回复、删除接口封装）
- [ ] 10.2 创建 types/comment.ts（评论相关类型定义）
- [ ] 10.3 调用 ui-ux-pro-max skill 设计评论审核页面
- [ ] 10.4 创建 views/comment/CommentList.vue（评论列表表格、状态筛选）
- [ ] 10.5 实现审核通过/拒绝操作
- [ ] 10.6 实现商家回复评论功能（回复输入框 + 提交）
- [ ] 10.7 实现删除评论（确认对话框）
- [ ] 10.8 验证：评论列表查询、审核、回复、删除功能正常

## 11. 会员等级管理页面（admin-member-level-management）

- [ ] 11.1 创建 api/memberLevel.ts（会员等级 CRUD 接口封装，注意后端返回全量列表非分页）
- [ ] 11.2 创建 types/memberLevel.ts（会员等级相关类型定义）
- [ ] 11.3 调用 ui-ux-pro-max skill 设计会员等级管理页面
- [ ] 11.4 创建 views/memberLevel/MemberLevelList.vue（全量列表表格 + 前端本地搜索过滤）
- [ ] 11.5 创建 views/memberLevel/MemberLevelForm.vue（新增/编辑表单对话框：level、levelName、minPoints、maxPoints、discount、icon、benefits、sortOrder）
- [ ] 11.6 实现等级启用/禁用状态切换
- [ ] 11.7 实现等级删除（确认对话框）
- [ ] 11.8 验证：会员等级 CRUD、状态管理功能正常

## 12. 积分兑换商品管理页面（admin-points-product-management）

- [ ] 12.1 创建 api/pointsProduct.ts（积分兑换商品 CRUD 接口封装）
- [ ] 12.2 创建 types/pointsProduct.ts（积分兑换商品相关类型定义）
- [ ] 12.3 调用 ui-ux-pro-max skill 设计积分兑换商品管理页面
- [ ] 12.4 创建 views/pointsProduct/PointsProductList.vue（商品列表表格、搜索）
- [ ] 12.5 创建 views/pointsProduct/PointsProductForm.vue（新增/编辑表单对话框）
- [ ] 12.6 实现积分商品上下架切换
- [ ] 12.7 实现积分商品删除（确认对话框）
- [ ] 12.8 验证：积分兑换商品 CRUD、上下架功能正常

## 13. 全局集成与验证

- [ ] 13.1 验证所有页面路由正确配置且侧边栏高亮正确
- [ ] 13.2 验证 Token 过期后自动跳转登录页
- [ ] 13.3 验证普通用户登录后被拒绝进入后台
- [ ] 13.4 验证所有页面的加载状态（loading）和错误提示
- [ ] 13.5 验证 `npm run build` 构建成功
- [ ] 13.6 验证 `npm run dev` 启动成功且代理正常
