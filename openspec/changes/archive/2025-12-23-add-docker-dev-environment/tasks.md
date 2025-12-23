# Tasks: add-docker-dev-environment

## Task List
1. [x] 创建 .dockerignore 文件，排除不必要的文件构建上下文
2. [x] 创建基于 eclipse-temurin:17-jdk 的 Dockerfile，安装 Maven 并配置工作目录
3. [x] 创建 docker-compose.yml，定义 app、mysql、redis、elasticsearch 四个服务
4. [x] 创建 .env 文件，包含所有服务的环境变量配置
5. [x] 创建 docker-dev.yml 配置文件，专门用于开发环境的卷挂载和热重载
6. [x] 更新 README.md，添加 Docker 开发环境使用说明

## Validation
- [ ] `docker-compose build` 成功构建镜像
- [ ] `docker-compose up` 成功启动所有服务
- [ ] 修改源代码后应用自动重启（验证热重载）
- [ ] 应用可以成功连接 MySQL、Redis、Elasticsearch
- [ ] 数据库数据在容器重启后持久化
- [ ] API 接口正常响应

## Dependencies
所有任务顺序执行，后续任务依赖前面的配置文件
