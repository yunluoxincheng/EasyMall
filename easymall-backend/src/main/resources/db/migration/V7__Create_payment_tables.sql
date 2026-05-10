-- 支付单表
CREATE TABLE IF NOT EXISTS `payment_order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `payment_no` VARCHAR(64) NOT NULL COMMENT '支付单号',
    `order_id` BIGINT NOT NULL COMMENT '关联订单ID',
    `order_no` VARCHAR(64) NOT NULL COMMENT '关联订单号',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    `channel` VARCHAR(32) NOT NULL COMMENT '支付渠道',
    `status` VARCHAR(32) NOT NULL DEFAULT 'WAITING_PAY' COMMENT '支付状态',
    `third_trade_no` VARCHAR(128) DEFAULT NULL COMMENT '第三方交易号',
    `paid_time` DATETIME DEFAULT NULL COMMENT '支付完成时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_payment_no` (`payment_no`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付单表';

-- 支付回调日志表
CREATE TABLE IF NOT EXISTS `payment_callback_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `payment_no` VARCHAR(64) NOT NULL COMMENT '支付单号',
    `channel` VARCHAR(32) NOT NULL COMMENT '支付渠道',
    `callback_raw` TEXT COMMENT '回调原始数据',
    `result` VARCHAR(32) DEFAULT NULL COMMENT '处理结果',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_payment_no` (`payment_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付回调日志表';
