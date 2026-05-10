-- 积分记录表添加订单积分幂等唯一约束
-- 仅约束 ORDER 类型（type=1）的 source_id，不影响其他积分类型
-- 通过添加计算列 + 部分索引的方式实现
-- MySQL 8 支持 函数索引，但为兼容性使用条件唯一索引的替代方案：
-- 添加独立的 idempotency_key 列，仅订单积分写入 order_points:{orderId} 格式

ALTER TABLE `points_record`
    ADD COLUMN `idempotency_key` VARCHAR(64) DEFAULT NULL COMMENT '幂等键',
    ADD UNIQUE INDEX `uk_idempotency_key` (`idempotency_key`);
