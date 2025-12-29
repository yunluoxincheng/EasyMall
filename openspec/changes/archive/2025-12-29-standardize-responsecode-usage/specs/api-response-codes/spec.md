# api-response-codes Specification Delta

## Purpose
标准化 Controller 层的错误返回，确保所有场景都使用 ResponseCode 枚举而非字符串。

## ADDED Requirements

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

## MODIFIED Requirements

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
