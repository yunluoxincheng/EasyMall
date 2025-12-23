# enhanced-api-response Specification

## Purpose
TBD - created by archiving change improve-api-response. Update Purpose after archive.
## Requirements
### Requirement: 增强的 API 响应结构

系统所有 API 端点 SHALL 返回增强的统一响应结构，包含以下字段：

#### Scenario: 成功响应包含时间戳和追踪 ID

**When** 客户端调用任意 API 端点并请求成功
**Then** 响应包含：
- `success`: true
- `timestamp`: ISO 8601 格式的响应时间
- `traceId`: 16 位唯一追踪标识符

**Example Response:**
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "操作成功",
  "timestamp": "2024-01-15T10:30:00.123",
  "traceId": "a1b2c3d4e5f6g7h8",
  "data": {
    "id": 1,
    "name": "商品名称"
  }
}
```

#### Scenario: 错误响应包含结构化错误详情

**When** 客户端请求导致业务错误或校验失败
**Then** 响应包含：
- `success`: false
- `errors`: 结构化的错误详情数组

**Example Response:**
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "参数校验失败",
  "timestamp": "2024-01-15T10:30:00.123",
  "traceId": "a1b2c3d4e5f6g7h8",
  "errors": [
    {
      "field": "productId",
      "code": "NOT_FOUND",
      "message": "ID为999的商品不存在",
      "rejectedValue": 999
    },
    {
      "field": "quantity",
      "code": "MIN_VALUE",
      "message": "数量必须大于0",
      "rejectedValue": -1
    }
  ]
}
```

### Requirement: 标准业务状态码

系统 SHALL 使用 `ResponseCode` 枚举定义标准业务状态码，确保状态码一致性。

#### Scenario: 使用预定义的业务状态码

**When** Controller 或 Service 返回结果
**Then** 使用 `ResponseCode` 枚举中的状态码：
- `SUCCESS` - 操作成功
- `ERROR` - 一般业务错误
- `VALIDATION_ERROR` - 参数校验失败
- `NOT_FOUND` - 资源不存在
- `UNAUTHORIZED` - 未授权访问
- `FORBIDDEN` - 无权访问

#### Scenario: 业务异常携带状态码

**When** 抛出 `BusinessException`
**Then** 异常包含对应的 `ResponseCode`

**Example:**
```java
throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品不存在");
```

### Requirement: 请求追踪支持

系统 SHALL 为每个请求生成唯一的 traceId，用于日志关联和问题追踪。

#### Scenario: TraceId 在响应中返回

**When** 客户端发起请求
**Then** 响应包含唯一 `traceId`
**And** 同一请求的所有日志包含相同的 traceId

#### Scenario: TraceId 通过 MDC 传递

**When** 请求处理过程中
**Then** traceId 存储在 SLF4J MDC 中
**And** 日志格式可配置输出 traceId

**Example Log:**
```
2024-01-15 10:30:00.123 [a1b2c3d4e5f6g7h8] INFO  o.r.controller.ProductController - 获取商品详情, id=1
```

### Requirement: 向后兼容性

增强的响应结构 MUST 保持与现有代码的向后兼容。

#### Scenario: 现有静态方法继续可用

**When** 现有代码使用 `Result.success(data)` 或 `Result.error(message)`
**Then** 代码无需修改即可编译运行
**And** 响应自动填充新增字段（success、timestamp、traceId）

#### Scenario: 新字段有合理默认值

**When** 使用旧 API 创建 Result
**Then** `success` 根据 code 推断
**And** `timestamp` 自动设置为当前时间
**And** `traceId` 自动生成

### Requirement: 全局异常处理适配

全局异常处理器 SHALL 使用新的响应结构。

#### Scenario: 业务异常返回增强响应

**When** 抛出 `BusinessException`
**Then** 全局处理器返回包含完整字段的 Result
**And** 自动填充 traceId 和 timestamp

#### Scenario: 校验异常返回错误详情数组

**When** `@Valid` 注解的参数校验失败
**Then** 全局处理器将校验错误转换为 `ErrorDetail` 数组
**And** 每个字段错误对应一个 ErrorDetail

**Example:**
```java
// 请求: { "productId": -1, "quantity": 0 }
// 响应:
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "参数校验失败",
  "errors": [
    { "field": "productId", "code": "MIN", "message": "必须大于0", "rejectedValue": -1 },
    { "field": "quantity", "code": "NOT_NULL", "message": "数量不能为空", "rejectedValue": null }
  ]
}
```

### Requirement: 分页响应一致性

分页数据 SHALL 使用统一的包装结构，便于前端处理。

#### Scenario: 分页数据包含元信息

**When** API 返回分页结果
**Then** 响应包含：
- `total`: 总记录数
- `pageNum`: 当前页码
- `pageSize`: 每页大小
- `pages`: 总页数
- `list`: 数据列表

**Example Response:**
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "timestamp": "2024-01-15T10:30:00.123",
  "traceId": "a1b2c3d4e5f6g7h8",
  "data": {
    "total": 100,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 10,
    "list": [...]
  }
}
```

