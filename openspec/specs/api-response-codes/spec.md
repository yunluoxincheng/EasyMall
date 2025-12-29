# api-response-codes Specification

## Purpose
TBD - created by archiving change standardize-responsecode-usage. Update Purpose after archive.
## Requirements
### Requirement: Service 层必须使用 ResponseCode 枚举

Service 层抛出 `BusinessException` 时 SHALL 使用 `ResponseCode` 枚举，而不是仅使用字符串消息。

#### Scenario: 登录失败返回正确的业务状态码

**When** 用户使用不存在的用户名登录
**Then** API 响应的 `code` 字段为 `USER_NOT_FOUND`
**And** HTTP 状态码为 404

**Example Response:**
```json
{
  "success": false,
  "code": "USER_NOT_FOUND",
  "message": "用户不存在",
  "timestamp": "2025-12-25T20:23:27.9159655",
  "traceId": "65ad4683f71242c7"
}
```

#### Scenario: 密码错误返回正确的业务状态码

**When** 用户使用错误的密码登录
**Then** API 响应的 `code` 字段为 `PASSWORD_ERROR`
**And** HTTP 状态码为 400

**Example Response:**
```json
{
  "success": false,
  "code": "PASSWORD_ERROR",
  "message": "密码错误",
  "timestamp": "2025-12-25T20:23:27.9159655",
  "traceId": "65ad4683f71242c7"
}
```

#### Scenario: 用户被禁用返回正确的业务状态码

**When** 被禁用的用户尝试登录
**Then** API 响应的 `code` 字段为 `USER_DISABLED`
**And** HTTP 状态码为 403

**Example Response:**
```json
{
  "success": false,
  "code": "USER_DISABLED",
  "message": "用户已被禁用",
  "timestamp": "2025-12-25T20:23:27.9159655",
  "traceId": "65ad4683f71242c7"
}
```

### Requirement: 扩展 ResponseCode 枚举覆盖所有业务场景

系统 SHALL 在 `ResponseCode` 枚举中定义所有业务场景对应的状态码。

#### Scenario: 用户注册相关状态码

**When** 用户注册时出现验证错误
**Then** 返回对应的状态码：
- `PASSWORD_MISMATCH` - 两次密码输入不一致
- `USERNAME_EXISTS` - 用户名已存在
- `PHONE_EXISTS` - 手机号已被注册
- `EMAIL_EXISTS` - 邮箱已被注册

#### Scenario: 订单操作相关状态码

**When** 用户对订单进行操作
**Then** 返回对应的状态码：
- `CART_ITEM_EMPTY` - 请选择要购买的商品
- `ORDER_CANNOT_CANCEL` - 订单状态不允许取消
- `ORDER_CANNOT_PAY` - 订单状态不允许支付
- `ORDER_CANNOT_CONFIRM` - 订单状态不允许确认收货

#### Scenario: 评论相关状态码

**When** 用户提交评论或删除评论
**Then** 返回对应的状态码：
- `COMMENT_RATING_INVALID` - 评分必须在1-5星之间
- `ORDER_NOT_COMPLETED` - 只能评论已完成的订单
- `PRODUCT_NOT_IN_ORDER` - 订单中不包含该商品
- `COMMENT_ALREADY_EXISTS` - 您已评论过该商品
- `COMMENT_DELETE_FORBIDDEN` - 无权删除该评论

#### Scenario: 分类管理相关状态码

**When** 管理员操作分类
**Then** 返回对应的状态码：
- `CATEGORY_NAME_EXISTS` - 同级分类名称已存在
- `CATEGORY_PARENT_NOT_FOUND` - 父分类不存在
- `CATEGORY_INVALID_PARENT` - 父分类不能是自己
- `CATEGORY_PARENT_IS_CHILD` - 父分类不能是自己的子分类

### Requirement: 一致的异常抛出模式

Service 层 SHALL 使用一致的异常抛出模式：`new BusinessException(ResponseCode.XXX, "自定义消息")`。

#### Scenario: 标准异常抛出格式

**When** Service 层需要抛出业务异常
**Then** 使用以下格式：
```java
throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
```

**And NOT** 以下格式：
```java
throw new BusinessException("用户不存在");  // 错误：缺少 ResponseCode
```

### Requirement: 成功响应使用语义化状态码

系统成功响应 SHALL 使用语义化的状态码，而非通用的 `SUCCESS`。

#### Scenario: 登录成功返回 LOGIN_SUCCESS

**When** 用户成功登录
**Then** API 响应的 `code` 字段为 `LOGIN_SUCCESS`
**And** HTTP 状态码为 200

**Example Response:**
```json
{
  "success": true,
  "code": "LOGIN_SUCCESS",
  "message": "登录成功",
  "timestamp": "2025-12-25T22:56:41.2183408",
  "traceId": "9a066d976b7145ee",
  "data": {
    "token": "eyJhbGci...",
    "userId": 7,
    "username": "admin",
    "nickname": "管理员",
    "role": 1,
    "avatar": null
  }
}
```

### Requirement: Controller 层不得使用字符串错误返回

Controller 层 SHALL 禁止使用 `Result.error("...")` 字符串形式，必须使用 ResponseCode 枚举或让 Service 层抛出异常。

#### Scenario: 用户未登录场景统一响应
**WHEN** 用户未登录访问需要认证的接口
**THEN** 系统返回 `UNAUTHORIZED` 状态码
**AND** 错误消息为"未授权，请先登录"

#### Scenario: 资源不存在场景统一响应
**WHEN** 请求的资源不存在
**THEN** 系统返回对应的 `NOT_FOUND` 状态码
**AND** 不使用字符串形式的 `Result.error("xxx不存在")`

#### Scenario: 业务验证失败场景统一响应
**WHEN** 业务规则验证失败
**THEN** 系统返回对应的业务状态码
**AND** 不使用字符串形式的 `Result.error("xxx失败")`

### Requirement: 补充缺失的 ResponseCode 定义

系统 SHALL 在 ResponseCode 枚举中添加所有当前缺失的业务状态码。

#### Scenario: 签到相关状态码
**WHEN** 用户重复签到或签到失败时
**THEN** 系统返回 `SIGN_IN_ALREADY_DONE` 状态码

#### Scenario: 收藏相关状态码
**WHEN** 收藏记录不存在时
**THEN** 系统返回 `FAVORITE_NOT_FOUND` 状态码

#### Scenario: 订单状态补充状态码
**WHEN** 订单状态不允许操作时
**THEN** 系统返回对应的状态码：
- `ORDER_ALREADY_PAID` - 订单已支付
- `ORDER_ALREADY_CANCELLED` - 订单已取消
- `ORDER_ALREADY_SHIPPED` - 订单已发货，无法取消

#### Scenario: 管理操作状态码
**WHEN** 创建或更新操作失败时
**THEN** 系统返回对应的状态码：
- `OPERATION_FAILED` - 操作失败（通用）
- `CATEGORY_CREATE_FAILED` - 分类创建失败
- `MEMBER_LEVEL_CREATE_FAILED` - 会员等级创建失败
- `MEMBER_LEVEL_UPDATE_FAILED` - 会员等级更新失败
- `POINTS_PRODUCT_CREATE_FAILED` - 积分兑换商品创建失败
- `POINTS_PRODUCT_UPDATE_FAILED` - 积分兑换商品更新失败
- `STOCK_INVALID` - 库存值无效（如负数）

#### Scenario: 通用验证状态码
**WHEN** 参数验证失败时
**THEN** 系统返回 `VALIDATION_ERROR` 状态码

---

