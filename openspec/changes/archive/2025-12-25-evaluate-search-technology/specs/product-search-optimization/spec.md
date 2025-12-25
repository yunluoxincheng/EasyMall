# 规范变更: 商品搜索优化

## 能力
`product-search-optimization`

## 变更类型
评估与优化

## MODIFIED Requirements

### Requirement: 商品搜索 MUST 使用合适的技术方案

商品搜索功能 SHALL 根据项目规模和需求选择合适的技术方案，避免过度设计。

#### Scenario: 评估项目规模选择搜索方案

**Given** 项目是一个课程实训项目
**And** 预期商品数量 < 10,000
**And** 搜索 QPS < 100
**When** 需要实现商品搜索功能
**Then** 系统 MUST 使用 MySQL 模糊查询或全文索引
**And** 系统 MUST NOT 引入 Elasticsearch

#### Scenario: 移除未使用的 Elasticsearch 依赖

**Given** pom.xml 中包含 Elasticsearch 依赖
**And** 项目中没有使用 Elasticsearch 的代码
**When** 清理项目依赖
**Then** 应从 pom.xml 中移除 spring-boot-starter-data-elasticsearch
**And** 应更新项目文档说明使用 MySQL 进行搜索

#### Scenario: 使用 MySQL FULLTEXT 优化搜索性能

**Given** 商品数量在 1,000 - 50,000 之间
**And** 搜索响应时间需要优化
**When** 优化搜索性能
**Then** 可为商品表的 name 和 subtitle 字段添加 FULLTEXT 索引
**And** 可使用 `MATCH ... AGAINST` 代替 `LIKE` 查询

#### Scenario: 添加搜索结果缓存

**Given** 存在热门搜索关键词
**And** 搜索请求较为频繁
**When** 优化搜索性能
**Then** 可使用 Redis 缓存热门搜索关键词的结果
**And** 缓存时间建议为 5 分钟
**And** 商品信息更新时应使相关缓存失效

---

## REMOVED Requirements

### Requirement: 引入 Elasticsearch 进行商品搜索（移除）

**Reason**: 对于课程实训项目规模，MySQL 已足够满足需求，引入 Elasticsearch 增加了不必要的复杂度。

#### Scenario: 不再引入 Elasticsearch（已移除）

**Given** 项目需要商品搜索功能
**When** 实现搜索功能
**Then** 不应引入 Elasticsearch
**And** 应使用 MySQL 实现搜索

---

## ADDED Requirements

### Requirement: 仅在特殊情况下 MAY 使用 Elasticsearch

在特定情况下（如求职作品集、技术展示需求），系统 MAY 使用 Elasticsearch 实现搜索功能。如果选择使用 Elasticsearch，系统 MUST 完整实现所有相关功能。

#### Scenario: 技术展示需要使用 Elasticsearch

**Given** 项目需要展示搜索引擎技术
**Or** 项目用于求职作品集
**And** 有充足时间完成开发（4-6 小时）
**When** 实现商品搜索功能
**Then** 系统 MAY 引入 Elasticsearch
**And** 系统 MUST 完整实现以下功能:
  - 创建 ES Document 映射
  - 实现 ES Repository
  - 实现数据同步逻辑
  - 实现搜索服务
  - 编写单元测试
**And** 系统 MUST NOT 只引入依赖而不实现代码

#### Scenario: 降级策略

**Given** 使用 Elasticsearch 进行搜索
**And** Elasticsearch 服务不可用
**When** 执行搜索操作
**Then** 应降级到 MySQL 搜索
**And** 应记录降级日志
