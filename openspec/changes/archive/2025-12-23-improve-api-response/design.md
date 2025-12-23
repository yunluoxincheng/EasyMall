# improve-api-response - Design

## Architecture Overview

改进后的 API 响应系统采用**统一响应包装器**模式，所有 API 响应都通过 `Result<T>` 类返回。

```
┌─────────────────────────────────────────────────────────────┐
│                         Result<T>                            │
├─────────────────────────────────────────────────────────────┤
│  success: Boolean         │  请求是否成功                     │
│  code: String             │  业务状态码（与 ResponseCode 枚举）│
│  message: String          │  响应消息                         │
│  timestamp: LocalDateTime │  响应时间戳                       │
│  traceId: String          │  请求追踪 ID                      │
│  data: T                  │  响应数据                         │
│  errors: List<ErrorDetail>│  错误详情列表（可选）              │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. ResponseCode 枚举

```java
public enum ResponseCode {
    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    VALIDATION_ERROR(400, "参数校验失败"),
    NOT_FOUND(404, "资源不存在"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "无权访问"),
    // ... 更多业务状态码
    ;

    private final int httpStatus;
    private final String code;
    private final String message;
}
```

**设计决策：**
- 使用枚举确保状态码一致性
- `code` 使用 String 类型便于扩展（如 "PRODUCT_NOT_FOUND"）
- 保留 `httpStatus` 用于设置 HTTP 响应码

### 2. ErrorDetail 类

```java
@Data
@AllArgsConstructor
public class ErrorDetail {
    private String field;      // 出错字段
    private String code;       // 错误代码
    private String message;    // 错误消息
    private Object rejectedValue; // 被拒绝的值
}
```

**设计决策：**
- 简洁的错误信息结构，符合 RFC 7807 (Problem Details for HTTP APIs)
- `rejectedValue` 帮助调试，显示用户输入的实际值

### 3. Result 类重构

```java
@Data
public class Result<T> {
    private Boolean success;
    private String code;
    private String message;
    private LocalDateTime timestamp;
    private String traceId;
    private T data;
    private List<ErrorDetail> errors;

    // 静态工厂方法保持向后兼容
    public static <T> Result<T> success(T data) { ... }
    public static <T> Result<T> error(String message) { ... }
    // ...
}
```

**设计决策：**
- 保持现有静态方法签名，确保向后兼容
- 新增字段有默认值，不影响现有代码
- `success` 字段简化前端判断（只需检查 Boolean 而非记忆数字 code）

### 4. TraceId 生成

使用 UUID + MDC (Mapped Diagnostic Context) 实现：

```java
public class TraceIdUtil {
    private static final String TRACE_ID_KEY = "traceId";

    public static String getOrCreate() {
        String traceId = MDC.get(TRACE_ID_KEY);
        if (traceId == null) {
            traceId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            MDC.put(TRACE_ID_KEY, traceId);
        }
        return traceId;
    }

    public static void clear() {
        MDC.remove(TRACE_ID_KEY);
    }
}
```

**设计决策：**
- 使用 MDC 便于在日志中关联 traceId
- UUID 截取 16 位平衡可读性和唯一性

## GlobalExceptionHandler 增强

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        Result<Void> result = Result.error(e.getResponseCode());
        result.setTraceId(TraceIdUtil.getOrCreate());

        // 如果异常包含错误详情，填充 errors 数组
        if (e.getErrors() != null) {
            result.setErrors(e.getErrors());
        }

        return result;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidException(MethodArgumentNotValidException e) {
        Result<Void> result = Result.error(ResponseCode.VALIDATION_ERROR);
        result.setTraceId(TraceIdUtil.getOrCreate());

        // 将校验错误转换为 ErrorDetail 列表
        List<ErrorDetail> errors = e.getBindingResult().getFieldErrors().stream()
            .map(fe -> new ErrorDetail(
                fe.getField(),
                "VALIDATION_ERROR",
                fe.getDefaultMessage(),
                fe.getRejectedValue()
            ))
            .collect(Collectors.toList());
        result.setErrors(errors);

        return result;
    }
}
```

## Backward Compatibility

为确保平滑过渡：

1. **现有静态方法保持兼容**：`Result.success(data)` 仍然可用
2. **新字段有默认值**：现有代码无需修改即可编译
3. **渐进式迁移**：先更新异常处理器，再逐步更新 Controller

## Trade-offs

| 决策 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| code 类型：String vs Integer | String 更语义化，易扩展 | Integer 性能稍好，占用更小 | String - 可读性更重要 |
| traceId 位置：Header vs Body | Body 简单，无需额外配置 | Header 更符合标准 | Body - 简化实现 |
| errors 类型：List vs 单个 | List 支持多错误 | 单个更简单 | List - 支持批量校验 |
| 时间戳格式：LocalDateTime vs Long | DateTime 可读性好 | Long 性能更好 | LocalDateTime - 便于调试 |

## Future Considerations

1. **国际化支持**：`message` 可根据 Accept-Language 返回不同语言
2. **帮助文档链接**：错误响应可添加 `help` URL 字段
3. **调试模式**：开发环境可返回请求路径、参数等调试信息
4. **OpenAPI 集成**：更新 API 文档以反映新的响应结构
