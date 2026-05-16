## ADDED Requirements

### Requirement: 系统架构概览文档
`docs/architecture.md` SHALL 提供完整的系统架构概览，包含系统架构图、后端架构、前端架构和部署架构。

#### Scenario: 读者理解整体系统架构
- **WHEN** 读者打开 docs/architecture.md
- **THEN** 看到 Mermaid 绘制的系统架构图（前端 → Nginx → 后端 → MySQL/Redis/RabbitMQ）
- **AND** 看到后端模块化架构说明（modules/ 下各业务模块）
- **AND** 看到前端架构说明（Vue 3 + Naive UI 管理端 / 用户端）

#### Scenario: 读者理解后端模块划分
- **WHEN** 读者查看后端架构部分
- **THEN** 看到各业务模块的职责说明（user、product、order、coupon、points、comment、favorite、upload、admin、payment、inventory）
- **AND** 看到公共层和基础设施层说明（common、infrastructure）

#### Scenario: 读者理解部署架构
- **WHEN** 读者查看部署架构部分
- **THEN** 看到前后端独立 Docker 部署的架构图
- **AND** 理解 Nginx 反向代理如何分发前端静态文件和后端 API

### Requirement: 架构图使用 Mermaid
所有架构图 SHALL 使用 Mermaid 语法内嵌 Markdown。

#### Scenario: 架构图在 GitHub 正常渲染
- **WHEN** 读者在 GitHub 上查看架构文档
- **THEN** Mermaid 图表正常渲染为可视化图表
