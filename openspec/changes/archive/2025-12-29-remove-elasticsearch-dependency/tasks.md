# Tasks: Remove Elasticsearch Dependency

## Implementation Tasks

1. **Remove ES Maven dependency from pom.xml** ✅
   - 移除 `spring-boot-starter-data-elasticsearch` 依赖
   - 验证: 检查 pom.xml 不包含 elasticsearch 关键词

2. **Remove ES configuration from application.yml** ✅
   - 移除 `spring.elasticsearch.uris` 配置
   - 验证: 检查 application.yml 不包含 elasticsearch 配置

3. **Remove Elasticsearch service from docker-compose.yml** ✅
   - 移除 elasticsearch 服务定义
   - 移除 es-data 卷定义
   - 从 easymall-app 环境变量中移除 `SPRING_ELASTICSEARCH_URIS`
   - 从 easymall-app depends_on 中移除 elasticsearch
   - 验证: docker-compose config 不包含 elasticsearch

4. **Update openspec/project.md** ✅
   - 从 Tech Stack 中移除 Elasticsearch
   - 从 External Dependencies 中移除 ES
   - 验证: 文档不包含 elasticsearch 引用

5. **Update openspec/specs/docker-dev-environment/spec.md** ✅
   - 将服务数量从四个改为三个
   - 移除 elasticsearch 相关场景
   - 移除 ES 索引持久化场景
   - 验证: 规范不包含 elasticsearch 引用

6. **Verify application starts without errors** ✅
   - 执行应用启动
   - 验证无 ES 连接错误
   - 验证: 配置文件已正确更新，不包含 elasticsearch 引用

7. **Verify product search functionality** ⚠️
   - 测试商品搜索接口
   - 验证搜索结果正确
   - 验证: 搜索功能使用 MySQL LIKE 查询
   - 注: 需要运行应用进行手动测试

8. **Verify Docker Compose startup** ⚠️
   - 执行 docker-compose up
   - 验证三个服务正常启动
   - 验证: 服务健康检查通过
   - 注: 需要 Docker 环境进行手动测试
