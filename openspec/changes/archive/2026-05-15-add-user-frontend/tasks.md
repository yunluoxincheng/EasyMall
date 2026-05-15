## 1. 基础设施：路由重构与认证

- [x] 1.1 将管理端路由迁移到 `/admin` 前缀下（router/index.ts），更新管理端布局路径
- [x] 1.2 创建用户端认证 Store（stores/userAuth.ts），管理用户 token 和登录状态，使用 `user_token` 作为 localStorage key
- [x] 1.3 更新路由守卫：管理端路由检查管理员权限，用户端路由检查用户登录状态
- [x] 1.4 改造请求拦截器（utils/request.ts）：按当前路由路径选择 token key（`/admin*` 读 `admin_token`，其余读 `user_token`），401 响应按路径分别跳转 `/admin/login` 或 `/login`
- [x] 1.5 管理端现有 `localStorage.getItem('token')` 统一迁移为 `localStorage.getItem('admin_token')`

## 2. 用户端布局

- [x] 2.1 创建 UserLayout.vue（顶部导航栏：Logo、分类导航、搜索框、购物车图标、用户菜单）
- [x] 2.2 创建 UserFooter.vue（底部 Footer）
- [x] 2.3 在导航栏实现购物车数量角标（调用购物车 count 接口）
- [x] 2.4 在导航栏实现用户菜单下拉（我的订单、个人中心、退出登录）

## 3. 用户端 API 模块与类型定义

- [x] 3.1 创建用户端 API 类型定义文件（types/user-product.ts, types/cart.ts, types/user-order.ts 等）
- [x] 3.2 创建用户端商品 API（api/user-product.ts）：分页列表、详情、热门、新品
- [x] 3.3 创建用户端分类 API（api/user-category.ts）：分类树
- [x] 3.4 创建用户端购物车 API（api/user-cart.ts）：列表、数量、添加、修改、删除、全选
- [x] 3.5 创建用户端订单 API（api/user-order.ts）：创建（含 cartIds、receiverName、receiverPhone、receiverAddress、remark、userCouponId）、分页、详情、取消、确认收货
- [x] 3.6 创建用户端支付 API（api/user-payment.ts）：/payment/{paymentNo}/pay、/payment/{paymentNo} 查询、/payment/order/{orderId} 按订单查询
- [x] 3.7 创建用户端用户 API（api/user-user.ts）：登录、注册（username、nickname、password、confirmPassword 必填；phone、email 可选）、信息、修改密码、登出
- [x] 3.8 创建用户端优惠券 API（api/user-coupon.ts）：模板列表、领取、我的优惠券、可用优惠券、计算优惠
- [x] 3.9 创建用户端收藏 API（api/user-favorite.ts）：添加、移除、检查、分页列表
- [x] 3.10 创建用户端评论 API（api/user-comment.ts）：创建、商品评论列表、我的评论、删除
- [x] 3.11 创建用户端积分 API（api/user-points.ts）：积分记录
- [x] 3.12 创建用户端积分兑换 API（api/user-points-exchange.ts）：积分商品、兑换、兑换记录
- [x] 3.13 创建用户端会员 API（api/user-member.ts）：等级列表、当前等级、折扣
- [x] 3.14 创建用户端签到 API（api/user-signin.ts）：签到、状态、连续天数

## 4. 用户注册与登录页面

- [x] 4.1 创建用户端登录页面（views/user-login/index.vue）
- [x] 4.2 创建用户端注册页面（views/user-register/index.vue）：包含用户名、昵称（必填）、密码、确认密码、手机号（可选）、邮箱（可选）
- [x] 4.3 添加用户端登录/注册路由到 router

## 5. 商品浏览页面

- [x] 5.1 创建首页（views/user-home/index.vue）：热门商品、新品推荐、分类导航
- [x] 5.2 创建商品列表页（views/user-product/ProductList.vue）：卡片网格、分类筛选、搜索、分页
- [x] 5.3 创建商品详情页（views/user-product/ProductDetail.vue）：商品信息、加入购物车、立即购买、收藏按钮、评论列表
- [x] 5.4 添加商品相关路由到 router

## 6. 购物车页面

- [x] 6.1 创建购物车页面（views/user-cart/index.vue）：商品列表、数量修改、删除、全选、总价、去结算
- [x] 6.2 添加购物车路由到 router

## 7. 订单与支付页面

- [x] 7.1 创建收货信息表单组件（components/ReceiverForm.vue）：receiverName、receiverPhone、receiverAddress 必填校验，remark 选填，供订单确认页复用
- [x] 7.2 创建订单确认页（views/user-checkout/index.vue）：待结算商品、ReceiverForm 收货信息表单、优惠券选择、金额汇总、提交订单
- [x] 7.2 创建模拟支付页（views/user-payment/index.vue）：通过 paymentNo 参数调用 /api/payment/{paymentNo} 查询支付信息，显示支付金额，确认支付调用 /api/payment/{paymentNo}/pay
- [x] 7.3 创建订单列表页（views/user-orders/OrderList.vue）：订单卡片、状态筛选、分页
- [x] 7.4 创建订单详情页（views/user-orders/OrderDetail.vue）：完整订单信息（含收货信息）、操作按钮（取消、确认收货、评价）
- [x] 7.5 添加订单相关路由到 router（支付页路由 /payment/:paymentNo）

## 8. 用户中心页面

- [x] 8.1 创建个人信息页（views/user-profile/index.vue）：查看和编辑用户信息
- [x] 8.2 创建修改密码页（views/user-profile/ChangePassword.vue）：旧密码、新密码、确认密码
- [x] 8.3 创建我的收藏页（views/user-favorites/index.vue）：收藏商品卡片列表、取消收藏、加入购物车
- [x] 8.4 创建我的评论页（views/user-comments/index.vue）：评论列表、审核状态、删除
- [x] 8.5 创建优惠券中心页（views/coupon-center/index.vue）：可领取优惠券列表、领取操作，路由 /coupons
- [x] 8.6 创建我的优惠券页（views/user-coupons/index.vue）：优惠券列表、状态筛选、"去领取"链接跳转优惠券中心
- [x] 8.7 创建积分记录页（views/user-points/index.vue）：积分余额、积分记录列表
- [x] 8.8 创建积分商品页（views/user-points/PointsProducts.vue）：积分商品列表、兑换确认，路由 /user/points/products
- [x] 8.9 创建会员中心页（views/user-member/index.vue）：当前等级、等级体系、折扣信息
- [x] 8.10 创建签到页（views/user-signin/index.vue）：签到按钮、连续天数
- [x] 8.11 添加用户中心所有路由到 router（含 /coupons 优惠券中心、/user/points/products 积分商品）

## 9. 集成验证

- [x] 9.1 验证管理端路由和页面在 `/admin` 前缀下正常工作
- [x] 9.2 验证用户端注册（含昵称必填）、登录、登出流程
- [x] 9.3 验证完整购物链路：浏览→加购→下单（填写收货信息）→支付（paymentNo 路由）→查看订单
- [x] 9.4 验证用户中心所有页面功能正常（含优惠券中心、积分商品兑换）
- [x] 9.5 验证路由守卫：未登录访问受保护页面跳转登录页
- [x] 9.6 验证用户端和管理端认证互不干扰（token 隔离、401 跳转分流）
