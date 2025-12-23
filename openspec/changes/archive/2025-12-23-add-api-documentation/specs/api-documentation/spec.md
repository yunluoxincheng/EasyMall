# api-documentation Spec Delta

## ADDED Requirements

### Requirement: API 文档存在性
项目 SHALL 提供完整的 API 接口文档，便于开发者查阅和集成。

#### Scenario: 文档位置与格式
- **WHEN** 开发者需要查看 API 文档
- **THEN** 应在项目根目录 `docs/API.md` 找到文档
- **AND** 文档格式应为 Markdown

#### Scenario: 文档内容完整性
- **WHEN** 查看 API 文档
- **THEN** 应包含所有 92 个接口的说明
- **AND** 每个接口应包含路径、方法、参数、响应示例
- **AND** 应包含认证方式和权限说明

### Requirement: API 文档结构
文档 SHALL 按模块组织，包含概述和详细接口说明。

#### Scenario: 概述部分内容
- **WHEN** 阅读文档概述部分
- **THEN** 应包含 API 基础 URL
- **AND** 应包含统一响应格式说明
- **AND** 应包含认证方式说明
- **AND** 应包含错误码说明

#### Scenario: 接口详情格式
- **WHEN** 查看某个接口的文档
- **THEN** 应包含接口名称、路径、HTTP 方法
- **AND** 应包含权限要求（公开/需认证/管理员）
- **AND** 应包含请求参数表格
- **AND** 应包含响应示例

### Requirement: 响应格式说明
文档 SHALL 说明统一的响应数据格式。

#### Scenario: 成功响应格式
- **WHEN** 接口调用成功
- **THEN** 响应应包含 `code: 200`
- **AND** 响应应包含 `message` 描述信息
- **AND** 响应应包含 `data` 业务数据

#### Scenario: 分页响应格式
- **WHEN** 接口返回分页数据
- **THEN** `data` 应包含 `total` 总记录数
- **AND** `data` 应包含 `records` 数据列表
- **AND** `data` 应包含 `pageNum` 当前页码
- **AND** `data` 应包含 `pageSize` 每页大小
- **AND** `data` 应包含 `pages` 总页数

### Requirement: 认证说明
文档 SHALL 说明 API 认证机制。

#### Scenario: JWT 认证说明
- **WHEN** 查看认证相关文档
- **THEN** 应说明使用 JWT Token 认证
- **AND** 应说明如何获取 token（登录接口）
- **AND** 应说明如何在请求头中携带 token（`Authorization: Bearer {token}`）

#### Scenario: 权限说明
- **WHEN** 查看接口权限要求
- **THEN** 应明确标注接口权限类型
- **AND** 权限类型应包括：公开、需认证、管理员
