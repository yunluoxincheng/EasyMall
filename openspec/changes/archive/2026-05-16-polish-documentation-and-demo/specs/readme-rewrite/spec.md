## ADDED Requirements

### Requirement: README 突出项目定位与亮点
README 顶部 SHALL 包含项目名称、一句话定位和核心亮点列表，突出企业级交易链路设计。

#### Scenario: 读者快速了解项目价值
- **WHEN** 读者打开 README.md
- **THEN** 第一眼看到项目名称和一句话定位（如"基于 Spring Boot + Redis + RabbitMQ 的企业级 B2C 商城系统"）
- **AND** 看到核心亮点列表（订单状态机、库存锁定、支付幂等、MQ 延迟关单等）

#### Scenario: README 包含完整技术栈
- **WHEN** 读者查看技术栈部分
- **THEN** 看到后端（Spring Boot、MySQL、Redis、RabbitMQ、MyBatis Plus、Spring Security + JWT）
- **AND** 看到前端（Vue 3、Vite、TypeScript、Naive UI、Pinia）
- **AND** 看到工程化（Docker Compose、GitHub Actions CI、Flyway）

### Requirement: README 包含核心流程概览
README SHALL 包含核心交易流程的简化描述，让读者快速理解系统设计深度。

#### Scenario: 读者理解订单交易流程
- **WHEN** 读者查看"核心流程设计"部分
- **THEN** 能理解"下单 → 锁库存 → 支付 → 确认库存 → 超时自动取消"的完整链路

#### Scenario: 读者理解库存锁定模型
- **WHEN** 读者查看库存相关描述
- **THEN** 能理解"可售库存 / 锁定库存 / 已售库存"三态分离的设计

### Requirement: README 包含项目结构和快速开始
README SHALL 包含清晰的目录结构和一键启动说明。

#### Scenario: 读者理解项目结构
- **WHEN** 读者查看"项目结构"部分
- **THEN** 看到前后端分离的目录树（easymall-backend、easymall-frontend、docs）
- **AND** 每个子项目各自包含独立的 Dockerfile 和 docker-compose.yml

#### Scenario: 读者快速启动项目
- **WHEN** 读者查看"快速开始"部分
- **THEN** 能按步骤完成环境准备、配置、启动

### Requirement: README 包含文档索引
README SHALL 提供指向 docs/ 目录下各文档的链接。

#### Scenario: 读者导航到详细文档
- **WHEN** 读者查看"文档"部分
- **THEN** 看到架构文档、业务设计文档、数据库文档、前端指南、部署指南的链接
