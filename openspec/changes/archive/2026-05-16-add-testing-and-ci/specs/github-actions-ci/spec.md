## ADDED Requirements

### Requirement: Backend test workflow
系统 SHALL 提供 GitHub Actions 工作流，在 push 和 pull request 时自动运行后端 Maven 测试。

#### Scenario: Run tests on push to master
- **WHEN** 代码推送到 master 分支
- **THEN** GitHub Actions 自动运行 `mvn test`，所有测试通过后标记为成功

#### Scenario: Run tests on pull request
- **WHEN** 创建或更新 Pull Request 到 master 分支
- **THEN** GitHub Actions 自动运行 `mvn test`，PR 页面显示测试结果

### Requirement: Frontend build workflow
系统 SHALL 提供 GitHub Actions 工作流，在 push 和 pull request 时自动验证前端构建。

#### Scenario: Run build on push to master
- **WHEN** 代码推送到 master 分支且前端代码有变更
- **THEN** GitHub Actions 自动运行 `npm install && npm run build`，构建成功后标记为成功

### Requirement: Maven dependency caching
后端 CI 工作流 SHALL 缓存 Maven 依赖以加快构建速度。

#### Scenario: First run downloads dependencies
- **WHEN** 首次运行工作流
- **THEN** 下载 Maven 依赖并缓存

#### Scenario: Subsequent run uses cache
- **WHEN** 后续运行工作流且 pom.xml 未变更
- **THEN** 使用缓存的 Maven 依赖，跳过下载

### Requirement: Node dependency caching
前端 CI 工作流 SHALL 缓存 Node 依赖以加快构建速度。

#### Scenario: Subsequent run uses cache
- **WHEN** 后续运行工作流且 package-lock.json 未变更
- **THEN** 使用缓存的 Node 依赖
