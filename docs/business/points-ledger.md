# 积分流水

## 幂等键设计

积分记录表 `points_record` 通过 `idempotency_key` 唯一约束防止重复发放：

```
idempotency_key = biz_type_prefix + biz_id
```

同一业务场景下，相同 `idempotency_key` 的积分只会发放一次。

## 业务场景幂等键规则

| 业务场景 | 枚举值 | 幂等键格式 | 说明 |
|---------|--------|-----------|------|
| 订单完成获得积分 | `ORDER_COMPLETED` | `{orderId}` | 每个订单只发一次积分 |
| 评价获得积分 | `COMMENT_CREATED` | `comment:{orderId}:{productId}` | 同一商品评价只发一次 |
| 每日签到 | `DAILY_SIGN_IN` | `sign:{userId}:{yyyy-MM-dd}` | 每天只能签到一次 |
| 积分兑换消耗 | `POINTS_EXCHANGE` | `exchange:{exchangeNo}` | 每次兑换只扣一次 |
| 管理员手动调整 | `ADMIN_ADJUST` | `admin:{UUID}` | 每次调整独立标识 |
| 退款扣除积分 | `REFUND_DEDUCT` | `refund:{orderId}` | 每个订单只扣一次 |

## 积分类型

| 类型值 | 说明 | 积分变化 |
|--------|------|---------|
| 1 | 订单积分 | +（订单金额 × 1） |
| 2 | 评价积分 | +10 |
| 3 | 签到积分 | +5 至 +25 |
| 4 | 兑换消耗 | -（兑换所需积分） |
| 5 | 管理员调整 | + 或 - |
| 6 | 退款扣除 | -（扣除对应订单已发积分） |

## 积分获取规则

### 订单完成

- 通过 MQ 异步发放（`OrderCompletedPointsConsumer`）
- 积分 = 订单支付金额（向下取整）
- 幂等键 = `orderId`

### 商品评价

- 评价审核通过后发放
- 固定 10 积分/次
- 幂等键 = `comment:{orderId}:{productId}`

### 每日签到

- 基础积分：5 分/天
- 连续签到奖励：
  - 第 3 天：额外 +5
  - 第 4 天：额外 +10
  - 第 5 天：额外 +15
  - 第 6 天及以上：额外 +20
- 幂等键 = `sign:{userId}:{yyyy-MM-dd}`

## 积分消耗

### 积分兑换商品

- 兑换实物商品：扣减积分
- 兑换优惠券：扣减积分 + 自动发放优惠券到用户账户
- 幂等键 = `exchange:{exchangeNo}`

## 数据库约束

```sql
-- V9: 添加幂等键列和唯一约束
ALTER TABLE `points_record`
    ADD COLUMN `idempotency_key` VARCHAR(64) DEFAULT NULL,
    ADD UNIQUE INDEX `uk_idempotency_key` (`idempotency_key`);

-- V11: 添加业务类型和业务 ID 列
ALTER TABLE `points_record`
    ADD COLUMN `biz_type` VARCHAR(32) DEFAULT NULL,
    ADD COLUMN `biz_id` VARCHAR(64) DEFAULT NULL;
```

`idempotency_key` 的唯一约束确保同一业务场景下不会重复发放积分。如果插入时违反唯一约束，说明该业务已发放过积分，直接跳过。
