# Proposal: Standardize ResponseCode Usage

## Metadata
- **ID**: standardize-responsecode-usage
- **Status**: Draft
- **Created**: 2025-12-29
- **Author**: AI Assistant

## Problem Statement

当前代码中存在大量使用 `Result.error("...")` 字符串形式返回错误的情况，而不是使用已定义的 `ResponseCode` 枚举。这导致：

1. **不一致的响应格式**：API 响应中的 `code` 字段可能不一致
2. **重复的错误消息**：相同场景使用不同的错误描述
3. **丢失 HTTP 状态码**：字符串形式的错误无法正确设置 HTTP 状态码
4. **难以追踪**：无法通过统一的业务状态码进行日志分析和问题追踪

## Proposed Solution

1. 将所有 Controller 中的 `Result.error("...")` 替换为 `Result.error(ResponseCode.XXX, "...")`
2. 确保所有场景都使用已定义的 ResponseCode 枚举
3. 添加缺失的 ResponseCode 定义
4. 更新 API.md 文档中的响应示例

## Analysis

### 当前问题统计

通过代码分析发现：
- Controller 层有 **50+ 处**使用 `Result.error("...")` 字符串形式
- 主要问题类型：
  - "用户未登录" → 应使用 `ResponseCode.UNAUTHORIZED`
  - "订单不存在" → 应使用 `ResponseCode.ORDER_NOT_FOUND`
  - "分类不存在" → 应使用 `ResponseCode.CATEGORY_NOT_FOUND`
  - "评论不存在" → 应使用 `ResponseCode.COMMENT_NOT_FOUND`
  - "会员等级不存在" → 应使用 `ResponseCode.MEMBER_LEVEL_NOT_FOUND`
  - "积分兑换商品不存在" → 应使用 `ResponseCode.POINTS_PRODUCT_NOT_FOUND`

### 需要新增的 ResponseCode

部分场景缺少对应的 ResponseCode，需要新增：
- `SIGN_IN_FAILED` - 签到失败（可能是已签到）
- `FAVORITE_NOT_FOUND` - 收藏记录不存在
- `ORDER_ALREADY_PAID` - 订单已支付
- `ORDER_ALREADY_CANCELLED` - 订单已取消
- `CATEGORY_HAS_PRODUCTS` - 分类下存在商品
- `MEMBER_LEVEL_UPDATE_FAILED` - 会员等级更新失败
- `MEMBER_LEVEL_CREATE_FAILED` - 会员等级创建失败
- `POINTS_PRODUCT_CREATE_FAILED` - 积分兑换商品创建失败
- `POINTS_PRODUCT_UPDATE_FAILED` - 积分兑换商品更新失败

## Impact Assessment

### Affected Components

- **Controller 层**：所有后台管理 Controller（AdminXxxController）和部分前端 Controller
- **ResponseCode 枚举**：添加缺失的状态码定义
- **API.md 文档**：更新响应示例使用正确的业务状态码

### Risk Assessment

- **风险等级**: 低
- **原因**: 仅替换错误返回方式，不改变业务逻辑

## Success Criteria

1. 所有 Controller 不再使用字符串形式的 `Result.error("...")`
2. 所有场景都有对应的 ResponseCode 定义
3. API.md 文档中的响应示例使用正确的业务状态码
4. 所有测试通过

