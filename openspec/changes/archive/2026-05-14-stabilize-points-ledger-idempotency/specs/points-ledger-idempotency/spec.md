## ADDED Requirements

### Requirement: 积分流水业务标识字段
系统 SHALL 在 `points_record` 表中新增 `biz_type`（VARCHAR(64)）和 `biz_id`（VARCHAR(128)）字段，用于结构化标识积分变动的业务来源。系统 SHALL 在 `(biz_type, biz_id)` 上建立唯一索引以支持数据库级幂等约束。

#### Scenario: 新增积分记录写入 biz_type 和 biz_id
- **WHEN** 系统通过幂等方法增加或扣减积分
- **THEN** `points_record` 记录的 `biz_type` 和 `biz_id` 字段 SHALL 不为空
- **AND** `biz_type` 的值为 `PointsBizType` 枚举中定义的业务类型字符串

#### Scenario: 唯一索引阻止重复记录
- **WHEN** 尝试插入一条 `(biz_type, biz_id)` 已存在的记录
- **THEN** 数据库唯一索引 SHALL 阻止插入
- **AND** 抛出 `DuplicateKeyException`

#### Scenario: 旧数据不触发唯一约束
- **WHEN** 存在 `biz_type` 和 `biz_id` 为 NULL 的历史数据
- **THEN** 唯一索引不阻止新记录插入
- **AND** 历史数据查询不受影响

---

### Requirement: 积分业务类型枚举
系统 SHALL 定义 `PointsBizType` 枚举，包含以下业务类型：

| 枚举值 | 含义 | biz_id 格式 | 是否重试幂等 |
|--------|------|-------------|-------------|
| `ORDER_COMPLETED` | 订单完成获得积分 | `{orderId}` | 是 |
| `COMMENT_CREATED` | 评价获得积分 | `comment:{orderId}:{productId}` | 是 |
| `DAILY_SIGN_IN` | 签到获得积分 | `sign:{userId}:{yyyy-MM-dd}` | 是 |
| `POINTS_EXCHANGE` | 兑换消耗积分 | `exchange:{exchangeNo}` | 兑换流水级幂等（见下方说明） |
| `ADMIN_ADJUST` | 管理员手动调整 | `admin:{UUID}` | 仅追踪流水 |
| `REFUND_DEDUCT` | 退款扣除积分 | `refund:{orderId}` | 仅追踪流水 |

`COMMENT_CREATED` 使用 `CREATED` 而非 `APPROVED`，因为当前评价是创建即展示/发积分，不存在审核流程。

`POINTS_EXCHANGE` 提供兑换流水级幂等：同一个 `exchangeNo` 的积分只扣一次，覆盖 MQ 重放和内部重试。但 `exchangeNo` 是服务端在每次兑换请求时新生成的，客户端 HTTP 超时重试会进入新请求并生成新 `exchangeNo`，因此无法阻止同一用户重复兑换。真正的 API 重试幂等需要前端传入 `requestId`，本 change 不要求前端改造。

`ADMIN_ADJUST` 不声称具备重试幂等。每次管理员调整是独立操作，biz_id 使用 UUID（非自增 ID，因为先 INSERT guard 的设计要求 biz_id 在插入前确定），用于审计追踪而非防重复。

#### Scenario: 订单完成积分使用 ORDER_COMPLETED 类型
- **WHEN** 订单完成发放积分
- **THEN** `biz_type` 为 `ORDER_COMPLETED`，`biz_id` 为订单 ID 的字符串形式

#### Scenario: 评价积分使用 COMMENT_CREATED 类型
- **WHEN** 用户评价商品后发放积分
- **THEN** `biz_type` 为 `COMMENT_CREATED`，`biz_id` 为 `comment:{orderId}:{productId}`

#### Scenario: 签到积分使用 DAILY_SIGN_IN 类型
- **WHEN** 用户签到发放积分
- **THEN** `biz_type` 为 `DAILY_SIGN_IN`，`biz_id` 为 `sign:{userId}:{yyyy-MM-dd}`

#### Scenario: 积分兑换使用 POINTS_EXCHANGE 类型
- **WHEN** 用户使用积分兑换商品或优惠券
- **THEN** `biz_type` 为 `POINTS_EXCHANGE`，`biz_id` 为 `exchange:{exchangeNo}`

#### Scenario: 管理员调整使用 ADMIN_ADJUST 类型
- **WHEN** 管理员手动调整用户积分
- **THEN** `biz_type` 为 `ADMIN_ADJUST`，`biz_id` 为 `admin:{UUID}`
- **AND** 每次调整产生独立的 UUID，用于审计追踪

---

### Requirement: 幂等方法执行顺序：先写 guard 再改余额
系统 SHALL 确保幂等方法内部执行顺序为：先 INSERT `points_record`（含 `biz_type` + `biz_id`），建立 ledger guard；INSERT 成功后再 UPDATE `user.points`。若 INSERT 因唯一索引冲突抛出 `DuplicateKeyException`，事务 SHALL 回滚，用户积分和会员等级 SHALL NOT 发生任何变更。

#### Scenario: 首次调用成功发放积分
- **WHEN** 调用 `addPointsIdempotent(userId, 100, ORDER_COMPLETED, "1001", "订单完成积分")`
- **AND** `(ORDER_COMPLETED, 1001)` 不存在于 `points_record`
- **THEN** 系统先 INSERT `points_record`，成功后再 UPDATE 用户积分
- **AND** 用户积分正确增加

#### Scenario: 重复调用触发唯一索引冲突，积分不变
- **WHEN** 调用 `addPointsIdempotent(userId, 100, ORDER_COMPLETED, "1001", "订单完成积分")`
- **AND** `(ORDER_COMPLETED, 1001)` 已存在于 `points_record`
- **THEN** INSERT 抛出 `DuplicateKeyException`，事务回滚
- **AND** 用户积分余额不发生任何变更
- **AND** 会员等级不发生任何变更
- **AND** 异常传播给调用方处理

#### Scenario: 首次扣减积分成功
- **WHEN** 调用 `deductPointsIdempotent(userId, 50, POINTS_EXCHANGE, "EXG1234", "兑换商品")`
- **AND** 用户积分余额充足
- **AND** `(POINTS_EXCHANGE, EXG1234)` 不存在于 `points_record`
- **THEN** 系统先 INSERT `points_record`，成功后再 UPDATE 用户积分
- **AND** 用户积分正确扣减

#### Scenario: 积分不足时扣减失败
- **WHEN** 调用 `deductPointsIdempotent(userId, 500, POINTS_EXCHANGE, "EXG1234", "兑换商品")`
- **AND** 用户积分余额不足
- **THEN** 系统抛出 `BusinessException`，提示积分不足
- **AND** 不写入 `points_record`

#### Scenario: 重复扣减触发唯一索引冲突，积分不变
- **WHEN** 调用 `deductPointsIdempotent(userId, 50, POINTS_EXCHANGE, "EXG1234", "兑换商品")`
- **AND** `(POINTS_EXCHANGE, EXG1234)` 已存在于 `points_record`
- **THEN** INSERT 抛出 `DuplicateKeyException`，事务回滚
- **AND** 用户积分余额不发生任何变更
- **AND** 异常传播给调用方处理

---

### Requirement: 统一幂等积分方法
系统 SHALL 在 `IPointsService` 中提供 `addPointsIdempotent` 和 `deductPointsIdempotent` 两个方法，要求调用方传入 `PointsBizType` 和 `bizId`。幂等逻辑 SHALL 内聚在服务层，调用方无需自行实现幂等检查。调用方 SHALL 在外层捕获 `DuplicateKeyException` 并根据业务语义决定是否视为幂等成功。

#### Scenario: MQ 消费者捕获冲突视为幂等成功
- **WHEN** `OrderCompletedPointsConsumer` 调用 `addPointsIdempotent` 后收到 `DuplicateKeyException`
- **THEN** 消费者记录 INFO 日志并正常 ACK
- **AND** 不抛出异常，不触发重试

#### Scenario: 同步调用方不捕获冲突
- **WHEN** 同步调用方调用 `addPointsIdempotent` 后收到 `DuplicateKeyException`
- **THEN** 异常自然传播，由全局异常处理器返回错误响应
- **AND** 调用方可以根据错误码判断是否为幂等冲突

---

### Requirement: 所有积分场景迁移到幂等方法
系统 SHALL 确保所有积分变动场景统一使用幂等方法，不得直接调用无幂等保护的 `addPoints` / `deductPoints` 方法。

| 场景 | biz_type | biz_id 格式 | 调用方变更 |
|------|----------|-------------|-----------|
| 订单完成发积分 | `ORDER_COMPLETED` | `{orderId}` | 消费者移除手动幂等查询 |
| 评价发积分 | `COMMENT_CREATED` | `comment:{orderId}:{productId}` | 签名增加 orderId 参数 |
| 签到发积分 | `DAILY_SIGN_IN` | `sign:{userId}:{yyyy-MM-dd}` | 改用幂等方法 |
| 积分兑换扣减 | `POINTS_EXCHANGE` | `exchange:{exchangeNo}` | 先生成 exchangeNo 再扣积分，兑换流水级幂等 |
| 管理员调整 | `ADMIN_ADJUST` | `admin:{UUID}` | 每次独立 UUID，仅追踪 |

#### Scenario: 评价积分使用幂等方法
- **WHEN** 用户评价商品后发放积分
- **THEN** 系统调用 `addPointsIdempotent` 并传入 `COMMENT_CREATED` 和 `comment:{orderId}:{productId}`
- **AND** `addPointsForComment` 方法签名增加 `orderId` 参数

#### Scenario: 签到积分使用幂等方法
- **WHEN** 用户签到后发放积分
- **THEN** 系统调用 `addPointsIdempotent` 并传入 `DAILY_SIGN_IN` 和 `sign:{userId}:{yyyy-MM-dd}`

#### Scenario: 积分兑换扣减先生成稳定操作号
- **WHEN** 用户使用积分兑换商品或优惠券
- **THEN** 系统先生成 `exchangeNo` 并创建兑换记录
- **AND** 然后调用 `deductPointsIdempotent` 并传入 `POINTS_EXCHANGE` 和 `exchange:{exchangeNo}`
- **AND** 优惠券兑换路径也 SHALL 创建 `PointsExchange` 兑换记录
- **AND** 幂等范围为兑换流水级（同一 exchangeNo 不重复扣积分），HTTP 超时重试可能生成新 exchangeNo

#### Scenario: 管理员调整积分产生独立流水
- **WHEN** 管理员手动调整用户积分
- **THEN** 系统调用 `addPointsIdempotent` 或 `deductPointsIdempotent` 并传入 `ADMIN_ADJUST`
- **AND** 每次调整使用独立的 biz_id，用于审计追踪

---

### Requirement: 旧方法标记废弃
系统 SHALL 将以下方法标记为 `@Deprecated`，所有生产调用迁移到新的幂等方法。旧方法行为不变以保证兼容性，本 change 不删除旧方法。

- `addPointsWithIdempotencyKey`
- `addPoints(userId, points, type, sourceId, description)`
- `deductPoints(userId, points, type, sourceId, description)`
- `addPoints(userId, points, description)`

#### Scenario: 旧方法仍可调用但标记废弃
- **WHEN** 现有代码调用旧的 `addPoints` 方法
- **THEN** 编译器产生废弃警告
- **AND** 方法行为不变以保证兼容性

---

### Requirement: 单元测试覆盖
系统 SHALL 包含以下单元测试，验证幂等机制的正确性：

#### Scenario: 测试重复 addPointsIdempotent 不修改积分
- **WHEN** 对同一 `(biz_type, biz_id)` 调用两次 `addPointsIdempotent`
- **THEN** 用户积分只增加一次
- **AND** 第二次调用抛出 `DuplicateKeyException`

#### Scenario: 测试重复 deductPointsIdempotent 不修改积分
- **WHEN** 对同一 `(biz_type, biz_id)` 调用两次 `deductPointsIdempotent`
- **THEN** 用户积分只扣减一次
- **AND** 第二次调用抛出 `DuplicateKeyException`

#### Scenario: 测试订单完成重复消息幂等
- **WHEN** `OrderCompletedPointsConsumer` 收到两条相同 orderId 的消息
- **THEN** 用户只收到一次积分

#### Scenario: 测试兑换扣减使用稳定 exchangeNo 幂等
- **WHEN** 兑换流程重试时使用相同 `exchangeNo`
- **THEN** 积分只扣减一次

#### Scenario: 测试唯一索引冲突不修改用户积分
- **WHEN** `addPointsIdempotent` 因唯一索引冲突失败
- **THEN** `user.points` 不发生任何变更
- **AND** `member` 等级不发生任何变更

