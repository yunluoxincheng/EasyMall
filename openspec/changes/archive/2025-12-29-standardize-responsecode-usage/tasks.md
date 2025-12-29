# Tasks: Standardize ResponseCode Usage

## Implementation Tasks

### Phase 1: Add Missing ResponseCode Definitions

1. **[COMPLETED] Add missing ResponseCode entries**
   - ✅ 在 ResponseCode.java 中添加签到相关状态码
   - ✅ 添加收藏相关状态码
   - ✅ 添加订单状态补充状态码
   - ✅ 添加管理操作状态码
   - 验证: 代码编译通过

### Phase 2: Replace Controller Error Returns (8 files)

2. **[COMPLETED] Fix UserController.java**
   - ✅ 将 "用户未登录" 替换为使用 ResponseCode.UNAUTHORIZED
   - 验证: 用户未登录时返回 UNAUTHORIZED 状态码

3. **[COMPLETED] Fix AdminCategoryController.java**
   - ✅ 将 "分类不存在" 替换为 ResponseCode.CATEGORY_NOT_FOUND
   - ✅ 将 "该分类下存在子分类，无法删除" 替换为 ResponseCode.CATEGORY_HAS_CHILDREN
   - 验证: 分类操作返回正确状态码

4. **[COMPLETED] Fix AdminCommentController.java**
   - ✅ 将 "评论不存在" 替换为 ResponseCode.COMMENT_NOT_FOUND
   - ✅ 将 "回复内容不能为空" 替换为 ResponseCode.VALIDATION_ERROR
   - 验证: 评论操作返回正确状态码

5. **[COMPLETED] Fix AdminOrderController.java**
   - ✅ 将所有 "订单不存在" 替换为 ResponseCode.ORDER_NOT_FOUND
   - ✅ 将订单状态相关错误替换为对应的 ResponseCode
   - 验证: 订单操作返回正确状态码

6. **[COMPLETED] Fix AdminMemberLevelController.java**
   - ✅ 将 "会员等级不存在" 替换为 ResponseCode.MEMBER_LEVEL_NOT_FOUND
   - ✅ 将 "积分范围与其他等级冲突" 替换为 ResponseCode.MEMBER_LEVEL_CONFLICT
   - ✅ 将创建/更新失败替换为新增的 ResponseCode
   - 验证: 会员等级操作返回正确状态码

7. **[COMPLETED] Fix AdminPointsProductController.java**
   - ✅ 将 "积分兑换商品不存在" 替换为 ResponseCode.POINTS_PRODUCT_NOT_FOUND
   - ✅ 将 "库存不能为负数" 替换为 ResponseCode.STOCK_INVALID
   - ✅ 将创建/更新失败替换为新增的 ResponseCode
   - 验证: 积分兑换商品操作返回正确状态码

8. **[COMPLETED] Fix AdminProductController.java**
   - ✅ 将 "商品不存在" 替换为 ResponseCode.PRODUCT_NOT_FOUND
   - ✅ 将 "库存不能为负数" 替换为 ResponseCode.STOCK_INVALID
   - 验证: 商品操作返回正确状态码

9. **[COMPLETED] Fix AdminUserController.java**
   - ✅ 将 "用户不存在" 替换为 ResponseCode.USER_NOT_FOUND
   - ✅ 将 "积分不足" 替换为 ResponseCode.POINTS_INSUFFICIENT
   - 验证: 用户操作返回正确状态码

### Phase 3: Update Other Controllers

10. **[COMPLETED] Fix remaining Controllers**
    - ✅ 修复 SignInController.java 中的 "用户未登录"
    - ✅ 修复 PointsExchangeController.java 中的 "用户未登录"
    - ✅ 修复 PointsController.java 中的 "用户未登录"
    - ✅ 修复 CouponController.java 中的 "用户未登录"
    - ✅ 修复 MemberController.java 中的 "用户未登录"
    - ✅ 修复 CommentController.java 中的 "用户未登录"
    - ✅ 修复 FavoriteController.java 中的 "用户未登录"
    - 验证: 所有控制器返回正确状态码

### Phase 4: Update API Documentation

11. **[COMPLETED] Update docs/API.md error response examples**
    - ✅ 更新所有错误响应示例使用正确的业务状态码
    - ✅ 确保示例中的 code 字段与 ResponseCode 枚举一致
    - ✅ 更新错误码说明表，添加新增的 ResponseCode 条目
    - 验证: 文档与实际响应一致

**具体修改**:
- 修复 `COUPON_CLAIMED_OUT` → `COUPON_OUT_OF_STOCK`
- 修复 `COUPON_LIMIT_REACHED` → `COUPON_ALREADY_RECEIVED`
- 更新错误码说明表，按模块分类展示所有状态码

### Phase 5: Testing

12. **[COMPLETED] Test all error scenarios**
    - ✅ 创建测试脚本 (test-responsecode.bat)
    - ✅ 创建测试清单 (test-checklist.md)
    - ✅ 执行测试并验证错误响应包含正确的业务状态码
    - ✅ 验证: 所有测试通过

**测试结果** (2025-12-29):

| 测试场景 | 接口 | 预期 ResponseCode | 实际结果 | 状态 |
|----------|------|-------------------|----------|------|
| 用户不存在 | POST /api/user/login | USER_NOT_FOUND | USER_NOT_FOUND | ✅ |
| 商品不存在 | GET /api/product/999999 | PRODUCT_NOT_FOUND | PRODUCT_NOT_FOUND | ✅ |
| 分类不存在 | GET /api/category/999999 | CATEGORY_NOT_FOUND | CATEGORY_NOT_FOUND | ✅ |
| 分类不存在(后台) | GET /api/admin/categories/999999 | CATEGORY_NOT_FOUND | CATEGORY_NOT_FOUND | ✅ |
| 订单不存在 | GET /api/admin/orders/999999 | ORDER_NOT_FOUND | ORDER_NOT_FOUND | ✅ |
| 会员等级不存在 | GET /api/admin/member-levels/999999 | MEMBER_LEVEL_NOT_FOUND | MEMBER_LEVEL_NOT_FOUND | ✅ |
| 积分商品不存在 | GET /api/admin/points-products/999999 | POINTS_PRODUCT_NOT_FOUND | POINTS_PRODUCT_NOT_FOUND | ✅ |
| 库存无效 | PUT /api/admin/products/1/stock?stock=-1 | STOCK_INVALID | STOCK_INVALID | ✅ |
| 参数校验失败 | POST /api/user/register (缺少字段) | VALIDATION_ERROR | VALIDATION_ERROR | ✅ |
| 用户未登录 | GET /api/user/info (无Token) | UNAUTHORIZED | UNAUTHORIZED | ✅ |
| 用户未登录 | POST /api/order/create (无Token) | UNAUTHORIZED | UNAUTHORIZED | ✅ |

**通过率**: 11/11 = 100%

**注意**: 需要绕过系统代理测试，使用 `curl --noproxy "*"` 命令

## Summary

### Completed Changes
- **ResponseCode.java**: Added 12 new status codes
- **15 Controller files updated**: All string-based error returns replaced with ResponseCode enum
- **docs/API.md updated**: Error response examples and error code table updated
- **Test files created**: test-responsecode.bat and test-checklist.md
- **All tests passed**: 8/8 scenarios = 100% pass rate

### Change Statistics
- **Files modified**: 18 (1 ResponseCode + 15 Controllers + 1 API.md + 1 JwtAuthenticationFilter)
- **New ResponseCode entries**: 12
- **String-based errors replaced**: 60+
- **Test coverage**: 8 core error scenarios validated

### Additional Fix: UNAUTHORIZED Response
- **Modified**: JwtAuthenticationFilter.java
- **Issue**: Spring Security was returning 403 Forbidden instead of 401 UNAUTHORIZED
- **Solution**: Added authentication check in filter, return 401 with UNAUTHORIZED code when not authenticated
- **Test Result**: All protected endpoints now return correct UNAUTHORIZED response

### Documentation Updates (Phase 4)
- Fixed 2 incorrect error response codes in coupon examples
- Enhanced error code table with category grouping
- Added 12 new ResponseCode entries to documentation
- Improved documentation readability with organized error code sections

### New ResponseCode Entries Added
- SIGN_IN_ALREADY_DONE
- FAVORITE_NOT_FOUND
- ORDER_ALREADY_PAID
- ORDER_ALREADY_CANCELLED
- ORDER_ALREADY_SHIPPED
- OPERATION_FAILED
- CATEGORY_CREATE_FAILED
- MEMBER_LEVEL_CREATE_FAILED
- MEMBER_LEVEL_UPDATE_FAILED
- POINTS_PRODUCT_CREATE_FAILED
- POINTS_PRODUCT_UPDATE_FAILED
- STOCK_INVALID

### Controllers Fixed (Phase 2)
1. UserController.java - 3 fixes
2. AdminCategoryController.java - 3 fixes
3. AdminCommentController.java - 6 fixes
4. AdminOrderController.java - 8 fixes
5. AdminMemberLevelController.java - 7 fixes
6. AdminPointsProductController.java - 8 fixes
7. AdminProductController.java - 4 fixes
8. AdminUserController.java - 4 fixes

### Controllers Fixed (Phase 3)
9. FavoriteController.java - 4 fixes
10. CouponController.java - 5 fixes
11. CommentController.java - 3 fixes
12. MemberController.java - 2 fixes
13. PointsController.java - 1 fix
14. SignInController.java - 3 fixes
15. PointsExchangeController.java - 4 fixes

### Total Impact
- **12 new ResponseCode entries** added
- **15 Controller files** modified
- **60+ string-based error returns** converted to ResponseCode enum usage
