SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 库存表
CREATE TABLE IF NOT EXISTS `inventory` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `total_stock` INT NOT NULL DEFAULT 0 COMMENT '总库存',
    `available_stock` INT NOT NULL DEFAULT 0 COMMENT '可售库存',
    `locked_stock` INT NOT NULL DEFAULT 0 COMMENT '锁定库存',
    `sold_stock` INT NOT NULL DEFAULT 0 COMMENT '已售库存',
    `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_product_id (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 库存流水表
CREATE TABLE IF NOT EXISTS `inventory_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `order_id` BIGINT COMMENT '关联订单ID',
    `change_type` VARCHAR(50) NOT NULL COMMENT '变动类型',
    `change_quantity` INT NOT NULL COMMENT '变动数量',
    `before_available` INT COMMENT '变动前可售库存',
    `after_available` INT COMMENT '变动后可售库存',
    `remark` VARCHAR(255) COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (`product_id`),
    INDEX idx_order_id (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 从 product.stock 初始化 inventory 数据
INSERT INTO `inventory` (`product_id`, `total_stock`, `available_stock`, `locked_stock`, `sold_stock`, `version`)
SELECT `id`, `stock`, `stock`, 0, 0, 0
FROM `product`
WHERE `deleted` = 0;
