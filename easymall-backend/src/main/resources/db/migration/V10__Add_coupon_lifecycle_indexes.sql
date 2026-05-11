-- ============================================
-- 优惠券生命周期索引
-- ============================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

ALTER TABLE `user_coupon`
ADD INDEX `idx_status_order` (`status`, `order_id`),
ADD INDEX `idx_order_status` (`order_id`, `status`);

ALTER TABLE `coupon_usage_log`
ADD INDEX `idx_action` (`action`),
ADD INDEX `idx_user_coupon_action` (`user_coupon_id`, `action`);
