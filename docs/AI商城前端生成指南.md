# AI 商城前端生成指南

> 适用场景：让 AI 基于已有 Spring Boot 后端接口，使用 Next.js + shadcn/ui + Tailwind CSS 生成一个完整、有真实商城氛围的商城前台项目。

---

## 1. 项目目标

请你作为一名资深电商前端架构师和 UI 设计师，根据已有后端接口，开发一个完整的 B2C 商城前台页面。

这个项目不是简单的模板页面，也不是 SaaS 官网，而是一个具备真实购物流程、真实电商业务感、可用于作品集展示的商城前端项目。

核心目标：

- 有真实商城味
- 有完整购物路径
- 有商品分类、搜索、筛选、排序
- 有首页运营模块
- 有商品详情页
- 有购物车
- 有结算页
- 有订单页
- 能接入已有 Spring Boot 后端接口
- 页面结构清晰，可维护，可扩展
- 视觉效果现代、干净、有促销氛围

---

## 2. 当前技术栈

前端技术栈：

```txt
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui
lucide-react
next/image
```

后端技术栈：

```txt
Spring Boot REST API
MySQL / PostgreSQL
Redis
JWT / Session / Token 鉴权
```

---

## 3. 总体开发原则

### 3.1 不要只做漂亮页面

不要只生成：

```txt
Hero 区
几个 Feature 卡片
几个商品卡片
简单按钮
```

这种页面看起来更像普通官网，而不是商城。

真正的商城页面应该包含：

```txt
真实商品分类
商品搜索
商品筛选
商品排序
商品价格
原价
折扣
销量
评分
库存状态
优惠券
秒杀活动
购物车状态
订单状态
地址选择
支付模拟
售后服务说明
```

### 3.2 不要做成 SaaS 官网

避免：

- 大面积留白
- 只有一个 Hero 区
- 只有 3 个 Feature
- 只有 4 个商品
- 所有卡片都过度圆角
- 大量玻璃拟态
- 过度动画
- 商品信息密度太低

商城需要一定的信息密度和运营氛围。

### 3.3 默认使用 Server Components

Next.js App Router 中默认使用 Server Components。

只有真正需要交互的组件才使用：

```tsx
"use client"
```

适合使用 Client Components 的地方：

```txt
搜索框
筛选器
排序选择器
购物车按钮
数量选择器
规格选择器
弹窗
轮播图
加入收藏按钮
地址选择器
优惠券选择器
```

不建议整个页面都加 `"use client"`。

---

## 4. 推荐目录结构

```txt
app/
├─ page.tsx                       # 商城首页
├─ loading.tsx
├─ error.tsx
├─ not-found.tsx
├─ products/
│  ├─ page.tsx                    # 商品列表页
│  └─ [id]/
│     └─ page.tsx                 # 商品详情页
├─ cart/
│  └─ page.tsx                    # 购物车
├─ checkout/
│  └─ page.tsx                    # 结算页
├─ orders/
│  ├─ page.tsx                    # 我的订单
│  └─ [id]/
│     └─ page.tsx                 # 订单详情
├─ login/
│  └─ page.tsx
├─ register/
│  └─ page.tsx
├─ profile/
│  └─ page.tsx
├─ search/
│  └─ page.tsx
```

```txt
components/
├─ layout/
│  ├─ SiteHeader.tsx
│  ├─ SiteFooter.tsx
│  ├─ CategoryNav.tsx
│  └─ MobileNav.tsx
├─ commerce/
│  ├─ ProductCard.tsx
│  ├─ ProductGrid.tsx
│  ├─ ProductFilters.tsx
│  ├─ PriceTag.tsx
│  ├─ RatingStars.tsx
│  ├─ StockBadge.tsx
│  ├─ CartItem.tsx
│  ├─ OrderStatusBadge.tsx
│  └─ CouponCard.tsx
├─ home/
│  ├─ HeroBanner.tsx
│  ├─ FlashSaleSection.tsx
│  ├─ CategorySection.tsx
│  ├─ CouponSection.tsx
│  ├─ NewArrivals.tsx
│  ├─ BestSellers.tsx
│  ├─ RecommendSection.tsx
│  └─ BrandStorySection.tsx
└─ ui/
   └─ shadcn 组件
```

```txt
lib/
├─ api/
│  ├─ client.ts
│  ├─ product.ts
│  ├─ category.ts
│  ├─ cart.ts
│  ├─ order.ts
│  ├─ user.ts
│  ├─ address.ts
│  └─ coupon.ts
├─ mock/
│  ├─ products.ts
│  ├─ categories.ts
│  ├─ coupons.ts
│  └─ orders.ts
└─ utils.ts
```

```txt
types/
├─ api.ts
├─ product.ts
├─ category.ts
├─ cart.ts
├─ order.ts
├─ user.ts
├─ address.ts
└─ coupon.ts
```

---

## 5. 页面设计要求

## 5.1 商城首页

首页是最重要的页面，必须优先做出商城味。

首页需要包含：

```txt
顶部导航栏
Logo
搜索框
分类入口
用户登录状态
购物车入口
订单入口
商品分类导航
大促销 Banner
限时秒杀区
优惠券区
新人专区
热卖商品区
新品上架区
猜你喜欢区
精选品牌区
服务保障区
页脚
```

首页视觉要求：

- 顶部搜索框要明显，像真实商城一样
- 分类导航要靠近顶部
- Banner 要有促销文案，例如：
  - 春季焕新
  - 限时满减
  - 新人专享
  - 全场低至 5 折
- 页面要有多个商品分区
- 不要只有一个商品网格
- 要突出价格、折扣、销量、优惠
- 页面整体要有运营氛围

---

## 5.2 商品卡片

商品卡片必须包含：

```txt
商品图片
商品名称
商品价格
商品原价
折扣标签
销量
评分
库存状态
加入购物车按钮
```

推荐商品卡片信息结构：

```txt
图片区域
折扣 / 热卖 / 新品标签
商品名称
简短卖点
价格
原价
评分
销量
库存状态
加入购物车按钮
```

注意：

- 商品卡片不要过度复杂
- 不要每个卡片都放 DropdownMenu、Dialog、Popover
- 商品列表页要轻量
- hover 效果使用轻量阴影即可
- 不要大量使用 `hover:scale`、`backdrop-blur`、复杂动画

---

## 5.3 商品列表页

商品列表页需要包含：

```txt
分类筛选
价格区间筛选
品牌筛选
销量排序
价格排序
新品排序
搜索关键词
分页
空状态
Loading Skeleton
错误状态
```

功能要求：

- 支持 URL Query 参数
- 支持分类筛选
- 支持关键词搜索
- 支持排序
- 支持分页
- 保持页面刷新后筛选条件不丢失

示例 Query：

```txt
/products?categoryId=1&keyword=phone&sort=price_asc&page=1&pageSize=20
```

---

## 5.4 商品详情页

商品详情页需要包含：

```txt
商品图片展示
商品名称
价格
原价
优惠标签
库存
销量
评分
规格选择
数量选择
加入购物车
立即购买
商品详情
商品参数
用户评价
推荐商品
```

详情页要体现真实购物决策流程。

---

## 5.5 购物车页面

购物车页面需要包含：

```txt
商品勾选
全选
数量修改
删除商品
商品价格
小计
优惠券
价格统计
去结算按钮
空购物车状态
```

购物车必须有真实交互感，不能只是静态列表。

---

## 5.6 结算页

结算页需要包含：

```txt
地址选择
商品清单
配送方式
优惠券选择
订单备注
价格明细
提交订单
```

价格明细建议包含：

```txt
商品总价
运费
优惠券抵扣
活动优惠
应付金额
```

---

## 5.7 订单页

订单页需要包含：

```txt
订单状态
商品信息
订单金额
下单时间
支付状态
配送状态
查看详情
取消订单
支付模拟
再次购买
```

订单状态示例：

```txt
待支付
待发货
待收货
已完成
已取消
退款中
```

---

## 6. 视觉风格要求

这个商城是面向消费者的 B2C 商城前台，不是后台管理系统，也不是企业官网。

整体氛围：

```txt
现代
干净
有促销感
有商品密度
有真实购物路径
有电商运营模块
```

可以参考：

```txt
京东
天猫
得物
小米商城
Apple Store 的产品陈列感
```

但不要直接复制任何网站。

颜色建议：

```txt
红色
橙色
黑色
灰白色
少量品牌渐变
```

页面氛围：

- 有价格吸引力
- 有促销氛围
- 有分类导航
- 有优惠券
- 有秒杀活动
- 有真实商品信息密度

避免：

```txt
不要做成 SaaS 官网
不要大面积留白
不要只有 Hero + 三个 Feature
不要只展示 4 个商品
不要使用过多玻璃拟态
不要所有元素都圆角巨大
不要过度动画
不要所有商品卡片都长得像普通 Card Demo
```

---

## 7. 后端接口接入要求

请优先读取后端接口信息。

优先使用：

```txt
Swagger / OpenAPI JSON
Controller 代码
DTO / VO 类
Entity 类
数据库表结构
示例接口返回 JSON
```

如果是 Spring Boot 项目，可以优先查找：

```txt
controller
service
dto
vo
entity
mapper
repository
```

需要识别以下资源类型：

```txt
Product
Category
CartItem
Order
OrderItem
User
Address
Coupon
Payment
```

---

## 8. API 封装要求

所有接口调用必须统一封装到 `lib/api` 目录。

不要在页面组件里直接写大量 fetch 逻辑。

推荐结构：

```txt
lib/api/client.ts        # 请求基础封装
lib/api/product.ts       # 商品接口
lib/api/category.ts      # 分类接口
lib/api/cart.ts          # 购物车接口
lib/api/order.ts         # 订单接口
lib/api/user.ts          # 用户接口
lib/api/address.ts       # 地址接口
lib/api/coupon.ts        # 优惠券接口
```

接口返回格式需要适配后端，例如：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

如果后端使用 JWT，需要在请求中统一处理 Token。

---

## 9. Mock 数据要求

如果后端暂时没有某些接口，请先根据已有 DTO 设计 Mock 数据。

要求：

- Mock 数据放到 `lib/mock` 目录
- Mock 数据结构必须和未来后端 DTO 保持一致
- 页面必须能运行
- 后续接口完成后，只替换 `lib/api` 中的请求方法
- 不要大改页面组件

Mock 数据至少包含：

```txt
商品数据
分类数据
优惠券数据
购物车数据
订单数据
地址数据
```

---

## 10. 性能要求

商城页面容易因为商品数量、图片和动画导致卡顿。

必须遵守：

```txt
使用 next/image
商品列表不要一次性渲染过多商品
首页精选商品控制在合理数量
商品列表页使用分页或无限滚动
列表项不要使用过多复杂动画
不要在每个商品卡片里使用复杂交互组件
默认使用 Server Components
只有必要交互组件才使用 Client Components
```

图片要求：

```txt
商品列表图控制在 300px ~ 500px
详情图可以使用更高清图片
优先使用 webp / avif
使用 loading="lazy"
```

---

## 11. 分阶段执行计划

不要一次性生成整个项目的大量代码。

请按阶段开发，每个阶段完成后保证项目可以运行。

### 第一阶段：读取后端接口

任务：

```txt
阅读后端 Controller
阅读 DTO / VO / Entity
总结已有接口
总结数据模型
确认接口返回格式
确认鉴权方式
```

输出：

```txt
接口清单
数据模型清单
前端类型定义方案
API Client 方案
```

---

### 第二阶段：生成类型和 API Client

任务：

```txt
创建 types 目录
创建 lib/api 目录
封装请求 client
生成 Product / Category / Cart / Order 等类型
生成对应 API 方法
```

要求：

```txt
接口路径与后端保持一致
统一错误处理
统一响应解析
支持 Token
支持分页参数
```

---

### 第三阶段：全局布局

任务：

```txt
创建 SiteHeader
创建 SiteFooter
创建 CategoryNav
创建 MobileNav
配置全局 layout
```

要求：

```txt
Header 包含 Logo、搜索框、分类入口、购物车、订单、登录状态
移动端有可用导航
整体具有商城氛围
```

---

### 第四阶段：商城首页

任务：

```txt
创建 HeroBanner
创建 CategorySection
创建 FlashSaleSection
创建 CouponSection
创建 BestSellers
创建 NewArrivals
创建 RecommendSection
创建 ServiceGuarantee
```

要求：

```txt
首页必须有商城味
必须有促销氛围
必须有多个商品分区
必须有真实商品卡片
```

---

### 第五阶段：商品列表页

任务：

```txt
创建商品列表页
创建筛选组件
创建排序组件
创建分页组件
接入商品查询接口
```

要求：

```txt
支持分类
支持搜索
支持排序
支持分页
支持 Loading Skeleton
支持空状态
```

---

### 第六阶段：商品详情页

任务：

```txt
创建商品详情页
展示商品图片、价格、库存、规格、数量
实现加入购物车
实现立即购买入口
展示商品详情和推荐商品
```

---

### 第七阶段：购物车和结算页

任务：

```txt
创建购物车页面
实现数量修改
实现删除商品
实现勾选商品
实现价格统计
创建结算页
实现地址选择
实现优惠券选择
实现提交订单
```

---

### 第八阶段：订单页和用户中心

任务：

```txt
创建订单列表页
创建订单详情页
创建个人中心基础页
实现订单状态展示
实现支付模拟入口
```

---

### 第九阶段：统一视觉和响应式

任务：

```txt
统一颜色
统一间距
统一商品卡片样式
优化移动端
优化 Loading / Error / Empty 状态
减少不必要动画
检查页面性能
```

---

## 12. 可直接给 AI 的总 Prompt

下面这段可以直接复制给 Cursor、Claude Code、Codex 或其他 AI 编程工具：

```txt
你现在是一个资深电商前端架构师和 UI 设计师。

项目技术栈：
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- 后端是 Spring Boot REST API

目标：
根据我已有的后端接口，开发一个完整的商城前台页面，不是简单模板站，而是有真实电商业务感、商城氛围、可用于作品集展示的前端项目。

设计要求：
1. 页面要有真实商城味，不要做成普通 SaaS 官网。
2. 首页需要包含：
   - 顶部导航栏
   - 搜索框
   - 商品分类导航
   - 大促销 Banner
   - 限时秒杀区
   - 优惠券区
   - 热卖商品区
   - 新品上架区
   - 猜你喜欢区
   - 服务保障区
   - 页脚
3. 商品卡片必须包含：
   - 商品图片
   - 商品名称
   - 商品价格
   - 原价
   - 折扣标签
   - 销量
   - 评分
   - 库存状态
   - 加入购物车按钮
4. 商品列表页需要包含：
   - 分类筛选
   - 价格区间筛选
   - 排序
   - 搜索关键词
   - 分页
   - 空状态
   - Loading Skeleton
5. 商品详情页需要包含：
   - 商品图片展示
   - 价格
   - 原价
   - 优惠标签
   - 库存
   - 规格选择
   - 数量选择
   - 加入购物车
   - 立即购买
   - 商品详情
   - 用户评价
   - 推荐商品
6. 购物车页面需要包含：
   - 商品勾选
   - 数量修改
   - 删除商品
   - 价格统计
   - 优惠券
   - 去结算
7. 结算页需要包含：
   - 地址选择
   - 商品清单
   - 优惠券
   - 配送方式
   - 订单备注
   - 价格明细
   - 提交订单
8. 订单页需要包含：
   - 订单状态
   - 商品信息
   - 订单金额
   - 下单时间
   - 查看详情
   - 取消订单
   - 支付模拟

技术要求：
1. 使用 Next.js App Router。
2. 默认使用 Server Components。
3. 只有需要交互的组件才使用 "use client"。
4. 所有接口调用统一封装到 lib/api 目录。
5. 所有 TypeScript 类型统一放到 types 目录。
6. 使用 shadcn/ui 组件，但不要过度堆组件。
7. 商品列表页和首页要保持性能轻量。
8. 图片使用 next/image。
9. 需要有 loading.tsx、error.tsx、not-found.tsx。
10. 所有页面需要响应式，适配桌面端和移动端。
11. UI 风格参考京东、天猫、得物、小米商城，但不要直接复制。
12. 整体风格：现代、干净、有促销氛围、有真实商城感。

视觉风格要求：
这个商城不是后台管理系统，也不是企业官网，而是面向消费者的 B2C 商城前台。

整体氛围：
- 有促销感
- 有商品密度
- 有价格吸引力
- 有分类导航
- 有电商运营模块
- 有真实购物路径

首页视觉：
- 顶部搜索框要明显，像真实商城一样
- 分类导航要靠近顶部
- Banner 要有促销文案，例如「春季焕新」「限时满减」「新人专享」
- 商品卡片要突出价格、折扣、销量
- 页面要有多个商品分区，不要只有一个简单网格
- 颜色可以使用红色、橙色、黑色、灰白色搭配，营造电商促销氛围
- 卡片不要太空，要有一定商品信息密度

避免：
- 不要做成 SaaS 官网
- 不要大面积留白
- 不要只有 Hero + 三个 Feature
- 不要只展示 4 个商品
- 不要使用过多玻璃拟态
- 不要所有元素都圆角巨大
- 不要过度动画

请先做以下事情：
1. 阅读并理解后端接口。
2. 总结后端已有的资源类型，例如 Product、Category、CartItem、Order、User、Address、Coupon。
3. 根据接口设计前端目录结构。
4. 生成 API Client 和 TypeScript 类型。
5. 生成商城首页。
6. 再生成商品列表页、商品详情页、购物车页、结算页和订单页。
7. 每完成一个模块，保证可以运行，不要一次性写无法运行的大量代码。

请不要只给示例代码，要直接修改项目文件。
```

---

## 13. 分阶段 Prompt

如果一次性让 AI 做太多容易出错，可以按下面分阶段执行。

### 阶段 1：读取后端接口

```txt
请先不要写前端页面。

请阅读我的 Spring Boot 后端项目，重点查看 controller、dto、vo、entity、service 目录。

请完成：
1. 总结已有接口列表。
2. 总结已有数据模型。
3. 总结接口返回格式。
4. 总结鉴权方式。
5. 判断哪些接口可以支撑商城前台。
6. 判断哪些页面需要 mock 数据兜底。

输出一份前端接入计划，不要修改代码。
```

### 阶段 2：生成 API Client 和类型

```txt
请根据刚才总结的后端接口，为前端生成 TypeScript 类型和 API Client。

要求：
1. 类型放到 types 目录。
2. API 方法放到 lib/api 目录。
3. 不要在页面里直接 fetch。
4. 统一处理后端响应格式。
5. 统一处理错误。
6. 如果需要 Token，请在请求 client 中统一处理。
7. 暂时没有接口的数据，设计 mock 数据结构。

完成后确保项目可以正常编译。
```

### 阶段 3：生成商城首页

```txt
请基于当前技术栈和已有 API Client，生成一个有真实商城味的首页。

首页必须包含：
1. 顶部导航栏
2. 搜索框
3. 分类导航
4. 大促销 Banner
5. 限时秒杀区
6. 优惠券区
7. 热卖商品区
8. 新品上架区
9. 猜你喜欢区
10. 服务保障区
11. 页脚

要求：
- 不要做成 SaaS 官网。
- 商品卡片要突出价格、原价、折扣、销量、评分。
- 使用 shadcn/ui，但不要过度堆组件。
- 图片使用 next/image。
- 保持响应式。
- 默认使用 Server Components。
- 只有搜索、筛选、按钮等交互组件使用 Client Components。
```

### 阶段 4：生成商品列表页和详情页

```txt
请继续生成商品列表页和商品详情页。

商品列表页要求：
1. 分类筛选
2. 价格筛选
3. 排序
4. 搜索关键词
5. 分页
6. Loading Skeleton
7. 空状态
8. 错误状态

商品详情页要求：
1. 商品图片展示
2. 商品名称
3. 价格和原价
4. 优惠标签
5. 库存
6. 销量
7. 评分
8. 规格选择
9. 数量选择
10. 加入购物车
11. 立即购买
12. 商品详情
13. 推荐商品

请接入已有 API，没有接口时使用 mock 数据兜底。
```

### 阶段 5：生成购物车、结算和订单页

```txt
请继续生成购物车、结算页和订单页。

购物车要求：
1. 商品勾选
2. 全选
3. 数量修改
4. 删除商品
5. 小计
6. 优惠券
7. 价格统计
8. 去结算
9. 空购物车状态

结算页要求：
1. 地址选择
2. 商品清单
3. 配送方式
4. 优惠券选择
5. 订单备注
6. 价格明细
7. 提交订单

订单页要求：
1. 订单列表
2. 订单详情
3. 订单状态
4. 商品信息
5. 订单金额
6. 下单时间
7. 取消订单
8. 支付模拟
9. 再次购买

要求每个页面都可以运行，并优先接入已有后端接口。
```

---

## 14. 最重要的提醒

让 AI 做商城前端时，不要只说：

```txt
帮我做一个商城页面
```

应该说：

```txt
请基于我的后端接口，做一个有完整购物流程和真实商城运营氛围的 B2C 商城前台。
```

商城味来自业务流程，不只是 UI。

必须让 AI 关注：

```txt
商品
分类
搜索
筛选
价格
折扣
优惠券
购物车
结算
订单
库存
销量
评分
用户状态
```

只要这些元素都出现，页面就会明显更像真实商城。
