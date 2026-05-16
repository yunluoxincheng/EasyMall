## MODIFIED Requirements

### Requirement: 技术栈文档准确性
README 中的技术栈部分 SHALL 准确反映项目全栈技术，包括后端、前端、消息队列和工程化工具链。

#### Scenario: 用户查看项目技术栈
- **WHEN** 用户打开 README.md 文件并查看"技术栈"部分
- **THEN** 应该看到后端（JDK 17、Spring Boot 4.0.1、MySQL 8、Redis、RabbitMQ、MyBatis Plus、Spring Security + JWT）
- **AND** 应该看到前端（Vue 3、Vite、TypeScript、Naive UI、Pinia、Axios）
- **AND** 应该看到工程化（Docker Compose、GitHub Actions CI、Flyway、Maven）
- **AND** 不应包含 Elasticsearch（已移除）

#### Scenario: 查看性能优化说明
- **WHEN** 用户阅读性能优化部分
- **THEN** 应说明商品搜索使用 MySQL 全文索引（FULLTEXT）+ Redis 缓存
- **AND** 应说明 RabbitMQ 用于异步事件驱动（延迟关单、积分发放、缓存清理）

## REMOVED Requirements

### Requirement: 待完善功能列表准确性
**Reason**: README 重写后不再保留"待完善功能"列表，改为亮点驱动结构
**Migration**: 项目待完善事项在路线图文档中跟踪，不在 README 展示

### Requirement: 图片上传文档引用
**Reason**: 图片上传不再是独立亮点，合并到功能列表描述中
**Migration**: 图片上传功能说明整合到 README 功能模块描述中
