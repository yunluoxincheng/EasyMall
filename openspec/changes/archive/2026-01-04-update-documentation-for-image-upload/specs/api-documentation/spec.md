# api-documentation Specification Delta

## ADDED Requirements

### Requirement: 图片上传接口文档

API 文档 SHALL 包含完整的图片上传相关接口说明。

#### Scenario: 查看图片上传接口章节
- **WHEN** 开发者查看 docs/API.md 文档
- **THEN** 应该看到"图片上传模块"或类似章节
- **AND** 应该包含以下接口：
  - POST /api/upload/image - 单图上传
  - POST /api/upload/images - 多图上传
  - DELETE /api/upload/image - 删除图片

#### Scenario: 查看单图上传接口文档
- **WHEN** 开发者查看单图上传接口说明
- **THEN** 应该包含完整的请求参数表格（file、type）
- **AND** 应该说明 type 参数的合法值（product、avatar）
- **AND** 应该提供请求示例（cURL 或 HTTP 格式）
- **AND** 应该提供成功响应示例（包含 url、filename、size、relativePath）
- **AND** 应该说明需要 JWT 认证

#### Scenario: 查看多图上传接口文档
- **WHEN** 开发者查看多图上传接口说明
- **THEN** 应该包含完整的请求参数表格（files、type）
- **AND** 应该说明 type 参数仅支持 product
- **AND** 应该提供请求示例
- **AND** 应该提供成功响应示例（包含 urls 数组和 count）
- **AND** 应该说明需要 JWT 认证

#### Scenario: 查看删除图片接口文档
- **WHEN** 开发者查看删除图片接口说明
- **THEN** 应该包含完整的请求参数表格（path）
- **AND** 应该说明 path 参数为图片相对路径
- **AND** 应该提供请求示例
- **AND** 应该说明需要管理员权限（ADMIN）

---

### Requirement: 图片上传错误码文档

API 文档 SHALL 说明图片上传相关接口的错误码。

#### Scenario: 查看图片上传错误码
- **WHEN** 开发者查看图片上传接口的错误处理
- **THEN** 应该包含以下错误码说明：
  - FILE_EMPTY - 文件为空
  - FILE_TOO_LARGE - 文件大小超过限制
  - INVALID_FILE_TYPE - 不支持的文件类型
  - INVALID_FILE_CONTENT - 文件内容不合法
  - FILE_UPLOAD_FAILED - 文件上传失败
  - FILE_NOT_FOUND - 文件不存在
  - FILE_DELETE_FAILED - 文件删除失败
- **AND** 每个错误码应该包含 HTTP 状态码和错误描述

---

### Requirement: 图片上传接口安全说明

API 文档 SHALL 说明图片上传接口的安全机制。

#### Scenario: 查看文件类型限制说明
- **WHEN** 开发者查看图片上传接口的安全限制
- **THEN** 应该说明支持的文件类型（jpg、jpeg、png、gif）
- **AND** 应该说明文件大小限制（如 5MB）
- **AND** 应该说明进行文件内容验证（魔数检查）

#### Scenario: 查看认证和权限说明
- **WHEN** 开发者查看接口权限要求
- **THEN** 应该说明上传接口需要 JWT 认证
- **AND** 应该说明删除接口需要管理员权限
- **AND** 应该提供在请求头中携带 token 的示例

---

### Requirement: 图片上传使用示例

API 文档 SHALL 提供前端集成示例代码。

#### Scenario: 查看 JavaScript/Axios 上传示例
- **WHEN** 前端开发者需要集成图片上传功能
- **THEN** 应该提供使用 Axios 的上传示例代码
- **AND** 示例应该展示如何构造 FormData
- **AND** 示例应该展示如何设置 Authorization 请求头
- **AND** 示例应该展示如何处理响应和错误

#### Scenario: 查看 cURL 命令行示例
- **WHEN** 开发者需要测试图片上传接口
- **THEN** 应该提供 cURL 命令示例
- **AND** 示例应该展示如何上传本地文件
- **AND** 示例应该展示如何设置 Authorization 请求头

---

### Requirement: 图片访问 URL 格式说明

API 文档 SHALL 说明上传成功后图片的访问 URL 格式。

#### Scenario: 查看图片 URL 格式
- **WHEN** 开发者查看上传响应中的 url 字段
- **THEN** 应该说明 URL 格式为 `http://{host}/uploads/{type}/{year}/{month}/{filename}`
- **AND** 应该提供具体的 URL 示例
- **AND** 应该说明可以直接通过浏览器访问该 URL 查看图片

#### Scenario: 查看相对路径说明
- **WHEN** 开发者查看上传响应中的 relativePath 字段
- **THEN** 应该说明相对路径格式为 `{type}/{year}/{month}/{filename}`
- **AND** 应该说明该路径用于删除图片时的参数
