# Design: Standardize ResponseCode Usage

## Overview

将代码中所有使用 `Result.error("...")` 字符串形式的地方替换为使用 `ResponseCode` 枚举，确保 API 响应的一致性和可追踪性。

## Current Issues

### Issue 1: Controller 层大量使用字符串错误

**Bad Example:**
```java
// AdminOrderController.java:108
return Result.error("订单不存在");
```

**Should Be:**
```java
throw new BusinessException(ResponseCode.ORDER_NOT_FOUND);
```

或者（如果必须直接返回）:
```java
return Result.error(ResponseCode.ORDER_NOT_FOUND);
```

### Issue 2: 缺少部分 ResponseCode 定义

需要添加新的状态码来覆盖所有场景。

## Implementation Plan

### Phase 1: Add Missing ResponseCode Definitions

在 `ResponseCode.java` 中添加缺失的状态码：

```java
// ========== 签到相关 ==========
SIGN_IN_ALREADY_DONE(400, "SIGN_IN_ALREADY_DONE", "今日已签到"),

// ========== 收藏相关 ==========
FAVORITE_NOT_FOUND(404, "FAVORITE_NOT_FOUND", "收藏记录不存在"),

// ========== 订单相关（补充） ==========
ORDER_ALREADY_PAID(400, "ORDER_ALREADY_PAID", "订单已支付"),
ORDER_ALREADY_CANCELLED(400, "ORDER_ALREADY_CANCELLED", "订单已取消"),
ORDER_ALREADY_SHIPPED(400, "ORDER_ALREADY_SHIPPED", "订单已发货，无法取消"),

// ========== 管理操作相关 ==========
OPERATION_FAILED(500, "OPERATION_FAILED", "操作失败"),
CATEGORY_CREATE_FAILED(500, "CATEGORY_CREATE_FAILED", "分类创建失败"),
MEMBER_LEVEL_CREATE_FAILED(500, "MEMBER_LEVEL_CREATE_FAILED", "会员等级创建失败"),
MEMBER_LEVEL_UPDATE_FAILED(500, "MEMBER_LEVEL_UPDATE_FAILED", "会员等级更新失败"),
POINTS_PRODUCT_CREATE_FAILED(500, "POINTS_PRODUCT_CREATE_FAILED", "积分兑换商品创建失败"),
POINTS_PRODUCT_UPDATE_FAILED(500, "POINTS_PRODUCT_UPDATE_FAILED", "积分兑换商品更新失败"),
STOCK_INVALID(400, "STOCK_INVALID", "库存不能为负数"),
```

### Phase 2: Replace Controller Error Returns

按照以下规则替换：

#### 规则 1: "用户未登录" → UNAUTHORIZED

```bash
# 查找所有需要替换的位置
grep -rn "用户未登录" src/main/java/org/ruikun/controller/
```

#### 规则 2: "xxx不存在" → 对应的 NOT_FOUND

| 当前错误消息 | 应使用的 ResponseCode |
|-------------|----------------------|
| 订单不存在 | ORDER_NOT_FOUND |
| 分类不存在 | CATEGORY_NOT_FOUND |
| 评论不存在 | COMMENT_NOT_FOUND |
| 会员等级不存在 | MEMBER_LEVEL_NOT_FOUND |
| 积分兑换商品不存在 | POINTS_PRODUCT_NOT_FOUND |
| 商品不存在 | PRODUCT_NOT_FOUND |
| 购物车商品不存在 | CART_ITEM_NOT_FOUND |
| 用户不存在 | USER_NOT_FOUND |
| 优惠券不存在 | COUPON_NOT_FOUND |
| 优惠券模板不存在 | COUPON_TEMPLATE_NOT_FOUND |

#### 规则 3: 其他业务错误消息

| 当前错误消息 | 应使用的 ResponseCode |
|-------------|----------------------|
| 该分类下存在子分类，无法删除 | CATEGORY_HAS_CHILDREN |
| 回复内容不能为空 | VALIDATION_ERROR |
| 已取消的订单不能修改状态 | ORDER_STATUS_ERROR |
| 已完成的订单不能修改状态 | ORDER_STATUS_ERROR |
| 待支付订单不能直接完成 | ORDER_STATUS_ERROR |
| 订单已取消 | ORDER_ALREADY_CANCELLED |
| 已完成的订单不能取消 | ORDER_STATUS_ERROR |
| 积分范围与其他等级冲突 | MEMBER_LEVEL_CONFLICT |
| 新增会员等级失败 | MEMBER_LEVEL_CREATE_FAILED |
| 修改会员等级失败 | MEMBER_LEVEL_UPDATE_FAILED |
| 会员等级不存在 | MEMBER_LEVEL_NOT_FOUND |
| 库存不能为负数 | STOCK_INVALID |
| 新增积分兑换商品失败 | POINTS_PRODUCT_CREATE_FAILED |
| 修改积分兑换商品失败 | POINTS_PRODUCT_UPDATE_FAILED |

#### 规则 4: Controller 层应抛出异常而非直接返回错误

Controller 层应该：
1. **Service 层抛出 BusinessException** ✅（已正确实现）
2. **Controller 层不使用 `Result.error`，让异常处理器处理** ❌（当前问题）

**当前问题代码：**
```java
// Controller 中直接返回错误
@GetMapping("/{id}")
public Result<?> getById(@PathVariable Long id) {
    Product product = productService.getById(id);
    if (product == null) {
        return Result.error("商品不存在");  // ❌ 错误
    }
    return Result.success(product);
}
```

**正确代码：**
```java
// Service 层抛出异常
public Product getById(Long id) {
    Product product = productMapper.selectById(id);
    if (product == null) {
        throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND);  // ✅ 正确
    }
    return product;
}

// Controller 让异常处理器处理
@GetMapping("/{id}")
public Result<?> getById(@PathVariable Long id) {
    Product product = productService.getById(id);  // 如果不存在会抛出异常
    return Result.success(product);
}
```

### Phase 3: Files to Modify

**需要修改的 Controller 文件：**

1. `src/main/java/org/ruikun/controller/UserController.java`
   - "用户未登录" → 使用 `ResponseCode.UNAUTHORIZED`

2. `src/main/java/org/ruikun/controller/admin/AdminCategoryController.java`
   - "分类不存在" → `ResponseCode.CATEGORY_NOT_FOUND`
   - "该分类下存在子分类，无法删除" → `ResponseCode.CATEGORY_HAS_CHILDREN`

3. `src/main/java/org/ruikun/controller/admin/AdminCommentController.java`
   - "评论不存在" → `ResponseCode.COMMENT_NOT_FOUND`
   - "回复内容不能为空" → `ResponseCode.VALIDATION_ERROR`

4. `src/main/java/org/ruikun/controller/admin/AdminOrderController.java`
   - 多处订单相关错误 → 使用对应的 `ResponseCode`

5. `src/main/java/org/ruikun/controller/admin/AdminMemberLevelController.java`
   - "会员等级不存在" → `ResponseCode.MEMBER_LEVEL_NOT_FOUND`
   - "积分范围与其他等级冲突" → `ResponseCode.MEMBER_LEVEL_CONFLICT`
   - 创建/更新失败 → 新增 `ResponseCode`

6. `src/main/java/org/ruikun/controller/admin/AdminPointsProductController.java`
   - "积分兑换商品不存在" → `ResponseCode.POINTS_PRODUCT_NOT_FOUND`
   - "库存不能为负数" → `ResponseCode.STOCK_INVALID`

7. `src/main/java/org/ruikun/controller/admin/AdminProductController.java`
   - "商品不存在" → `ResponseCode.PRODUCT_NOT_FOUND`
   - "库存不能为负数" → `ResponseCode.STOCK_INVALID`

8. `src/main/java/org/ruikun/controller/admin/AdminUserController.java`
   - "用户不存在" → `ResponseCode.USER_NOT_FOUND`
   - "积分不足" → `ResponseCode.POINTS_INSUFFICIENT`

### Phase 4: Update API.md Documentation

更新 `docs/API.md` 中的错误响应示例，使用正确的业务状态码。

**Example Update:**

**Before:**
```json
{
  "success": false,
  "code": "ERROR",
  "message": "订单不存在"
}
```

**After:**
```json
{
  "success": false,
  "code": "ORDER_NOT_FOUND",
  "message": "订单不存在"
}
```

## Testing Strategy

1. **编译测试**: 验证所有修改后代码编译通过
2. **接口测试**: 验证所有错误场景返回正确的业务状态码
3. **文档验证**: 确认 API.md 文档与实际响应一致

## Rollback Plan

如需回滚：
1. 恢复所有修改的 Controller 文件
2. 恢复 ResponseCode.java（如果添加了新枚举值）
