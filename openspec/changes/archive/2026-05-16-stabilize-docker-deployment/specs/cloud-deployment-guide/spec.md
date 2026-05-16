## MODIFIED Requirements

### Requirement: 部署文档完整性
项目 MUST 提供完整的部署文档，SHALL 包含统一编排启动、RabbitMQ 配置、前端 Nginx 代理和故障排查指南。

#### Scenario: 统一编排快速开始
- **WHEN** 开发者首次部署
- **THEN** 文档提供根级别 `docker compose up -d` 一键启动说明
- **AND** 包含 `.env` 配置说明

#### Scenario: 故障排查指南
- **WHEN** 部署过程中遇到问题
- **THEN** 文档包含服务健康检查命令
- **AND** 文档包含日志查看命令
- **AND** 文档包含常见错误解决方案

#### Scenario: 环境变量参考
- **WHEN** 开发者查阅文档
- **THEN** 文档列出所有必需的环境变量及其说明
- **AND** 包含 `.env.example` 文件引用
