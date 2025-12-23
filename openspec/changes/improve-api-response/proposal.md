# improve-api-response

## Summary

改进 API 响应结构，使返回信息更详细、直观和易于理解。

## Motivation

当前 `Result` 类仅包含 `code`、`message`、`data` 三个字段，存在以下问题：

1. **缺少时间戳**：无法知道请求的处理时间
2. **缺少请求追踪**：无法关联同一请求的日志
3. **缺少详细信息**：错误时没有错误代码、帮助文档链接等辅助信息
4. **状态码混乱**：成功和错误都用自定义 code，没有遵循 HTTP 标准
5. **分页信息不统一**：分页数据混在 data 中，结构不一致
6. **调试困难**：开发阶段缺少路径、参数等调试信息

## Proposed Changes

### 核心改进

1. **添加时间戳字段** `timestamp`：记录响应生成时间
2. **添加请求 ID 字段** `traceId`：用于日志追踪和请求关联
3. **添加详细错误信息** `errors`：结构化的错误详情数组
4. **标准化状态码**：使用 `success` 布尔值 + `code` 业务状态码
5. **添加调试信息**（仅开发环境）：请求路径、参数等

### 新的响应结构

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "操作成功",
  "timestamp": "2024-01-15T10:30:00.123Z",
  "traceId": "abc123def456",
  "data": { ... }
}
```

错误响应：

```json
{
  "success": false,
  "code": "PRODUCT_NOT_FOUND",
  "message": "商品不存在",
  "timestamp": "2024-01-15T10:30:00.123Z",
  "traceId": "abc123def456",
  "errors": [
    {
      "field": "productId",
      "code": "NOT_FOUND",
      "message": "ID为123的商品不存在",
      "rejectedValue": 123
    }
  ],
  "help": "https://api.easymall.com/docs/errors#PRODUCT_NOT_FOUND"
}
```

## Scope

### In Scope
- 重构 `Result` 类，添加新字段
- 添加 `ResponseCode` 枚举，定义标准业务状态码
- 添加 `ErrorDetail` 类，结构化错误信息
- 更新 `GlobalExceptionHandler` 使用新的响应结构
- 更新全局配置，支持 traceId 生成
- 更新现有 Controller 的响应代码（渐进式）

### Out of Scope
- API 版本控制
- 国际化支持
- 请求日志增强（仅在需要时添加）
- 前端适配（前端需要配合调整）

## Dependencies

无外部依赖。内部需要：
- 修改 `Result.java`
- 修改 `GlobalExceptionHandler.java`
- 新增 `ResponseCode.java`
- 新增 `ErrorDetail.java`

## Timeline

1. Phase 1: 核心类改造
2. Phase 2: 异常处理器适配
3. Phase 3: 示例 Controller 更新
4. Phase 4: 测试验证

## Success Criteria

1. 所有 API 响应包含时间戳和 traceId
2. 错误响应包含结构化的错误详情数组
3. 现有功能不受影响
4. API 测试通过
