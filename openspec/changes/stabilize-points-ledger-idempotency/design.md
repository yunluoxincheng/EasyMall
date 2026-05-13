## Context

EasyMall 的积分系统已具备基本的增减积分、积分兑换、签到积分、订单完成积分、评价积分和管理员调整能力。但积分流水（`points_record`）缺少统一的幂等模型：

- 现有 `idempotencyKey` 字段仅用于订单完成积分（`order_points:{orderId}`），其他场景未使用
- `type` 字段使用整数编码（1~6），语义不明确，不利于跨模块协作和排查
- `sourceId` 使用 Long 类型，无法覆盖字符串类业务标识（如日期 `2024-01-15`）
- `OrderCompletedPointsConsumer` 内部手动查询 `idempotencyKey` 做幂等检查，逻辑散落在消费者层
- 评价积分、签到积分、积分兑换扣减、管理员调整均无幂等保护，重复调用会导致重复发放/扣减

当前积分调用点：
| 调用方 | 方法 | 当前幂等 |
|--------|------|----------|
| `OrderCompletedPointsConsumer` | `addPointsForOrder` → `addPointsWithIdempotencyKey` | 消费者手动查 + DB 幂等键 |
| `CommentServiceImpl` | `addPointsForComment` → `addPoints` | 无 |
| `SignInServiceImpl` | `addPoints` | 无（依赖签到日期去重，但积分记录无保护） |
| `PointsExchangeServiceImpl` | `deductPoints` | 无（先扣积分再生成 exchangeNo，重试会生成不同 key） |
| `AdminUserController` | `addPoints(userId, points, desc)` | 无 |

## Goals / Non-Goals

**Goals:**
- 订单完成、评价、签到、兑换四种场景统一通过 `biz_type` + `biz_id` 实现数据库级重试幂等
- 管理员调整和退款扣减使用相同机制记录流水，用于审计追踪，不声称具备重试幂等
- `PointsService` 提供统一的 `addPointsIdempotent` / `deductPointsIdempotent` 方法，幂等逻辑内聚在服务层
- 消费者和调用方不再需要手动实现幂等检查
- 保留 `type` 和 `sourceId` 字段向后兼容，不破坏现有数据和查询

**Non-Goals:**
- 不引入积分过期机制
- 不引入分布式积分服务
- 不修改 `PointsRecord` 的展示字段或 VO 结构
- 不修改签到表、兑换表等业务表结构
- 不引入积分变更事件通知
- 本 change 不删除旧方法，仅标记 `@Deprecated`

## Decisions

### 1. 幂等 guard 必须先于余额变更

**选择**: 幂等方法内部执行顺序为：
1. 先 INSERT `points_record`（含 `biz_type` + `biz_id`），建立 ledger guard
2. INSERT 成功后再 UPDATE `user.points`
3. 如果 INSERT 因唯一索引冲突抛出 `DuplicateKeyException`，事务回滚，用户积分和会员等级不变

**替代方案**: 先更新积分再插流水（当前实现方式），在 catch 块中吞掉 DuplicateKeyException

**理由**: 当前 `PointsServiceImpl` 先 UPDATE user 再 INSERT record。如果沿用此顺序并吞掉异常，重复请求会先修改 `user.points`，然后流水插入失败被当成幂等成功返回，导致积分被错误变更。正确的做法是先写 ledger guard（INSERT record），利用唯一索引冲突触发事务回滚，确保冲突时积分余额不变。

**实现方式**: 幂等方法在 `@Transactional` 内：
1. INSERT points_record（`biz_type` + `biz_id` + `points_change=0` 作为 guard 行，或直接写入完整记录但 `before_points/after_points` 先用当前快照填充）
2. 若 INSERT 成功，继续 UPDATE user.points 和 UPDATE member level
3. 若 INSERT 抛出 DuplicateKeyException，不捕获，让事务自然回滚，由调用方或统一异常处理决定是否转换为幂等成功

调用方（如 MQ 消费者）需要在外层捕获 DuplicateKeyException 并视为幂等成功。这与当前 `OrderCompletedPointsConsumer` 的处理方式一致。

### 2. 新增 `biz_type` + `biz_id` 替代 `idempotencyKey`

**选择**: 新增 `biz_type VARCHAR(64)` 和 `biz_id VARCHAR(128)` 两个字段，加上唯一索引 `(biz_type, biz_id)`

**替代方案**: 继续使用现有 `idempotencyKey` 字段

**理由**: `idempotencyKey` 是自由格式字符串，缺乏结构化约束。`biz_type` + `biz_id` 的结构化组合让幂等逻辑可预测、可按类型查询、可审计。`biz_id` 使用 VARCHAR 可以覆盖 Long 和 String 类型的业务标识。

### 3. 新增 `PointsBizType` 枚举

**选择**: 新增 `PointsBizType` 枚举，定义 6 种业务类型字符串

```
ORDER_COMPLETED  → 订单完成获得积分（重试幂等）
COMMENT_CREATED  → 评价获得积分（重试幂等）
DAILY_SIGN_IN    → 签到获得积分（重试幂等）
POINTS_EXCHANGE  → 兑换消耗积分（重试幂等）
ADMIN_ADJUST     → 管理员手动调整（仅追踪流水，不声称重试幂等）
REFUND_DEDUCT    → 退款扣除积分（仅追踪流水）
```

**替代方案**: 扩展现有 `PointsTypeEnum` 增加字符串字段

**理由**: `PointsTypeEnum` 的整数 code 仍用于展示映射，保持不变。新增 `PointsBizType` 用于幂等和业务追踪，职责分离更清晰。

枚举命名调整：`COMMENT_CREATED` 而非 `COMMENT_APPROVED`，因为当前评价是创建即展示/发积分，不存在审核流程。如果后续引入评论审核，再增加 `COMMENT_APPROVED` 类型。

### 4. 幂等方法签名

**选择**: `IPointsService` 新增方法

```java
void addPointsIdempotent(Long userId, Integer points, PointsBizType bizType, String bizId, String description);
void deductPointsIdempotent(Long userId, Integer points, PointsBizType bizType, String bizId, String description);
```

**理由**: 方法名显式表达幂等语义，调用方必须提供 `bizType` 和 `bizId`，无法遗漏幂等参数。

### 5. 幂等实现策略：先 INSERT guard + 唯一索引冲突回滚

**选择**: 依赖 `UNIQUE(biz_type, biz_id)` 唯一索引。幂等方法内先 INSERT points_record，成功后再 UPDATE user。DuplicateKeyException 不在方法内部吞掉，而是让事务回滚，由调用方决定是否视为幂等成功。

**替代方案 A**: Redis SETNX + 数据库双重幂等 — 过度设计，单体应用不需要
**替代方案 B**: 方法内部吞掉 DuplicateKeyException 并返回 — 危险，会导致先执行的 UPDATE 无法回滚

**理由**: 当前是单体应用，数据库唯一索引 + 事务回滚是最简单可靠的方式。方法不吞异常，让调用方根据业务场景决定处理策略：
- MQ 消费者：捕获 DuplicateKeyException → INFO 日志 → ACK
- 同步调用方：异常自然传播 → 调用方已有重试/错误处理

### 6. POINTS_EXCHANGE 幂等范围：兑换流水级幂等，非 API 重试级幂等

**选择**: 修改 `PointsExchangeServiceImpl` 的执行顺序：
1. 先生成 `exchangeNo`
2. 创建 `PointsExchange` 兑换记录（状态为"处理中"）
3. 调用 `deductPointsIdempotent(POINTS_EXCHANGE, "exchange:{exchangeNo}")`
4. 更新商品库存和兑换统计
5. 如果是优惠券兑换，发放优惠券

对于优惠券兑换路径：同样需要创建 `PointsExchange` 记录，以获得稳定的 `exchangeNo`。当前优惠券兑换不创建兑换记录，仅返回 `"CPN" + userCouponId`，需要补充兑换记录创建。

**幂等范围说明**: `exchange:{exchangeNo}` 保证的是"同一个兑换单的积分只扣一次"，即兑换流水级幂等。这覆盖了 MQ 重放、内部重试等场景。但 `exchangeNo` 是服务端在每次请求时新生成的，客户端 HTTP 超时重试会进入新请求、生成新 `exchangeNo`，因此无法阻止同一用户重复兑换。真正的 API 重试幂等需要前端传入 `requestId`，但本 change 不要求前端改造。

**后续扩展点**: 如果未来需要 API 重试级幂等，可以让前端在兑换请求中传入 `requestId`，服务端用 `POINTS_EXCHANGE` + `exchange-request:{requestId}` 在兑换记录中查重，跳过已处理的请求。

**替代方案 A**: 用 `pointsProductId + userId + timestamp` 作为 biz_id — timestamp 每次不同，无法幂等
**替代方案 B**: 强制前端传 requestId — 增加前端改动范围，超出本 change 边界

**理由**: 先确保兑换流水级幂等（内部重试安全），API 重试幂等留给后续前端配合 requestId 实现。

### 7. 管理员调整：可追踪流水，不声称重试幂等

**选择**: 管理员调整使用 `ADMIN_ADJUST` + `admin:{UUID}` 作为流水追踪。biz_id 使用 UUID 而非自增 ID，因为"先 INSERT points_record 作为 guard"的设计要求 biz_id 在插入前就确定，不能用同一条记录的自增 ID。

**理由**: 管理员调整的幂等语义与其他场景不同。订单完成、评价、签到、兑换是"同一个业务事件不应重复发积分"，而管理员调整是"每次手动操作都是独立的"。每次调用就是一次新操作，UUID 用于审计追踪而非防重复。

### 8. 评价积分签名变更

**选择**: 修改 `addPointsForComment` 签名，增加 `orderId` 参数。`CommentServiceImpl` 调用点已有 `commentDTO.getOrderId()`，传入即可。

**biz_id 格式**: `comment:{orderId}:{productId}`

**理由**: 当前 `addPointsForComment` 只接收 `userId` 和 `productId`，缺少 `orderId`，无法构建幂等 biz_id。调用点 `CommentServiceImpl` 已有 orderId 可用，修改签名无破坏性。

### 9. 旧字段保留与旧方法废弃策略

**选择**:
- `type`、`sourceId`、`idempotencyKey` 字段保留不删除
- `addPointsWithIdempotentKey`、旧签名 `addPoints(userId, points, type, sourceId, desc)`、`deductPoints(userId, points, type, sourceId, desc)` 标记 `@Deprecated`
- 本 change 不删除旧方法

**理由**: 前端和后台查询依赖 `type` 字段做展示映射。旧方法可能有测试或其他调用方引用，标记废弃比直接删除更安全。是否删除放到后续 cleanup。

### 10. 迁移策略：新旧数据共存

**选择**: 新代码写入 `biz_type` + `biz_id`，旧数据这两个字段为 NULL。唯一索引允许 NULL 值（MySQL 中 NULL 不参与唯一性约束），不会与旧数据冲突。

## Risks / Trade-offs

- **[唯一索引允许 NULL]** → MySQL 中 `UNIQUE(biz_type, biz_id)` 对 `biz_type IS NULL` 的行不生效，旧数据不会触发冲突，但新代码必须保证 `biz_type` 和 `biz_id` 非空。通过方法签名强制非空参数缓解。
- **[先 INSERT guard 增加一次 DB 写入]** → 幂等方法需要先写流水再改余额，比当前多一次 DB 操作。但积分操作本身不是高频路径，额外开销可接受。
- **[优惠券兑换需要创建兑换记录]** → 当前优惠券兑换不创建 `PointsExchange` 记录，需要补充。这增加了少量代码但统一了兑换流程。
- **[管理员调整不提供重试幂等]** → 如果前端重复提交管理员调整请求，会产生两条流水。这符合业务语义（每次调整是独立操作），但需要前端自行防重复提交。
- **[数据库迁移]** → 新增列和索引需要 SQL 迁移脚本。通过 `db/migration/` 下的增量脚本管理，不影响现有数据。
