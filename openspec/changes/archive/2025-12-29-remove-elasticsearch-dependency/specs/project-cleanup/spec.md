# project-cleanup Specification

## Purpose
清理项目中未使用的 Elasticsearch 依赖和配置，保持使用 MySQL + Redis 的搜索方案。

## ADDED Requirements

### Requirement: Remove Elasticsearch Maven dependency
项目 MUST 从 pom.xml 中移除 spring-boot-starter-data-elasticsearch 依赖。

#### Scenario: Verify ES dependency removed
**Given** pom.xml 文件存在
**When** 检查依赖列表
**Then** 不应包含 spring-boot-starter-data-elasticsearch
**And** 不应包含任何 elasticsearch 相关依赖

#### Scenario: Project builds successfully
**Given** ES 依赖已移除
**When** 执行 mvn clean package
**Then** 项目编译成功
**And** 生成的 jar 包不包含 ES 相关类

---

### Requirement: Remove Elasticsearch application configuration
系统 MUST 从 application.yml 中移除 Elasticsearch 配置项。

#### Scenario: Verify application.yml cleaned
**Given** application.yml 文件存在
**When** 检查配置内容
**Then** 不应包含 spring.elasticsearch 配置
**And** 不应包含 elasticsearch.uris 属性

#### Scenario: Application starts without ES
**Given** ES 配置已移除
**When** 启动 Spring Boot 应用
**Then** 应用正常启动
**And** 不出现 ES 连接错误日志

---

### Requirement: Product search remains functional
移除 ES 后，商品搜索功能 MUST 继续正常工作。

#### Scenario: Search by keyword works
**Given** 商品数据存在于 MySQL
**When** 调用商品搜索接口传递关键词
**Then** 返回匹配的商品列表
**And** 使用 MySQL LIKE 查询

#### Scenario: Search with category filter works
**Given** 商品按分类存储
**When** 调用商品搜索接口传递分类ID和关键词
**Then** 返回该分类下匹配的商品列表
