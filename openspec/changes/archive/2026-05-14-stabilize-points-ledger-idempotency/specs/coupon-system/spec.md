## MODIFIED Requirements

### Requirement: 积分兑换优惠券
系统 SHALL 支持用户使用积分兑换优惠券，与现有积分系统集成。积分扣减 SHALL 使用 `IPointsService.deductPointsIdempotent` 方法并传入 `PointsBizType.POINTS_EXCHANGE` 和 `exchange:{exchangeNo}` 作为幂等键。兑换流程 SHALL 先生成稳定的 `exchangeNo` 并创建兑换记录，再执行积分扣减。幂等范围为兑换流水级：同一 exchangeNo 的积分只扣一次，覆盖内部重试和 MQ 重放；HTTP 超时重试可能生成新 exchangeNo，需要前端防重复提交或后续引入 requestId。优惠券兑换路径 SHALL 与实物兑换路径一样创建 `PointsExchange` 兑换记录。

#### Scenario: 浏览可兑换的优惠券列表
- **WHEN** 用户访问积分兑换优惠券页面
- **THEN** 系统显示可兑换的优惠券列表
- **AND** 显示优惠券信息、所需积分、兑换数量限制

#### Scenario: 使用积分兑换优惠券
- **WHEN** 用户选择一张优惠券进行兑换
- **AND** 用户积分满足兑换要求
- **AND** 优惠券兑换未达到数量限制
- **THEN** 系统先生成 `exchangeNo` 并创建 `PointsExchange` 兑换记录
- **AND** 然后通过 `deductPointsIdempotent` 扣除对应积分
- **AND** 使用 `POINTS_EXCHANGE` 业务类型和 `exchange:{exchangeNo}` 作为幂等键
- **AND** 发放优惠券到用户账户

#### Scenario: 积分不足无法兑换
- **WHEN** 用户积分不足
- **THEN** 系统提示积分不足
- **AND** 不允许兑换

