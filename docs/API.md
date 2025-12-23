# EasyMall API 接口文档

## 概述

EasyMall 是一个基于 B2C 模式的电子商城系统，采用前后端分离架构。

### 基础信息

| 项目 | 说明 |
|------|------|
| **基础URL** | `http://localhost:8080` |
| **接口格式** | RESTful API |
| **数据格式** | JSON |
| **字符编码** | UTF-8 |

### 统一响应格式

所有接口返回统一的 JSON 格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态码，200 表示成功，500 表示失败 |
| message | String | 响应消息 |
| data | Object/Array | 业务数据 |

### 分页响应格式

分页接口返回格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "records": [],
    "pageNum": 1,
    "pageSize": 10,
    "pages": 10
  }
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| total | Long | 总记录数 |
| records | Array | 当前页数据列表 |
| pageNum | Integer | 当前页码 |
| pageSize | Integer | 每页大小 |
| pages | Integer | 总页数 |

### 认证方式

系统使用 JWT Token 进行身份认证。

#### 获取 Token

调用登录接口获取 Token：

```http
POST /api/user/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

响应示例：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "..." }
  }
}
```

#### 使用 Token

在需要认证的接口中，在请求头中携带 Token：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 权限说明

| 权限类型 | 说明 | 示例接口 |
|----------|------|----------|
| 公开 | 无需认证即可访问 | 商品查询、分类查询 |
| 需认证 | 需要登录即可访问 | 购物车、订单 |
| 管理员 | 需要管理员角色 | 后台管理接口 |

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 500 | 操作失败（参数错误、权限不足等） |

---

## 用户模块

### 用户注册

**请求**: `POST /api/user/register`

**说明**: 用户账号注册

**权限**: 公开

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | 是 | 用户名（3-20字符） |
| password | String | 是 | 密码（6-20字符） |
| confirmPassword | String | 是 | 确认密码 |
| nickname | String | 是 | 昵称 |
| email | String | 否 | 邮箱 |
| phone | String | 否 | 手机号 |

**响应示例**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": null
}
```

### 用户登录

**请求**: `POST /api/user/login`

**说明**: 用户登录获取 Token

**权限**: 公开

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjowLCJ1c2VySWQiOjEsInN1YiI6InRlc3R1c2VyIiwiaWF0IjoxNzY2NDU4MjI3LCJleHAiOjE3NjY1NDQ2Mjd9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

### 获取用户信息

**请求**: `GET /api/user/info`

**说明**: 获取当前登录用户的信息

**权限**: 需认证

**请求头**:

```
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "email": "test@example.com",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "gender": 1,
    "points": 100,
    "level": 1
  }
}
```

### 修改用户信息

**请求**: `PUT /api/user/info`

**说明**: 修改当前用户信息

**权限**: 需认证

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | String | 否 | 昵称 |
| phone | String | 否 | 手机号 |
| email | String | 否 | 邮箱 |
| avatar | String | 否 | 头像URL |
| gender | Integer | 否 | 性别（0-未知，1-男，2-女） |

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

### 修改密码

**请求**: `PUT /api/user/password`

**说明**: 修改当前用户密码

**权限**: 需认证

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldPassword | String | 是 | 原密码 |
| newPassword | String | 是 | 新密码（6-20字符） |

**响应示例**:

```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

### 用户登出

**请求**: `POST /api/user/logout`

**说明**: 用户退出登录

**权限**: 需认证

**请求头**:

```
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

---

## 商品模块

### 分页查询商品列表

**请求**: `GET /api/product/page`

**说明**: 分页查询商品，支持关键字搜索和分类筛选

**权限**: 公开

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页大小，默认10 |
| keyword | String | 否 | 搜索关键字 |
| categoryId | Long | 否 | 分类ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "total": 100,
    "records": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "subtitle": "钛金属原色",
        "price": 7999.00,
        "image": "https://example.com/image.jpg",
        "stock": 100,
        "sales": 500
      }
    ],
    "pageNum": 1,
    "pageSize": 10,
    "pages": 10
  }
}
```

### 查询商品详情

**请求**: `GET /api/product/{id}`

**说明**: 根据ID查询商品详情

**权限**: 公开

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 商品ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "subtitle": "钛金属原色",
    "description": "苹果最新旗舰手机",
    "price": 7999.00,
    "originalPrice": 8999.00,
    "stock": 100,
    "sales": 500,
    "image": "https://example.com/image.jpg",
    "images": ["image1.jpg", "image2.jpg"],
    "categoryId": 1,
    "categoryName": "手机",
    "brand": "Apple"
  }
}
```

### 查询热门商品

**请求**: `GET /api/product/hot`

**说明**: 查询热门商品列表

**权限**: 公开

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | Integer | 否 | 返回数量，默认10 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "price": 7999.00,
      "image": "https://example.com/image.jpg",
      "sales": 500
    }
  ]
}
```

### 查询新品

**请求**: `GET /api/product/new`

**说明**: 查询新品列表

**权限**: 公开

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | Integer | 否 | 返回数量，默认10 |

### 查询相关商品

**请求**: `GET /api/product/related`

**说明**: 查询相关商品推荐

**权限**: 公开

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | Long | 是 | 分类ID |
| productId | Long | 是 | 当前商品ID |
| limit | Integer | 否 | 返回数量，默认5 |

---

## 分类模块

### 获取分类树

**请求**: `GET /api/category/tree`

**说明**: 获取完整的分类树结构

**权限**: 公开

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "手机",
      "icon": "phone",
      "level": 1,
      "children": [
        {
          "id": 11,
          "name": "苹果",
          "icon": "apple",
          "level": 2
        }
      ]
    }
  ]
}
```

### 获取分类详情

**请求**: `GET /api/category/{id}`

**说明**: 根据ID查询分类详情

**权限**: 公开

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 分类ID |

### 按级别获取分类

**请求**: `GET /api/category/level/{level}`

**说明**: 按级别查询分类列表

**权限**: 公开

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| level | Integer | 分类级别（1,2,3...） |

---

## 购物车模块

### 获取购物车列表

**请求**: `GET /api/cart/list`

**说明**: 获取当前用户的购物车列表

**权限**: 需认证

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "productId": 1,
      "productName": "iPhone 15 Pro",
      "productImage": "https://example.com/image.jpg",
      "price": 7999.00,
      "quantity": 2,
      "selected": true,
      "stock": 100
    }
  ]
}
```

### 获取购物车商品数量

**请求**: `GET /api/cart/count`

**说明**: 获取购物车中商品的总数量

**权限**: 需认证

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": 5
}
```

### 添加商品到购物车

**请求**: `POST /api/cart/add`

**说明**: 添加商品到购物车

**权限**: 需认证

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| productId | Long | 是 | 商品ID |
| quantity | Integer | 是 | 数量 |

### 修改购物车商品数量

**请求**: `PUT /api/cart/{cartId}`

**说明**: 修改购物车中商品的数量

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| cartId | Long | 购物车项ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| quantity | Integer | 是 | 新数量 |

### 删除购物车商品

**请求**: `DELETE /api/cart/{cartId}`

**说明**: 删除购物车中的商品

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| cartId | Long | 购物车项ID |

### 批量删除购物车商品

**请求**: `DELETE /api/cart/batch`

**说明**: 批量删除购物车中的商品

**权限**: 需认证

**请求参数**:

```json
[1, 2, 3]
```

### 全选/取消全选购物车

**请求**: `PUT /api/cart/selectAll/{selected}`

**说明**: 全选或取消全选购物车商品

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| selected | Boolean | 是否选中 |

### 批量选中/取消购物车商品

**请求**: `PUT /api/cart/batchSelect/{selected}`

**说明**: 批量选中或取消购物车商品

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| selected | Boolean | 是否选中 |

**请求参数**:

```json
[1, 2, 3]
```

---

## 订单模块

### 创建订单

**请求**: `POST /api/order/create`

**说明**: 创建新订单

**权限**: 需认证

**请求参数**:

```json
{
  "receiverName": "张三",
  "receiverPhone": "13800138000",
  "receiverAddress": "北京市朝阳区xxx街道xxx号",
  "items": [
    {
      "productId": 1,
      "quantity": 1
    }
  ]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "下单成功",
  "data": "ORD202412230001"
}
```

### 分页查询我的订单

**请求**: `GET /api/order/page`

**说明**: 分页查询当前用户的订单

**权限**: 需认证

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页大小，默认10 |

### 查询订单详情

**请求**: `GET /api/order/{orderId}`

**说明**: 查询订单详情

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| orderId | Long | 订单ID |

### 取消订单

**请求**: `PUT /api/order/{orderId}/cancel`

**说明**: 取消未完成的订单

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| orderId | Long | 订单ID |

### 支付订单

**请求**: `PUT /api/order/{orderId}/pay`

**说明**: 支付订单

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| orderId | Long | 订单ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paymentMethod | String | 是 | 支付方式（alipay/wechat） |

### 确认收货

**请求**: `PUT /api/order/{orderId}/confirm`

**说明**: 确认收货

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| orderId | Long | 订单ID |

---

## 评论模块

### 创建商品评论

**请求**: `POST /api/comment/create`

**说明**: 对商品进行评论

**权限**: 需认证

**请求参数**:

```json
{
  "productId": 1,
  "orderId": 1,
  "content": "商品质量很好，物流很快！",
  "rating": 5,
  "images": "image1.jpg,image2.jpg"
}
```

### 分页查询商品评论

**请求**: `GET /api/comment/product/{productId}`

**说明**: 分页查询指定商品的评论

**权限**: 公开

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| productId | Long | 商品ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页大小，默认10 |

### 分页查询我的评论

**请求**: `GET /api/comment/user`

**说明**: 分页查询当前用户的评论

**权限**: 需认证

### 删除我的评论

**请求**: `DELETE /api/comment/{commentId}`

**说明**: 删除自己的评论

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| commentId | Long | 评论ID |

### 获取商品评论数量

**请求**: `GET /api/comment/count/{productId}`

**说明**: 获取指定商品的评论总数

**权限**: 公开

### 获取商品平均评分

**请求**: `GET /api/comment/rating/{productId}`

**说明**: 获取指定商品的平均评分

**权限**: 公开

---

## 收藏模块

### 添加收藏

**请求**: `POST /api/favorite/add/{productId}`

**说明**: 添加商品到收藏

**权限**: 需认证

**路径参数**:

| 参数名 | 类型 | 说明 |
|--------|------|------|
| productId | Long | 商品ID |

### 取消收藏

**请求**: `DELETE /api/favorite/remove/{productId}`

**说明**: 取消商品收藏

**权限**: 需认证

### 切换收藏状态

**请求**: `POST /api/favorite/toggle/{productId}`

**说明**: 切换商品的收藏状态

**权限**: 需认证

### 检查是否已收藏

**请求**: `GET /api/favorite/check/{productId}`

**说明**: 检查商品是否已收藏

**权限**: 需认证

### 分页查询我的收藏

**请求**: `GET /api/favorite/page`

**说明**: 分页查询收藏列表

**权限**: 需认证

---

## 会员模块

### 获取所有会员等级配置

**请求**: `GET /api/member/levels`

**说明**: 获取系统配置的所有会员等级

**权限**: 公开

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "level": 1,
      "levelName": "普通会员",
      "minPoints": 0,
      "maxPoints": 999,
      "discount": 1.0,
      "icon": "bronze",
      "benefits": "享受基础会员权益"
    }
  ]
}
```

### 获取当前会员等级信息

**请求**: `GET /api/member/level`

**说明**: 获取当前用户的会员等级

**权限**: 需认证

### 获取会员折扣率

**请求**: `GET /api/member/discount`

**说明**: 获取当前用户的会员折扣率

**权限**: 需认证

---

## 签到模块

### 用户签到

**请求**: `POST /api/signin/do`

**说明**: 执行每日签到

**权限**: 需认证

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "points": 10,
    "continuousDays": 5
  }
}
```

### 检查今日是否已签到

**请求**: `GET /api/signin/status`

**说明**: 检查今日是否已签到

**权限**: 需认证

### 获取连续签到天数

**请求**: `GET /api/signin/continuous`

**说明**: 获取当前连续签到天数

**权限**: 需认证

---

## 积分模块

### 分页查询积分记录

**请求**: `GET /api/points/records`

**说明**: 分页查询积分变动记录

**权限**: 需认证

---

## 积分兑换模块

### 获取可兑换的商品列表

**请求**: `GET /api/points/exchange/products`

**说明**: 获取可兑换的积分商品列表

**权限**: 需认证

### 兑换商品

**请求**: `POST /api/points/exchange/exchange`

**说明**: 使用积分兑换商品

**权限**: 需认证

**请求参数**:

```json
{
  "productId": 1,
  "quantity": 1
}
```

### 分页查询兑换记录

**请求**: `GET /api/points/exchange/records`

**说明**: 分页查询积分兑换记录

**权限**: 需认证

### 查询兑换详情

**请求**: `GET /api/points/exchange/detail/{exchangeId}`

**说明**: 查询兑换记录详情

**权限**: 需认证

---

## 后台管理模块

> 后台管理接口需要管理员权限，请在请求头中携带管理员 Token：
> ```
> Authorization: Bearer {adminToken}
> ```

### 商品管理

#### 分页查询商品列表

**请求**: `GET /api/admin/products`

**权限**: 管理员

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页大小 |
| name | String | 否 | 商品名称 |
| categoryId | Long | 否 | 分类ID |
| status | Integer | 否 | 状态 |

#### 查询商品详情

**请求**: `GET /api/admin/products/{id}`

**权限**: 管理员

#### 新增商品

**请求**: `POST /api/admin/products`

**权限**: 管理员

**请求参数**:

```json
{
  "name": "iPhone 15 Pro",
  "subtitle": "钛金属原色",
  "description": "苹果最新旗舰手机",
  "originalPrice": 8999.00,
  "price": 7999.00,
  "stock": 100,
  "image": "https://example.com/image.jpg",
  "images": "image1.jpg,image2.jpg",
  "categoryId": 1,
  "brand": "Apple"
}
```

#### 修改商品

**请求**: `PUT /api/admin/products/{id}`

**权限**: 管理员

#### 修改商品状态

**请求**: `PUT /api/admin/products/{id}/status`

**权限**: 管理员

#### 修改商品库存

**请求**: `PUT /api/admin/products/{id}/stock`

**权限**: 管理员

#### 删除商品

**请求**: `DELETE /api/admin/products/{id}`

**权限**: 管理员

### 订单管理

#### 分页查询订单列表

**请求**: `GET /api/admin/orders`

**权限**: 管理员

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页大小 |
| orderNo | String | 否 | 订单号 |
| userId | Long | 否 | 用户ID |
| status | Integer | 否 | 订单状态 |

#### 查询订单详情

**请求**: `GET /api/admin/orders/{id}`

**权限**: 管理员

#### 修改订单状态

**请求**: `PUT /api/admin/orders/{id}/status`

**权限**: 管理员

#### 取消订单

**请求**: `PUT /api/admin/orders/{id}/cancel`

**权限**: 管理员

### 用户管理

#### 分页查询用户列表

**请求**: `GET /api/admin/users`

**权限**: 管理员

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页大小 |
| username | String | 否 | 用户名 |
| phone | String | 否 | 手机号 |
| status | Integer | 否 | 状态 |
| role | Integer | 否 | 角色 |

#### 查询用户详情

**请求**: `GET /api/admin/users/{id}`

**权限**: 管理员

#### 修改用户状态

**请求**: `PUT /api/admin/users/{id}/status`

**权限**: 管理员

#### 修改用户角色

**请求**: `PUT /api/admin/users/{id}/role`

**权限**: 管理员

#### 调整用户积分

**请求**: `PUT /api/admin/users/{id}/points`

**权限**: 管理员

### 评论审核

#### 分页查询评论列表

**请求**: `GET /api/admin/comments`

**权限**: 管理员

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页大小 |
| productId | Long | 否 | 商品ID |
| userId | Long | 否 | 用户ID |
| showStatus | Integer | 否 | 显示状态 |
| rating | Integer | 否 | 评分 |

#### 查询评论详情

**请求**: `GET /api/admin/comments/{id}`

**权限**: 管理员

#### 审核通过评论

**请求**: `PUT /api/admin/comments/{id}/approve`

**权限**: 管理员

#### 审核拒绝评论

**请求**: `PUT /api/admin/comments/{id}/reject`

**权限**: 管理员

#### 商家回复评论

**请求**: `PUT /api/admin/comments/{id}/reply`

**权限**: 管理员

**请求参数**:

```json
{
  "reply": "感谢您的评价，我们会继续努力！"
}
```

#### 删除评论

**请求**: `DELETE /api/admin/comments/{id}`

**权限**: 管理员

### 会员等级管理

#### 查询所有会员等级

**请求**: `GET /api/admin/member-levels`

**权限**: 管理员

#### 查询会员等级详情

**请求**: `GET /api/admin/member-levels/{id}`

**权限**: 管理员

#### 新增会员等级

**请求**: `POST /api/admin/member-levels`

**权限**: 管理员

**请求参数**:

```json
{
  "level": 1,
  "levelName": "普通会员",
  "minPoints": 0,
  "maxPoints": 999,
  "discount": 1.0,
  "icon": "bronze",
  "benefits": "享受基础会员权益",
  "sortOrder": 1
}
```

#### 修改会员等级

**请求**: `PUT /api/admin/member-levels/{id}`

**权限**: 管理员

#### 修改会员等级状态

**请求**: `PUT /api/admin/member-levels/{id}/status`

**权限**: 管理员

#### 删除会员等级

**请求**: `DELETE /api/admin/member-levels/{id}`

**权限**: 管理员

### 分类管理

#### 分页查询分类列表

**请求**: `GET /api/admin/categories`

**权限**: 管理员

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页大小 |
| name | String | 否 | 分类名称 |
| parentId | Long | 否 | 父分类ID |
| level | Integer | 否 | 级别 |
| status | Integer | 否 | 状态 |

#### 查询分类详情

**请求**: `GET /api/admin/categories/{id}`

**权限**: 管理员

#### 新增分类

**请求**: `POST /api/admin/categories`

**权限**: 管理员

**请求参数**:

```json
{
  "name": "数码产品",
  "icon": "digital",
  "parentId": 0,
  "level": 1,
  "sort": 1,
  "status": 1
}
```

#### 修改分类

**请求**: `PUT /api/admin/categories/{id}`

**权限**: 管理员

#### 修改分类状态

**请求**: `PUT /api/admin/categories/{id}/status`

**权限**: 管理员

#### 删除分类

**请求**: `DELETE /api/admin/categories/{id}`

**权限**: 管理员

### 积分兑换商品管理

#### 分页查询积分兑换商品

**请求**: `GET /api/admin/points-products`

**权限**: 管理员

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页大小 |
| name | String | 否 | 商品名称 |
| status | Integer | 否 | 状态 |

#### 查询积分兑换商品详情

**请求**: `GET /api/admin/points-products/{id}`

**权限**: 管理员

#### 新增积分兑换商品

**请求**: `POST /api/admin/points-products`

**权限**: 管理员

**请求参数**:

```json
{
  "name": "100元优惠券",
  "description": "全场通用，无门槛使用",
  "image": "https://example.com/coupon.jpg",
  "pointsRequired": 1000,
  "stock": 50,
  "sortOrder": 1
}
```

#### 修改积分兑换商品

**请求**: `PUT /api/admin/points-products/{id}`

**权限**: 管理员

#### 修改商品状态

**请求**: `PUT /api/admin/points-products/{id}/status`

**权限**: 管理员

#### 修改商品库存

**请求**: `PUT /api/admin/points-products/{id}/stock`

**权限**: 管理员

#### 删除积分兑换商品

**请求**: `DELETE /api/admin/points-products/{id}`

**权限**: 管理员

---

## 开发工具接口

### 生成 BCrypt 密码哈希

**请求**: `GET /api/dev/hash?password=admin123`

**说明**: 生成 BCrypt 密码哈希，用于数据库插入用户

**权限**: 公开（仅开发环境）

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "password": "admin123",
    "hash": "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EHdHmAjQJtQ2ux4yWNTA5i",
    "sql": "INSERT INTO user (username, password, nickname, role, status, points, level, create_time, update_time, deleted) VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EHdHmAjQJtQ2ux4yWNTA5i', '管理员', 1, 1, 0, 1, NOW(), NOW(), 0);"
  }
}
```

---

*文档最后更新时间: 2024-12-23*
