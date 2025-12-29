# ResponseCode 标准化测试清单

## 测试说明

本文档列出了所有需要验证的错误场景和预期的 ResponseCode。

### 前置条件

1. 应用已启动 (`mvn spring-boot:run` 或 `start.bat`)
2. 数据库已连接
3. Redis 已启动

### 测试账号

| 类型 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 用于测试后台管理接口 |
| 普通用户 | test | 123456 | 用于测试前端接口 |

---

## Phase 1: 基础认证测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试命令 |
|--------|------|------|-------------------|----------|
| 用户未登录 | /api/user/info | GET | UNAUTHORIZED | `curl -X GET "http://localhost:8080/api/user/info"` |
| 无权限访问 | /api/admin/users | GET | FORBIDDEN | 普通用户Token访问后台接口 |

---

## Phase 2: 用户模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 用户名已存在 | /api/user/register | POST | USERNAME_EXISTS | 注册已存在的用户名 |
| 密码错误 | /api/user/login | POST | PASSWORD_ERROR | 错误的密码 |
| 原密码错误 | /api/user/password | PUT | OLD_PASSWORD_ERROR | 错误的原密码 |
| 用户不存在 | /api/admin/users/{id} | PUT | USER_NOT_FOUND | id=999999 |
| 积分不足 | /api/admin/users/{id}/points | PUT | POINTS_INSUFFICIENT | 扣减超过现有积分 |

---

## Phase 3: 商品模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 商品不存在 | /api/products/{id} | GET | PRODUCT_NOT_FOUND | id=999999 |
| 商品已下架 | /api/products/{id}/buy | POST | PRODUCT_SHELF_ERROR | 购买下架商品 |
| 商品库存不足 | /api/products/{id}/buy | POST | PRODUCT_OUT_OF_STOCK | 购买库存不足商品 |
| 库存无效 | /api/admin/products/{id}/stock | PUT | STOCK_INVALID | stock=-1 |

---

## Phase 4: 分类模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 分类不存在 | /api/admin/categories/{id} | GET | CATEGORY_NOT_FOUND | id=999999 |
| 有子分类无法删除 | /api/admin/categories/{id} | DELETE | CATEGORY_HAS_CHILDREN | 删除有子分类的分类 |

---

## Phase 5: 订单模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 订单不存在 | /api/admin/orders/{id} | GET | ORDER_NOT_FOUND | id=999999 |
| 订单状态错误 | /api/admin/orders/{id}/cancel | PUT | ORDER_STATUS_ERROR | 取消已完成订单 |
| 订单已取消 | /api/admin/orders/{id}/cancel | PUT | ORDER_ALREADY_CANCELLED | 取消已取消订单 |
| 购物车为空 | /api/order/create | POST | CART_EMPTY | 空购物车下单 |
| 购物车商品不存在 | /api/cart/items/{id} | DELETE | CART_ITEM_NOT_FOUND | 删除不存在商品 |

---

## Phase 6: 评论模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 评论不存在 | /api/admin/comments/{id} | GET | COMMENT_NOT_FOUND | id=999999 |
| 回复内容为空 | /api/admin/comments/{id}/reply | PUT | VALIDATION_ERROR | reply="" |

---

## Phase 7: 会员等级模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 会员等级不存在 | /api/admin/member-levels/{id} | GET | MEMBER_LEVEL_NOT_FOUND | id=999999 |
| 积分范围冲突 | /api/admin/member-levels | POST | MEMBER_LEVEL_CONFLICT | 创建冲突的积分范围 |

---

## Phase 8: 积分兑换模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 兑换商品不存在 | /api/admin/points-products/{id} | GET | POINTS_PRODUCT_NOT_FOUND | id=999999 |
| 库存不足 | /api/points/exchange/exchange | POST | POINTS_PRODUCT_OUT_OF_STOCK | 兑换库存不足商品 |
| 积分不足 | /api/points/exchange/exchange | POST | POINTS_INSUFFICIENT | 积分不足兑换 |

---

## Phase 9: 收藏模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 收藏记录不存在 | /api/favorite/remove/{id} | DELETE | FAVORITE_NOT_FOUND | 删除不存在的收藏 |

---

## Phase 10: 签到模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 重复签到 | /api/signin/do | POST | SIGN_IN_ALREADY_DONE | 一天内重复签到 |

---

## Phase 11: 优惠券模块测试

| 测试项 | 接口 | 方法 | 预期 ResponseCode | 测试数据 |
|--------|------|------|-------------------|----------|
| 优惠券不存在 | /api/coupon/{id} | GET | COUPON_NOT_FOUND | id=999999 |
| 已领取过 | /api/coupon/receive/{id} | POST | COUPON_ALREADY_RECEIVED | 重复领取 |
| 优惠券已领完 | /api/coupon/receive/{id} | POST | COUPON_OUT_OF_STOCK | 领取已领完优惠券 |
| 优惠券已过期 | /api/coupon/calculate | POST | COUPON_EXPIRED | 使用过期优惠券 |
| 不满足门槛 | /api/coupon/calculate | POST | COUPON_AMOUNT_THRESHOLD_NOT_MET | 不满足金额门槛 |

---

## 验证标准

### 通过标准
- ✅ 所有接口返回正确的 ResponseCode
- ✅ 响应格式符合统一规范
- ✅ HTTP 状态码与 ResponseCode 定义一致

### 常见问题排查

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| 404 Not Found | 接口路径错误 | 检查 Controller @RequestMapping |
| 500 Internal Server Error | 代码逻辑错误 | 查看应用日志 |
| 返回旧的错误消息 | 缓存问题 | 重启应用 |
| FORBIDDEN | Token 权限不足 | 使用管理员 Token |

---

## 测试报告模板

```
测试日期: ________________
测试人员: ________________
应用版本: ________________

## 测试结果汇总

| 模块 | 测试数 | 通过数 | 失败数 |
|------|--------|--------|--------|
| 基础认证 | 2 | 2 | 0 |
| 用户模块 | 5 | 5 | 0 |
| 商品模块 | 4 | 4 | 0 |
| ... | ... | ... | ... |

## 发现的问题

1. [问题描述]
   - 接口: [接口路径]
   - 预期: [预期 ResponseCode]
   - 实际: [实际 ResponseCode]

## 建议

[改进建议]
```
