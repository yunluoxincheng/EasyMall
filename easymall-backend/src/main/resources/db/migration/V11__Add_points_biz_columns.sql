-- 积分记录表新增业务标识字段，支持统一幂等机制
-- biz_type + biz_id 唯一索引实现数据库级幂等约束

ALTER TABLE `points_record`
    ADD COLUMN `biz_type` VARCHAR(64) DEFAULT NULL COMMENT '业务类型(ORDER_COMPLETED/COMMENT_CREATED/DAILY_SIGN_IN/POINTS_EXCHANGE/ADMIN_ADJUST/REFUND_DEDUCT)',
    ADD COLUMN `biz_id` VARCHAR(128) DEFAULT NULL COMMENT '业务标识(配合biz_type实现幂等)';

-- 唯一索引：MySQL 中 NULL 不参与唯一性约束，旧数据不受影响
ALTER TABLE `points_record`
    ADD UNIQUE INDEX `uk_biz` (`biz_type`, `biz_id`);

-- 回填历史订单积分的幂等数据，防止部署后重复发积分
-- 将 idempotency_key = 'order_points:{orderId}' 的记录映射到新的 biz_type + biz_id
UPDATE `points_record`
SET `biz_type` = 'ORDER_COMPLETED',
    `biz_id` = SUBSTRING(`idempotency_key`, 14)
WHERE `idempotency_key` LIKE 'order_points:%'
  AND `biz_type` IS NULL;
