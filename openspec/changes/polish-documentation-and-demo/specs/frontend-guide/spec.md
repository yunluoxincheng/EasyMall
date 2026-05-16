## ADDED Requirements

### Requirement: 前端开发指南文档
`docs/frontend-guide.md` SHALL 提供前端开发、构建和运行的完整指南。

#### Scenario: 开发者启动管理端前端
- **WHEN** 开发者查看管理端启动说明
- **THEN** 看到依赖安装、开发服务器启动、API 代理配置的完整步骤
- **AND** 理解管理端的技术栈（Vue 3、Naive UI、TypeScript）

#### Scenario: 开发者启动用户端前端
- **WHEN** 开发者查看用户端启动说明
- **THEN** 看到依赖安装、开发服务器启动的完整步骤
- **AND** 理解用户端的技术栈（Vue 3、Naive UI、TypeScript）

#### Scenario: 开发者构建前端生产版本
- **WHEN** 开发者查看构建说明
- **THEN** 看到 npm run build 命令和输出目录说明
- **AND** 理解 Docker 部署时的前端构建流程

#### Scenario: 开发者配置 API 代理
- **WHEN** 开发者查看代理配置说明
- **THEN** 理解开发环境如何通过 Vite 代理转发 /api 请求到后端
