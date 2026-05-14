## 1. Database Migration

- [x] 1.1 创建 SQL 迁移脚本，为 `points_record` 表新增 `biz_type VARCHAR(64)` 和 `biz_id VARCHAR(128)` 列
- [x] 1.2 在 `points_record` 表上新增 `UNIQUE KEY uk_biz (biz_type, biz_id)` 唯一索引

## 2. Domain Model

- [x] 2.1 新增 `PointsBizType` 枚举，定义 `ORDER_COMPLETED`、`COMMENT_CREATED`、`DAILY_SIGN_IN`、`POINTS_EXCHANGE`、`ADMIN_ADJUST`、`REFUND_DEDUCT` 六种业务类型，每个枚举值包含 `bizIdFormat` 说明
- [x] 2.2 为 `PointsRecord` 实体新增 `bizType` 和 `bizId` 字段

## 3. Service Layer — 幂等方法实现

- [x] 3.1 在 `IPointsService` 接口中新增 `addPointsIdempotent(userId, points, bizType, bizId, description)` 方法
- [x] 3.2 在 `IPointsService` 接口中新增 `deductPointsIdempotent(userId, points, bizType, bizId, description)` 方法
- [x] 3.3 实现 `addPointsIdempotent`：执行顺序为先 INSERT `points_record`（含 biz_type + biz_id）建立 ledger guard，INSERT 成功后再 UPDATE `user.points`；DuplicateKeyException 不在方法内捕获，让事务自然回滚
- [x] 3.4 实现 `deductPointsIdempotent`：先校验积分余额，然后先 INSERT `points_record` 建立 ledger guard，成功后再 UPDATE `user.points`；DuplicateKeyException 不在方法内捕获
- [x] 3.5 将旧的 `addPointsWithIdempotencyKey`、`addPoints(userId, points, type, sourceId, desc)`、`deductPoints(userId, points, type, sourceId, desc)`、`addPoints(userId, points, desc)` 方法标记为 `@Deprecated`

## 4. Caller Migration

- [x] 4.1 `OrderCompletedPointsConsumer`：移除手动 `idempotencyKey` 查询逻辑，改用 `addPointsIdempotent(ORDER_COMPLETED, orderId)`，外层捕获 `DuplicateKeyException` 并视为幂等成功（INFO 日志 + ACK）
- [x] 4.2 `CommentServiceImpl` + `PointsServiceImpl.addPointsForComment`：修改 `addPointsForComment` 签名增加 `orderId` 参数，内部改用 `addPointsIdempotent(COMMENT_CREATED, "comment:{orderId}:{productId}")`，`CommentServiceImpl` 调用点传入 `commentDTO.getOrderId()`
- [x] 4.3 `SignInServiceImpl.signIn`：改用 `addPointsIdempotent(DAILY_SIGN_IN, "sign:{userId}:{yyyy-MM-dd}")`
- [x] 4.4 `PointsExchangeServiceImpl.exchangeProduct`：调整执行顺序 — 先生成 `exchangeNo`，创建 `PointsExchange` 兑换记录（状态为处理中），再调用 `deductPointsIdempotent(POINTS_EXCHANGE, "exchange:{exchangeNo}")`；幂等范围为兑换流水级（同一 exchangeNo 不重复扣），HTTP 超时重试不在本 change 覆盖范围
- [x] 4.5 `PointsExchangeServiceImpl` 优惠券兑换路径：补充创建 `PointsExchange` 兑换记录，获得稳定 `exchangeNo`，再调用 `deductPointsIdempotent`，确保与实物兑换路径一致
- [x] 4.6 `AdminUserController.updateUserPoints`：改用 `addPointsIdempotent` / `deductPointsIdempotent` + `ADMIN_ADJUST` + `admin:{UUID}`（UUID 在 INSERT points_record 之前生成，因为先 INSERT guard 的设计要求 biz_id 在插入前确定；仅用于审计追踪，不声称重试幂等）

## 5. Cleanup

- [x] 5.1 `addPointsForOrder` 方法内部改用 `addPointsIdempotent(ORDER_COMPLETED, orderId)`，保持接口兼容
- [x] 5.2 确认所有生产调用点已迁移，`addPointsWithIdempotencyKey` 无外部调用
- [x] 5.3 检查 `PointsRecordVO` 是否需要展示 `bizType` 描述，如需要则更新

## 6. Unit Tests

- [x] 6.1 测试 `addPointsIdempotent` 首次调用成功增加积分并写入 biz_type + biz_id
- [x] 6.2 测试 `addPointsIdempotent` 重复调用抛出 DuplicateKeyException，用户积分不变
- [x] 6.3 测试 `deductPointsIdempotent` 首次调用成功扣减积分
- [x] 6.4 测试 `deductPointsIdempotent` 重复调用抛出 DuplicateKeyException，用户积分不变
- [x] 6.5 测试 `deductPointsIdempotent` 积分不足时抛出 BusinessException
- [x] 6.6 测试 `OrderCompletedPointsConsumer` 重复消息只发一次积分
- [x] 6.7 测试兑换扣减使用稳定 exchangeNo 的幂等行为

## 7. Verification

- [x] 7.1 后端 `mvn test` 全部通过
- [x] 7.2 后端 `mvn spring-boot:run` 启动成功
