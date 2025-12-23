
# improve-api-response - Tasks

## Phase 1: 核心类改造

- [x] 1.1 创建 `ResponseCode` 枚举类
  - 定义标准业务状态码（SUCCESS、ERROR、VALIDATION_ERROR、NOT_FOUND 等）
  - 包含 code、message、httpStatus 属性

- [x] 1.2 创建 `ErrorDetail` 类
  - 字段：field（字段名）、code（错误代码）、message（错误消息）、rejectedValue（拒绝的值）
  - 使用 Lombok 注解简化代码

- [x] 1.3 重构 `Result` 类
  - 添加 `success`（Boolean）字段
  - 添加 `timestamp`（LocalDateTime）字段
  - 添加 `traceId`（String）字段
  - 添加 `errors`（List<ErrorDetail>）字段
  - 重命名 `code` 为业务状态码，类型改为 String（配合 ResponseCode）
  - 保持向后兼容的静态工厂方法

## Phase 2: 异常处理器适配

- [x] 2.1 更新 `GlobalExceptionHandler`
  - 使用新的 Result 结构
  - 生成 traceId（使用 UUID）
  - 为业务异常填充 errors 数组
  - 为校验异常生成结构化的 ErrorDetail

- [x] 2.2 更新 `BusinessException`
  - 支持错误详情列表
  - 支持业务状态码（ResponseCode）

## Phase 3: 工具类增强

- [x] 3.1 创建 `TraceIdUtil` 工具类
  - 生成 traceId
  - 从 MDC 获取/设置 traceId

- [ ] 3.2 创建 `ResultBuilder` 辅助类（可选）
  - 简化 Result 构建的流式 API

## Phase 4: 示例更新与测试

- [ ] 4.1 更新示例 Controller
  - 选择 1-2 个 Controller 作为示例
  - 展示新的 Result 使用方式

- [x] 4.2 更新 API 测试文件
  - 验证新的响应格式
  - 确保 test-api.http 中的测试用例能正常工作

- [ ] 4.3 添加单元测试
  - Result 类测试
  - ResponseCode 枚举测试
  - ErrorDetail 类测试
  - GlobalExceptionHandler 测试

## Phase 5: 文档更新

- [x] 5.1 更新 CLAUDE.md
  - 记录新的 Result 使用方式

- [x] 5.2 修改现有 API 文档
  - 更新 docs/API.md 中的响应结构说明
  - 更新所有响应示例为新的增强格式

## 并行可执行任务

Phase 1 中的任务 1.1、1.2 可以并行执行。
Phase 3 中的任务 3.1、3.2 可以在 Phase 1 完成后并行执行。
Phase 4 中的任务 4.1、4.2 可以并行执行。

## 验证标准

每个阶段完成后：
- 代码编译通过
- 相关单元测试通过
- 运行应用，手动测试 API 响应格式正确
