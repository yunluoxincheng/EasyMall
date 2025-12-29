# Tasks

## Phase 1: 添加缺失的 ResponseCode 状态码

1. **添加用户和认证相关的缺失状态码**
   - LOGIN_SUCCESS(200, "LOGIN_SUCCESS", "登录成功")
   - PHONE_EXISTS(400, "PHONE_EXISTS", "手机号已被注册")
   - EMAIL_EXISTS(400, "EMAIL_EXISTS", "邮箱已被注册")
   - PASSWORD_MISMATCH(400, "PASSWORD_MISMATCH", "两次密码输入不一致")
   - PRODUCT_ALREADY_FAVORITED(400, "PRODUCT_ALREADY_FAVORITED", "已收藏该商品")

2. **添加评论相关的缺失状态码**
   - COMMENT_RATING_INVALID(400, "COMMENT_RATING_INVALID", "评分必须在1-5星之间")
   - ORDER_NOT_COMPLETED(400, "ORDER_NOT_COMPLETED", "只能评论已完成的订单")
   - PRODUCT_NOT_IN_ORDER(400, "PRODUCT_NOT_IN_ORDER", "订单中不包含该商品")
   - COMMENT_ALREADY_EXISTS(400, "COMMENT_ALREADY_EXISTS", "您已评论过该商品")
   - COMMENT_DELETE_FORBIDDEN(403, "COMMENT_DELETE_FORBIDDEN", "无权删除该评论")

3. **添加分类相关的缺失状态码**
   - CATEGORY_NAME_EXISTS(400, "CATEGORY_NAME_EXISTS", "同级分类名称已存在")
   - CATEGORY_PARENT_NOT_FOUND(404, "CATEGORY_PARENT_NOT_FOUND", "父分类不存在")
   - CATEGORY_INVALID_PARENT(400, "CATEGORY_INVALID_PARENT", "父分类不能是自己")
   - CATEGORY_PARENT_IS_CHILD(400, "CATEGORY_PARENT_IS_CHILD", "父分类不能是自己的子分类")

4. **添加订单相关的缺失状态码**
   - CART_ITEM_EMPTY(400, "CART_ITEM_EMPTY", "请选择要购买的商品")
   - ORDER_CANNOT_CANCEL(400, "ORDER_CANNOT_CANCEL", "订单状态不允许取消")
   - ORDER_CANNOT_PAY(400, "ORDER_CANNOT_PAY", "订单状态不允许支付")
   - ORDER_CANNOT_CONFIRM(400, "ORDER_CANNOT_CONFIRM", "订单状态不允许确认收货")

5. **添加商品相关的缺失状态码**
   - PRODUCT_CREATE_FAILED(500, "PRODUCT_CREATE_FAILED", "商品添加失败")
   - PRODUCT_UPDATE_FAILED(500, "PRODUCT_UPDATE_FAILED", "商品更新失败")
   - PRODUCT_SHELF_EMPTY(400, "PRODUCT_SHELF_EMPTY", "商品不存在或已下架")

6. **添加积分相关的缺失状态码**
   - POINTS_VALUE_INVALID(400, "POINTS_VALUE_INVALID", "积分值必须大于0")

## Phase 2: 修改 UserServiceImpl

7. **修改登录方法中的异常**
   - 用户不存在 → `ResponseCode.USER_NOT_FOUND`
   - 账号已被禁用 → `ResponseCode.USER_DISABLED`
   - 密码错误 → `ResponseCode.PASSWORD_ERROR`

8. **修改注册方法中的异常**
   - 两次密码输入不一致 → `ResponseCode.PASSWORD_MISMATCH`
   - 用户名已存在 → `ResponseCode.USERNAME_EXISTS`
   - 手机号已被注册 → `ResponseCode.PHONE_EXISTS`
   - 邮箱已被注册 → `ResponseCode.EMAIL_EXISTS`

9. **修改其他方法中的异常**
   - 用户不存在 → `ResponseCode.USER_NOT_FOUND`
   - 手机号已被使用 → `ResponseCode.PHONE_EXISTS`
   - 邮箱已被使用 → `ResponseCode.EMAIL_EXISTS`
   - 原密码错误 → `ResponseCode.OLD_PASSWORD_ERROR`

## Phase 3: 修改 CartServiceImpl

10. **修改购物车相关异常**
    - 商品不存在或已下架 → `ResponseCode.PRODUCT_SHELF_EMPTY`
    - 商品库存不足 → `ResponseCode.PRODUCT_OUT_OF_STOCK`
    - 购物车记录不存在 → `ResponseCode.CART_ITEM_NOT_FOUND`

## Phase 4: 修改 OrderServiceImpl

11. **修改订单相关异常**
    - 请选择要购买的商品 → `ResponseCode.CART_ITEM_EMPTY`
    - 订单不存在 → `ResponseCode.ORDER_NOT_FOUND`
    - 订单状态不允许取消 → `ResponseCode.ORDER_CANNOT_CANCEL`
    - 订单状态不允许支付 → `ResponseCode.ORDER_CANNOT_PAY`
    - 订单状态不允许确认收货 → `ResponseCode.ORDER_CANNOT_CONFIRM`

## Phase 5: 修改 ProductServiceImpl

12. **修改商品相关异常**
    - 商品不存在 → `ResponseCode.PRODUCT_NOT_FOUND`
    - 商品添加失败 → `ResponseCode.PRODUCT_CREATE_FAILED`
    - 商品更新失败 → `ResponseCode.PRODUCT_UPDATE_FAILED`
    - 库存不足 → `ResponseCode.PRODUCT_OUT_OF_STOCK`

## Phase 6: 修改 CategoryServiceImpl

13. **修改分类相关异常**
    - 父分类不存在 → `ResponseCode.CATEGORY_PARENT_NOT_FOUND`
    - 同级分类名称已存在 → `ResponseCode.CATEGORY_NAME_EXISTS`
    - 分类不存在 → `ResponseCode.CATEGORY_NOT_FOUND`
    - 父分类不能是自己 → `ResponseCode.CATEGORY_INVALID_PARENT`
    - 父分类不能是自己的子分类 → `ResponseCode.CATEGORY_PARENT_IS_CHILD`
    - 存在子分类，无法删除 → `ResponseCode.CATEGORY_HAS_CHILDREN`

## Phase 7: 修改 CommentServiceImpl

14. **修改评论相关异常**
    - 评分必须在1-5星之间 → `ResponseCode.COMMENT_RATING_INVALID`
    - 订单不存在 → `ResponseCode.ORDER_NOT_FOUND`
    - 只能评论已完成的订单 → `ResponseCode.ORDER_NOT_COMPLETED`
    - 订单中不包含该商品 → `ResponseCode.PRODUCT_NOT_IN_ORDER`
    - 您已评论过该商品 → `ResponseCode.COMMENT_ALREADY_EXISTS`
    - 评论不存在 → `ResponseCode.COMMENT_NOT_FOUND`
    - 无权删除该评论 → `ResponseCode.COMMENT_DELETE_FORBIDDEN`

## Phase 8: 修改 FavoriteServiceImpl

15. **修改收藏相关异常**
    - 商品不存在 → `ResponseCode.PRODUCT_NOT_FOUND`
    - 已收藏该商品 → `ResponseCode.PRODUCT_ALREADY_FAVORITED`

## Phase 9: 修改 PointsServiceImpl

16. **修改积分相关异常**
    - 用户不存在 → `ResponseCode.USER_NOT_FOUND`
    - 积分值必须大于0 → `ResponseCode.POINTS_VALUE_INVALID`
    - 积分不足 → `ResponseCode.POINTS_INSUFFICIENT`

## Phase 10: 修改 PointsExchangeServiceImpl

17. **修改积分兑换相关异常**
    - 用户不存在 → `ResponseCode.USER_NOT_FOUND`
    - 商品不存在 → `ResponseCode.PRODUCT_NOT_FOUND`
    - 商品已下架 → `ResponseCode.PRODUCT_SHELF_ERROR`
    - 商品库存不足 → `ResponseCode.POINTS_PRODUCT_OUT_OF_STOCK`
    - 兑换记录不存在 → `ResponseCode.POINTS_PRODUCT_NOT_FOUND`

## Phase 11: 修改 MemberServiceImpl

18. **修改会员等级相关异常**
    - 用户不存在 → `ResponseCode.USER_NOT_FOUND`

## Phase 12: 修改 SignInServiceImpl

19. **修改签到相关异常**
    - 用户不存在 → `ResponseCode.USER_NOT_FOUND`

## Phase 13: 测试验证

20. **测试登录失败场景**
    - 测试用户不存在返回 `USER_NOT_FOUND`
    - 测试用户被禁用返回 `USER_DISABLED`
    - 测试密码错误返回 `PASSWORD_ERROR`

21. **测试其他关键场景**
    - 测试用户名已存在返回 `USERNAME_EXISTS`
    - 测试商品不存在返回 `PRODUCT_NOT_FOUND`
    - 测试购物车商品不存在返回 `CART_ITEM_NOT_FOUND`
