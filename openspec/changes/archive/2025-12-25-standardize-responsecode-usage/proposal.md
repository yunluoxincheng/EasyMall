# Standardize ResponseCode Usage in Service Layer

## Summary

修复 Service 层中 BusinessException 未正确使用 ResponseCode 枚举的问题。当前代码使用字符串消息创建异常，导致 API 响应中的 `code` 字段始终显示为通用的 `ERROR`，而不是具体的业务状态码。

## Why

当前 API 响应的错误码缺乏语义化，所有业务错误都返回通用的 `ERROR` 状态码，这使得：
- 前端无法根据具体的错误类型进行差异化处理
- 问题排查和日志分析变得困难
- API 调用者难以编写健壮的错误处理逻辑

通过标准化 ResponseCode 的使用，API 响应将包含具体的业务状态码（如 `USER_NOT_FOUND`、`PASSWORD_ERROR`），提升系统的可维护性和前端开发体验。

## What Changes

### ADDED: API Response Codes 规范
新增 `api-response-codes` 规范，该规范 SHALL 要求 Service 层必须使用 ResponseCode 枚举抛出异常。

### MODIFIED: Enhanced API Response 规范
更新 `enhanced-api-response` 规范，该规范 SHALL 要求 `code` 字段必须反映具体的业务状态码而非通用的 `ERROR`。

### Implementation Changes
1. 在 `ResponseCode` 枚举中添加所有缺失的业务状态码
2. 修改所有 Service 实现类，使用 `new BusinessException(ResponseCode.XXX, message)` 替代 `new BusinessException(message)`
3. 更新 `Result` 类，添加 `success(ResponseCode, T)` 方法支持自定义成功状态码
4. 更新 `UserController`，使用语义化的成功状态码（LOGIN_SUCCESS、REGISTER_SUCCESS 等）

## Problem

当用户登录失败时，当前 API 响应如下：

```json
{
  "code": "ERROR",
  "message": "用户不存在"
}
```

期望的响应应该是：

```json
{
  "code": "USER_NOT_FOUND",
  "message": "用户不存在"
}
```

这是因为 Service 层使用 `new BusinessException("用户不存在")` 而不是 `new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在")`。

## Root Cause

- `BusinessException(String message)` 构造函数使用默认的 `ResponseCode.ERROR`
- 多个 Service 实现类（UserServiceImpl、CartServiceImpl、OrderServiceImpl 等）使用字符串构造函数
- ResponseCode 枚举已定义了所有必要的业务状态码，但未被正确使用

## Proposed Solution

1. 修改所有 Service 实现类中的 BusinessException 抛出语句，使用对应的 ResponseCode 枚举
2. 为未定义在 ResponseCode 中的错误场景添加新的状态码
3. 确保所有 API 错误响应返回正确的业务状态码

## Affected Components

- UserServiceImpl（用户登录、注册、信息管理）
- CartServiceImpl（购物车操作）
- OrderServiceImpl（订单管理）
- ProductServiceImpl（商品管理）
- CategoryServiceImpl（分类管理）
- CommentServiceImpl（评论管理）
- FavoriteServiceImpl（收藏管理）
- PointsServiceImpl（积分管理）
- PointsExchangeServiceImpl（积分兑换）
- MemberServiceImpl（会员等级管理）
- SignInServiceImpl（签到管理）

## Out of Scope

- 修改 ResponseCode 枚举定义（仅添加缺失的状态码）
- 修改 Result 类结构
- 修改 GlobalExceptionHandler
- 修改 Controller 层
