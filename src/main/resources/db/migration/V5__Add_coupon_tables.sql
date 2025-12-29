-- ============================================
-- 优惠券系统数据库表
-- ============================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- 优惠券模板表
CREATE TABLE IF NOT EXISTS `coupon_template` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '优惠券模板ID',
    `name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
    `type` TINYINT NOT NULL COMMENT '优惠券类型 1-固定金额 2-百分比折扣 3-新人专享 4-会员专属',
    `discount_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额（固定金额券专用）',
    `discount_percentage` DECIMAL(5,2) DEFAULT 0 COMMENT '折扣比例（百分比券专用，如85表示85折）',
    `min_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '使用门槛（最低消费金额）',
    `max_discount` DECIMAL(10,2) DEFAULT 0 COMMENT '最大优惠金额（百分比券专用，0表示无限制）',
    `total_count` INT NOT NULL DEFAULT 0 COMMENT '发行总数量',
    `received_count` INT DEFAULT 0 COMMENT '已领取数量',
    `used_count` INT DEFAULT 0 COMMENT '已使用数量',
    `member_level` INT DEFAULT 0 COMMENT '会员等级限制（0表示不限制，1-5对应会员等级）',
    `valid_days` INT DEFAULT 0 COMMENT '有效天数（领取后N天有效，0表示使用固定时间）',
    `start_time` DATETIME COMMENT '有效期开始时间（固定有效期时使用）',
    `end_time` DATETIME COMMENT '有效期结束时间（固定有效期时使用）',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态 0-下架 1-上架',
    `description` VARCHAR(500) COMMENT '使用说明',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX idx_type (`type`),
    INDEX idx_status (`status`),
    INDEX idx_member_level (`member_level`),
    INDEX idx_start_end_time (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券模板表';

-- 用户优惠券表
CREATE TABLE IF NOT EXISTS `user_coupon` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户优惠券ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `template_id` BIGINT NOT NULL COMMENT '优惠券模板ID',
    `coupon_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '优惠券编码',
    `coupon_name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
    `type` TINYINT NOT NULL COMMENT '优惠券类型 1-固定金额 2-百分比折扣 3-新人专享 4-会员专属',
    `discount_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    `discount_percentage` DECIMAL(5,2) DEFAULT 0 COMMENT '折扣比例',
    `min_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '使用门槛',
    `max_discount` DECIMAL(10,2) DEFAULT 0 COMMENT '最大优惠金额',
    `member_level` INT DEFAULT 0 COMMENT '会员等级限制',
    `start_time` DATETIME NOT NULL COMMENT '有效期开始时间',
    `end_time` DATETIME NOT NULL COMMENT '有效期结束时间',
    `status` TINYINT DEFAULT 0 COMMENT '状态 0-未使用 1-已使用 2-已过期',
    `use_time` DATETIME COMMENT '使用时间',
    `order_id` BIGINT COMMENT '使用的订单ID',
    `order_no` VARCHAR(50) COMMENT '订单号',
    `receive_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX idx_user_id (`user_id`),
    INDEX idx_template_id (`template_id`),
    INDEX idx_status (`status`),
    INDEX idx_user_status (`user_id`, `status`),
    INDEX idx_end_time (`end_time`),
    INDEX idx_coupon_code (`coupon_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券表';

-- 优惠券使用记录表
CREATE TABLE IF NOT EXISTS `coupon_usage_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `user_coupon_id` BIGINT NOT NULL COMMENT '用户优惠券ID',
    `template_id` BIGINT NOT NULL COMMENT '优惠券模板ID',
    `coupon_name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
    `coupon_type` TINYINT NOT NULL COMMENT '优惠券类型',
    `order_id` BIGINT COMMENT '订单ID',
    `order_no` VARCHAR(50) COMMENT '订单号',
    `order_amount` DECIMAL(10,2) COMMENT '订单金额',
    `discount_amount` DECIMAL(10,2) COMMENT '优惠金额',
    `action` TINYINT NOT NULL COMMENT '操作类型 1-使用 2-返还',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_user_id (`user_id`),
    INDEX idx_template_id (`template_id`),
    INDEX idx_order_id (`order_id`),
    INDEX idx_create_time (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券使用记录表';

-- 为积分兑换商品表添加类型字段（支持兑换优惠券）
ALTER TABLE `points_product`
ADD COLUMN `product_type` TINYINT DEFAULT 1 COMMENT '商品类型 1-实物商品 2-优惠券' AFTER `name`,
ADD COLUMN `relation_id` BIGINT DEFAULT 0 COMMENT '关联ID（优惠券时关联优惠券模板ID）' AFTER `product_type`,
ADD INDEX idx_product_type (`product_type`);

-- 插入测试优惠券模板数据
INSERT INTO `coupon_template` (`name`, `type`, `discount_amount`, `min_amount`, `total_count`, `start_time`, `end_time`, `status`, `description`, `sort_order`)
VALUES
('新人专享券', 3, 20.00, 99.00, 10000, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, '新用户专享，满99减20', 1),
('满100减10元', 1, 10.00, 100.00, 5000, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, '全场通用，满100减10', 2),
('满200减25元', 1, 25.00, 200.00, 3000, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, '全场通用，满200减25', 3),
('85折优惠券', 2, 0, 100.00, 2000, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, '全场通用，最高优惠50元', 4),
('银牌会员专享券', 4, 30.00, 150.00, 1000, '2024-01-01 00:00:00', '2025-12-31 23:59:59', 1, '银牌及以上会员专享，满150减30', 5)
ON DUPLICATE KEY UPDATE id=id;

-- 为订单表添加优惠券相关字段
ALTER TABLE `orders`
ADD COLUMN `user_coupon_id` BIGINT DEFAULT NULL COMMENT '使用的用户优惠券ID' AFTER `status`,
ADD COLUMN `coupon_discount` DECIMAL(10,2) DEFAULT 0 COMMENT '优惠券优惠金额' AFTER `user_coupon_id`,
ADD INDEX idx_user_coupon_id (`user_coupon_id`);
