## Why

EasyMall 已完成订单状态机、库存锁定、支付幂等、MQ 延迟关单、优惠券生命周期、积分流水幂等核心交易链路重构，并已有约 12 个单元测试文件（~2979 行）。但这些测试覆盖面不够均匀——缺少控制器层测试、缺少核心交易链路端到端集成测试、缺少 CI 自动化。项目作为作品集展示，必须有可靠的测试和持续集成保障。

## What Changes

- 补充控制器层单元测试（MockMvc 方式，覆盖核心 API 端点）
- 补充服务层缺失的单元测试（购物车、收藏、评论、签到、用户、商品管理等模块）
- 添加核心交易链路集成测试（创建订单→锁定库存→支付→确认库存→完成，验证服务编排；MQ 消费者独立测试）
- 添加 GitHub Actions CI 工作流（后端测试 + 前端构建）
- 统一测试基础设施（通用测试配置、测试数据工厂、Mock 配置）

## Capabilities

### New Capabilities
- `backend-unit-tests`: 后端各模块控制器和服务层单元测试补充，覆盖购物车、收藏、评论、签到、用户、商品管理、分类管理等模块
- `backend-integration-tests`: 核心交易链路服务编排集成测试，验证订单→库存→支付跨模块事务
- `github-actions-ci`: GitHub Actions 持续集成工作流，自动运行后端测试和前端构建

### Modified Capabilities

（无现有 spec 需要修改）

## Impact

- **代码**: `easymall-backend/src/test/` 目录新增大量测试文件
- **依赖**: 添加 Flyway 数据库迁移 + Testcontainers MySQL 测试容器
- **CI**: 新增 `.github/workflows/` 目录
- **构建**: Maven test 阶段将运行更多测试，构建时间增加
