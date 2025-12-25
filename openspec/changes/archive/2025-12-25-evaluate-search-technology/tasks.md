# 任务列表: 评估商品搜索技术选型

## 任务

### 1. 移除未使用的 Elasticsearch 依赖 ✅
**优先级**: 中
**预计工作量**: 5 分钟

**描述**:
从 pom.xml 中移除未使用的 Elasticsearch 依赖，避免误导和不必要的依赖

**验证**:
- [x] pom.xml 中不再包含 spring-boot-starter-data-elasticsearch
- [x] 项目能正常编译和运行

---

### 2. 更新项目文档 ✅
**优先级**: 中
**预计工作量**: 10 分钟

**描述**:
更新 README.md 和 CLAUDE.md 文档，移除 Elasticsearch 相关说明

**验证**:
- [x] README.md 中不再提及 Elasticsearch（改为"基于 MySQL 模糊查询"）
- [x] CLAUDE.md 中更新技术栈说明
- [x] 移除 docker-compose.yml 中的 ES 配置
- [x] 移除 .env 中的 ES 配置

---

### 3. MySQL 全文索引优化 ✅
**优先级**: 低
**预计工作量**: 15 分钟

**描述**:
为商品表的 name 和 subtitle 字段添加 FULLTEXT 索引，优化搜索性能

**验证**:
- [x] 数据库迁移脚本中包含索引创建语句
- [x] 搜索查询支持 FULLTEXT 全文搜索
- [x] 同时保留 LIKE 模糊搜索作为备选

**实现细节**:
- 创建 V4__Add_fulltext_search_index.sql 迁移脚本
- 添加 selectProductPageWithFullText 方法使用 MATCH ... AGAINST
- 使用 ngram 分词器支持中文全文搜索
- 按相关性（relevance）排序结果
- 可通过 USE_FULLTEXT_SEARCH 配置开关切换搜索方式

---

### 4. 添加搜索结果缓存 ✅
**优先级**: 低
**预计工作量**: 30 分钟

**描述**:
使用 Redis 缓存热门搜索关键词的结果，减少数据库压力

**验证**:
- [x] 搜索结果会被缓存到 Redis
- [x] 缓存命中时直接返回缓存结果
- [x] 缓存在商品信息更新时失效

**实现细节**:
- 创建了 RedisConfig 配置类
- 修改了 ProductServiceImpl 添加缓存逻辑
- 商品搜索、热门商品、新品列表都添加了缓存
- 商品增删改时自动清除相关缓存
- 缓存过期时间：5分钟

---

### 5. （备选）完整实现 Elasticsearch 集成
**优先级**: 仅在需要时执行
**预计工作量**: 4-6 小时

**描述**:
如果项目需要展示搜索引擎技术，完整实现 ES 集成

**子任务**:
1. 创建 Product 实体的 ES Document 映射
2. 实现 ProductRepository 接口
3. 实现商品数据同步到 ES 的服务
4. 实现基于 ES 的商品搜索服务
5. 添加 ES 配置到 docker-compose
6. 编写单元测试验证搜索功能

**验证**:
- [ ] 商品数据自动同步到 ES
- [ ] 搜索接口返回正确的搜索结果
- [ ] 支持中文分词搜索
- [ ] 有完整的单元测试覆盖

---

## 依赖关系

- 任务 1 和 2 可以并行执行
- 任务 3 和 4 可以并行执行
- 任务 5 是独立方案，与其他任务互斥
