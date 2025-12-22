-- 积分兑换商品表
CREATE TABLE IF NOT EXISTS `points_product` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
    `description` TEXT COMMENT '商品描述',
    `image` VARCHAR(255) COMMENT '商品图片',
    `points_required` INT NOT NULL COMMENT '所需积分',
    `stock` INT DEFAULT 0 COMMENT '库存',
    `exchange_count` INT DEFAULT 0 COMMENT '已兑换数量',
    `status` TINYINT DEFAULT 1 COMMENT '状态 0-下架 1-上架',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX idx_status (`status`),
    INDEX idx_sort (`sort_order`)
);

-- 积分兑换记录表
CREATE TABLE IF NOT EXISTS `points_exchange` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `product_id` BIGINT NOT NULL COMMENT '兑换商品ID',
    `product_name` VARCHAR(100) NOT NULL COMMENT '商品名称',
    `points_used` INT NOT NULL COMMENT '使用的积分',
    `exchange_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '兑换单号',
    `status` TINYINT DEFAULT 0 COMMENT '状态 0-待发货 1-已发货 2-已完成',
    `receiver_name` VARCHAR(50) COMMENT '收货人姓名',
    `receiver_phone` VARCHAR(20) COMMENT '收货人电话',
    `receiver_address` VARCHAR(255) COMMENT '收货地址',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX idx_user_id (`user_id`),
    INDEX idx_exchange_no (`exchange_no`),
    INDEX idx_status (`status`)
);

-- 插入示例积分兑换商品
INSERT INTO `points_product` (`name`, `description`, `image`, `points_required`, `stock`, `status`, `sort_order`)
VALUES
    ('100元优惠券', '满500可用，有效期30天', 'coupon.jpg', 500, 1000, 1, 1),
    ('精美定制水杯', '高端材质，多种款式可选', 'cup.jpg', 2000, 100, 1, 2),
    ('蓝牙耳机', '无线蓝牙耳机，音质出众', 'earphone.jpg', 5000, 50, 1, 3),
    ('智能手表', '健康监测，运动追踪', 'watch.jpg', 10000, 20, 1, 4)
ON DUPLICATE KEY UPDATE id=id;
