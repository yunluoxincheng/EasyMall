# 设计文档: 商品搜索技术选型评估

## 概述

本文档详细分析 EasyMall 项目的商品搜索功能，对比 MySQL 模糊查询和 Elasticsearch 两种技术方案，给出明确的技术选型建议。

## 当前实现分析

### 现有搜索实现

**位置**: `ProductMapper.xml:36-40`

```xml
<if test="keyword != null and keyword != ''">
    AND (p.name LIKE CONCAT('%', #{keyword}, '%')
         OR p.subtitle LIKE CONCAT('%', #{keyword}, '%')
         OR p.description LIKE CONCAT('%', #{keyword}, '%'))
</if>
```

**搜索字段**:
- 商品名称 (name)
- 商品副标题 (subtitle)
- 商品描述 (description)

**查询特点**:
- 使用 `LIKE '%keyword%'` 进行模糊匹配
- 三个字段 OR 连接
- 无法利用普通索引（前导通配符导致索引失效）

### 性能特征

**MySQL LIKE 查询**:
- 小数据量（< 1,000 行）: 响应时间 < 50ms
- 中等数据量（1,000-10,000 行）: 响应时间 50-200ms
- 大数据量（> 10,000 行）: 响应时间 > 200ms，性能下降明显

**索引失效原因**:
- `LIKE '%keyword%'` 前导通配符导致 B-Tree 索引无法使用
- 只能通过全表扫描进行匹配

## 技术方案对比

### 方案 A: MySQL 优化方案

#### A1. 保持现状（最小改动）

**实现**: 无需代码修改

**适用场景**:
- 商品数量 < 5,000
- 搜索 QPS < 50

**优点**:
- 零开发成本
- 系统简单

**缺点**:
- 大数据量下性能问题
- 无高级搜索功能

#### A2. FULLTEXT 全文索引

**实现**:
```sql
-- 添加全文索引
ALTER TABLE product
ADD FULLTEXT INDEX ft_search (name, subtitle) WITH PARSER ngram;

-- 修改查询
WHERE MATCH(p.name, p.subtitle) AGAINST(#{keyword} IN BOOLEAN MODE)
```

**适用场景**:
- 商品数量 < 50,000
- 需要 MySQL 原生全文搜索

**优点**:
- 利用 MySQL 内置全文索引
- 支持中文（ngram 分词）
- 性能优于 LIKE

**缺点**:
- 中文分词效果不如 ES
- 功能相对基础

#### A3. MySQL + Redis 缓存

**实现**:
```java
// 热门搜索关键词缓存
String cacheKey = "search:" + keyword;
List<Product> cached = redisTemplate.opsForValue().get(cacheKey);
if (cached != null) {
    return cached;
}
// 查询数据库
List<Product> result = productMapper.search(keyword);
// 缓存结果（5分钟过期）
redisTemplate.opsForValue().set(cacheKey, result, 5, TimeUnit.MINUTES);
```

**适用场景**:
- 热门搜索词集中
- 对搜索响应时间有要求

**优点**:
- 大幅降低数据库压力
- 提升热门搜索响应速度

**缺点**:
- 需要维护缓存一致性
- 冷搜索无加速效果

### 方案 B: Elasticsearch 方案

#### 架构设计

```
                    ┌─────────────┐
                    │   前端      │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Controller  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼────┐  ┌────▼────┐  ┌──▼────────┐
         │ Service │  │ Service │  │ Sync Job  │
         └────┬────┘  └────┬────┘  └────┬──────┘
              │            │            │
         ┌────▼────┐  ┌────▼────┐  ┌──▼────────┐
         │ ES Repo │  │ DB Repo │  │ MQ / Job  │
         └────┬────┘  └────┬────┘  └───────────┘
              │            │
         ┌────▼────┐  ┌────▼────┐
         │   ES    │  │  MySQL  │
         └─────────┘  └─────────┘
```

#### 数据同步策略

**实时同步（推荐用于课程实训）**:
```java
@Service
public class ProductServiceImpl {
    @Transactional
    public void saveProduct(ProductDTO dto) {
        // 1. 保存到 MySQL
        Product product = ...;
        productMapper.insert(product);

        // 2. 同步到 ES
        ProductDocument doc = convertToDocument(product);
        productRepository.save(doc);
    }
}
```

**异步同步（生产环境推荐）**:
```java
// 使用消息队列
public void saveProduct(ProductDTO dto) {
    productMapper.insert(product);
    rabbitTemplate.convertAndSend("product.sync", dto);
}

@RabbitListener(queues = "product.sync")
public void syncToEs(ProductDTO dto) {
    productRepository.save(convertToDocument(dto));
}
```

#### ES Document 设计

```java
@Document(indexName = "easymall_product")
public class ProductDocument {
    @Id
    private Long id;

    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String name;

    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String subtitle;

    @Field(type = FieldType.Keyword)
    private Long categoryId;

    @Field(type = FieldType.Keyword)
    private Integer status;

    @Field(type = FieldType.Double)
    private Double price;
}
```

## 推荐方案

### 最终推荐: 方案 A2（MySQL FULLTEXT）或 A1（保持现状）

**决策矩阵**:

| 评估维度 | MySQL | ES | 说明 |
|---------|-------|----|----|
| 项目复杂度 | ✅ 低 | ⚠️ 高 | 课程实训应控制复杂度 |
| 开发成本 | ✅ 低 | ⚠️ 高 | ES 需要额外 4-6 小时开发 |
| 维护成本 | ✅ 低 | ⚠️ 高 | ES 需要维护额外服务 |
| 搜索性能 | ✅ 足够 | ✅ 优秀 | 实训规模下 MySQL 足够 |
| 功能完整性 | ✅ 满足需求 | ✅ 更丰富 | 基础搜索 MySQL 足够 |
| 学习价值 | ⚠️ 一般 | ✅ 较高 | ES 是加分项但非必需 |
| 部署难度 | ✅ 简单 | ⚠️ 复杂 | ES 增加部署复杂度 |

### 使用建议

**推荐使用 MySQL 的场景**:
- ✅ 课程实训提交（避免过度设计）
- ✅ 快速开发迭代
- ✅ 项目展示重点不在搜索功能

**推荐使用 ES 的场景**:
- ✅ 项目需要展示搜索引擎技术
- ✅ 求职作品集（展示技术广度）
- ✅ 教师明确要求使用
- ✅ 预期商品数量 > 10,000

## 实施路径

### 路径 1: 优化 MySQL（推荐）

```yaml
步骤:
  1. 移除 pom.xml 中未使用的 ES 依赖
  2. 添加 FULLTEXT 索引（可选）
  3. 添加 Redis 缓存热门搜索（可选）
  4. 更新文档说明

预计时间: 30 分钟
复杂度: 低
```

### 路径 2: 引入 ES（备选）

```yaml
步骤:
  1. 创建 ES Document 实体
  2. 实现 ES Repository
  3. 实现数据同步逻辑
  4. 修改搜索服务
  5. 配置 Docker ES 服务
  6. 编写测试用例
  7. 更新文档

预计时间: 4-6 小时
复杂度: 中
```

## 风险与注意事项

### MySQL 方案风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 大数据量性能下降 | 中 | 添加 FULLTEXT 索引 |
| 无法高级搜索 | 低 | 课程实训不需要 |
| 中文分词效果差 | 低 | ngram 分词器足够 |

### ES 方案风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 数据不一致 | 高 | 实现同步检查机制 |
| ES 服务故障 | 高 | 降级到 MySQL 查询 |
| 资源占用高 | 中 | Docker 资源限制 |
| 开发周期长 | 中 | 合理安排开发时间 |

## 总结

对于 EasyMall 这样的课程实训项目：

1. **推荐使用 MySQL**（方案 A），除非有特殊需求
2. 移除未使用的 ES 依赖，避免误导
3. 如需展示 ES 技术，必须完整实现（不能只有依赖）
4. 优先保证项目核心功能完整性，而非引入过多技术

**核心原则**: 在满足功能需求的前提下，选择最简单、最可靠的方案。
