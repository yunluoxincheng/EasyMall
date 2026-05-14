## Why

积分系统当前缺少统一的幂等约束。`PointsRecord` 已有 `idempotencyKey` 字段，但仅用于订单积分（`order_points:{orderId}`），其他场景（评价、签到、兑换、管理员调整）均无幂等保护。同时 `type` 字段使用数字编码（1~6），`sourceId` 使用 Long 类型，无法覆盖所有业务来源，也不利于排查和追踪。如果 MQ 消费者重复投递或接口被重试，评价积分、签到积分等存在重复发放风险。

## What Changes

- `PointsRecord` 新增 `biz_type`（VARCHAR）和 `biz_id`（VARCHAR）字段，替代现有 `type` + `sourceId` 的数字编码模式
- 添加 `biz_type + biz_id` 唯一索引，实现所有积分场景的数据库级幂等约束
- `PointsTypeEnum` 保留用于展示描述，新增 `PointsBizType` 枚举定义业务类型字符串（`ORDER_COMPLETED`, `COMMENT_CREATED`, `DAILY_SIGN_IN`, `POINTS_EXCHANGE`, `ADMIN_ADJUST`, `REFUND_DEDUCT`）
- `IPointsService` 新增 `addPointsIdempotent` 和 `deductPointsIdempotent` 统一幂等方法
- 幂等方法采用"先写 ledger guard 再改余额"的执行顺序，确保唯一索引冲突时用户积分和会员等级不发生任何变更
- 所有积分调用点迁移到幂等方法：订单完成消费者、评价积分、签到积分、积分兑换、管理员调整
- `PointsExchangeServiceImpl` 调整执行顺序：先生成稳定兑换操作号/创建兑换记录，再扣减积分，确保兑换流水级幂等（同一 exchangeNo 不重复扣积分）；HTTP 超时重试不在本 change 覆盖范围，需要前端配合 requestId
- 所有生产调用迁移后，将 `addPointsWithIdempotencyKey` 等旧方法标记为 `@Deprecated`，本 change 不删除旧方法
- 管理员调整降级为"可追踪流水"场景，不声称具备重试幂等（每次调整产生独立 UUID 作为 biz_id，仅用于审计追踪）
- **BREAKING**: `points_record` 表结构变更，新增字段和唯一索引；`PointsService` 接口签名变更

## Capabilities

### New Capabilities
- `points-ledger-idempotency`: 积分流水的统一幂等机制，通过 `biz_type` + `biz_id` 唯一索引保证积分变动场景的幂等性。覆盖订单完成、评价、签到、兑换四种具备重试幂等的场景；管理员调整和退款扣减使用相同机制记录流水但不声称重试幂等

### Modified Capabilities
- `async-order-side-effects`: 订单完成异步发积分消费者改用新的幂等方法，移除消费者内部手动的 `idempotencyKey` 查询逻辑
- `coupon-system`: 积分兑换优惠券场景需要先生成兑换操作号再扣积分，确保兑换幂等；积分扣减改用幂等方法

## Impact

- **数据库**: `points_record` 表新增 `biz_type`、`biz_id` 列及唯一索引，需要 SQL 迁移脚本
- **服务接口**: `IPointsService` 接口新增方法，`addPointsWithIdempotencyKey` 等旧方法标记 `@Deprecated`
- **调用方**: `CommentServiceImpl`（签名变更）、`SignInServiceImpl`、`PointsExchangeServiceImpl`（执行顺序变更）、`OrderCompletedPointsConsumer`、`AdminUserController` 需要迁移到新方法
- **向后兼容**: 旧的 `type` 和 `sourceId` 字段保留不删除，新增字段初始为 NULL，迁移期间不影响旧数据查询
