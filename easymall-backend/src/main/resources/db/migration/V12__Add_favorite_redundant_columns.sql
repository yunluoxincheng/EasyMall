ALTER TABLE `favorite`
    ADD COLUMN `product_name` VARCHAR(200) DEFAULT NULL COMMENT '商品名称' AFTER `product_id`,
    ADD COLUMN `product_image` VARCHAR(500) DEFAULT NULL COMMENT '商品图片' AFTER `product_name`,
    ADD COLUMN `product_price` VARCHAR(50) DEFAULT NULL COMMENT '商品价格' AFTER `product_image`;

-- 初始化 inventory（从 product.stock 同步，用于 V6 执行时 product 表尚无数据的补偿）
INSERT INTO `inventory` (`product_id`, `total_stock`, `available_stock`, `locked_stock`, `sold_stock`, `version`)
SELECT `id`, `stock`, `stock`, 0, 0, 0
FROM `product`
WHERE `deleted` = 0
  AND `id` NOT IN (SELECT `product_id` FROM `inventory`);

-- 评论表添加审核状态字段和回复时间
ALTER TABLE `comment`
    ADD COLUMN `show_status` TINYINT DEFAULT 1 COMMENT '显示状态：0-隐藏 1-显示' AFTER `deleted`,
    ADD COLUMN `reply_time` DATETIME DEFAULT NULL COMMENT '商家回复时间' AFTER `reply`;
