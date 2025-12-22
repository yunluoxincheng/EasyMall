-- 会员等级配置表
CREATE TABLE IF NOT EXISTS `member_level` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `level` INT NOT NULL UNIQUE COMMENT '等级',
    `level_name` VARCHAR(50) NOT NULL COMMENT '等级名称',
    `min_points` INT NOT NULL DEFAULT 0 COMMENT '所需最小积分',
    `max_points` INT COMMENT '所需最大积分',
    `discount` DECIMAL(5,4) DEFAULT 1.0000 COMMENT '折扣率(0.85表示85折)',
    `icon` VARCHAR(255) COMMENT '等级图标',
    `benefits` TEXT COMMENT '会员权益描述',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX idx_level (`level`),
    INDEX idx_points_range (`min_points`, `max_points`)
);

-- 积分变动记录表
CREATE TABLE IF NOT EXISTS `points_record` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `points_change` INT NOT NULL COMMENT '积分变动值(正为增加，负为减少)',
    `before_points` INT NOT NULL COMMENT '变动前积分',
    `after_points` INT NOT NULL COMMENT '变动后积分',
    `type` TINYINT NOT NULL COMMENT '积分类型 1-订单获得 2-评价获得 3-签到获得 4-系统赠送 5-兑换消耗 6-退款扣除',
    `source_id` BIGINT COMMENT '来源ID(订单ID等)',
    `description` VARCHAR(255) COMMENT '描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (`user_id`),
    INDEX idx_type (`type`),
    INDEX idx_create_time (`create_time`)
);

-- 用户签到记录表
CREATE TABLE IF NOT EXISTS `user_sign` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `sign_date` DATE NOT NULL COMMENT '签到日期',
    `continuous_days` INT DEFAULT 1 COMMENT '连续签到天数',
    `points_earned` INT DEFAULT 0 COMMENT '本次签到获得的积分',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_date (`user_id`, `sign_date`),
    INDEX idx_user_id (`user_id`),
    INDEX idx_sign_date (`sign_date`)
);

-- 插入默认会员等级配置
INSERT INTO `member_level` (`level`, `level_name`, `min_points`, `max_points`, `discount`, `benefits`, `sort_order`, `status`)
VALUES
    (1, '普通会员', 0, 999, 1.0000, '享受基础会员服务', 1, 1),
    (2, '铜牌会员', 1000, 4999, 0.9800, '享受98折优惠，专属客服', 2, 1),
    (3, '银牌会员', 5000, 19999, 0.9500, '享受95折优惠，优先配送，专属客服', 3, 1),
    (4, '金牌会员', 20000, 49999, 0.9000, '享受9折优惠，优先配送，专属客服，生日礼包', 4, 1),
    (5, '钻石会员', 50000, NULL, 0.8500, '享受85折优惠，优先配送，专属客服，生日礼包，积分加倍', 5, 1)
ON DUPLICATE KEY UPDATE level=level;
