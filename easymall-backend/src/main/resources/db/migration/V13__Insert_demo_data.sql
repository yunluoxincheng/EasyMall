-- ============================================
-- 设置字符集为 utf8mb4，避免中文乱码
-- ============================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- ============================================
-- EasyMall 测试数据
-- ============================================

-- 清空现有测试数据（可选）
-- DELETE FROM product WHERE id > 0;
-- DELETE FROM category WHERE id > 0;

-- ============================================
-- 一、商品分类数据
-- ============================================

-- 一级分类
INSERT INTO category (name, icon, parent_id, level, sort, status, deleted) VALUES
('数码产品', 'digital', 0, 1, 1, 1, 0),
('服装鞋帽', 'clothing', 0, 1, 2, 1, 0),
('食品饮料', 'food', 0, 1, 3, 1, 0),
('家居用品', 'home', 0, 1, 4, 1, 0),
('美妆护肤', 'beauty', 0, 1, 5, 1, 0);

-- 二级分类 - 数码产品
INSERT INTO category (name, icon, parent_id, level, sort, status, deleted) VALUES
('手机', 'phone', 1, 2, 1, 1, 0),
('电脑', 'computer', 1, 2, 2, 1, 0),
('平板', 'tablet', 1, 2, 3, 1, 0),
('耳机', 'headphone', 1, 2, 4, 1, 0),
('智能手表', 'watch', 1, 2, 5, 1, 0);

-- 二级分类 - 服装鞋帽
INSERT INTO category (name, icon, parent_id, level, sort, status, deleted) VALUES
('男装', 'men', 2, 2, 1, 1, 0),
('女装', 'women', 2, 2, 2, 1, 0),
('运动鞋', 'sneaker', 2, 2, 3, 1, 0),
('箱包', 'bag', 2, 2, 4, 1, 0);

-- 二级分类 - 食品饮料
INSERT INTO category (name, icon, parent_id, level, sort, status, deleted) VALUES
('零食', 'snack', 3, 2, 1, 1, 0),
('饮料', 'drink', 3, 2, 2, 1, 0),
('生鲜', 'fresh', 3, 2, 3, 1, 0);

-- 二级分类 - 家居用品
INSERT INTO category (name, icon, parent_id, level, sort, status, deleted) VALUES
('厨房用品', 'kitchen', 4, 2, 1, 1, 0),
('家居装饰', 'decor', 4, 2, 2, 1, 0),
('生活用品', 'daily', 4, 2, 3, 1, 0);

-- 二级分类 - 美妆护肤
INSERT INTO category (name, icon, parent_id, level, sort, status, deleted) VALUES
('护肤品', 'skincare', 5, 2, 1, 1, 0),
('彩妆', 'makeup', 5, 2, 2, 1, 0),
('香水', 'perfume', 5, 2, 3, 1, 0);

-- ============================================
-- 二、商品数据
-- ============================================

-- 一级分类直挂商品，确保一级分类页也有商品可展示
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('数码好物精选礼盒', '办公娱乐一步到位', '精选数码配件组合，适合日常办公、学习和居家娱乐等多场景使用。', 899.00, 699.00, 120, 186, 'https://picsum.photos/seed/digital_bundle/400/400', 'https://picsum.photos/seed/digital_bundle_1/400/400,https://picsum.photos/seed/digital_bundle_2/400/400', 1, 'EasyMall Select', 1, 0),
('四季穿搭组合套装', '上衣裤装搭配省心选', '包含基础上装与日常下装的穿搭组合，兼顾通勤与休闲场景。', 599.00, 399.00, 95, 143, 'https://picsum.photos/seed/clothing_bundle/400/400', 'https://picsum.photos/seed/clothing_bundle_1/400/400,https://picsum.photos/seed/clothing_bundle_2/400/400', 2, 'EasyMall Fashion', 1, 0),
('零食饮料分享大礼包', '聚会囤货更省心', '精选零食与饮品组合，适合追剧、聚会和办公室分享。', 129.00, 99.00, 180, 367, 'https://picsum.photos/seed/food_bundle/400/400', 'https://picsum.photos/seed/food_bundle_1/400/400,https://picsum.photos/seed/food_bundle_2/400/400', 3, 'EasyMall Pantry', 1, 0),
('居家生活实用套装', '厨房清洁收纳一套齐', '面向新家和日常补货场景的居家组合，覆盖基础厨房与生活所需。', 299.00, 229.00, 140, 128, 'https://picsum.photos/seed/home_bundle/400/400', 'https://picsum.photos/seed/home_bundle_1/400/400,https://picsum.photos/seed/home_bundle_2/400/400', 4, 'EasyMall Home', 1, 0),
('美妆护肤人气礼盒', '护肤彩妆一次备齐', '集合基础护肤和彩妆单品的人气礼盒，适合自用与送礼。', 699.00, 499.00, 110, 205, 'https://picsum.photos/seed/beauty_bundle/400/400', 'https://picsum.photos/seed/beauty_bundle_1/400/400,https://picsum.photos/seed/beauty_bundle_2/400/400', 5, 'EasyMall Beauty', 1, 0);

-- 手机类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('iPhone 15 Pro', '钛金属原色 超视网膜XDR显示屏', '苹果最新旗舰手机，搭载A17 Pro芯片，支持5G网络，拍照更清晰，续航更持久。', 8999.00, 7999.00, 50, 128, 'https://picsum.photos/seed/iphone15/400/400', 'https://picsum.photos/seed/iphone15_1/400/400,https://picsum.photos/seed/iphone15_2/400/400', 6, 'Apple', 1, 0),
('iPhone 15', '粉色浪漫 经典设计', '苹果iPhone 15，搭载A16仿生芯片，USB-C接口，拍照更清晰。', 6999.00, 5999.00, 80, 256, 'https://picsum.photos/seed/iphone15_std/400/400', 'https://picsum.photos/seed/iphone15_std_1/400/400,https://picsum.photos/seed/iphone15_std_2/400/400', 6, 'Apple', 1, 0),
('华为 Mate 60 Pro', '卫星通信 遥遥领先', '华为Mate 60 Pro，支持卫星通信，超光变摄像头，昆仑玻璃。', 7999.00, 6999.00, 60, 312, 'https://picsum.photos/seed/mate60/400/400', 'https://picsum.photos/seed/mate60_1/400/400,https://picsum.photos/seed/mate60_2/400/400', 6, 'Huawei', 1, 0),
('小米14 Pro', '徕卡光学镜头 骁龙8Gen3', '小米14 Pro，徕卡专业光学镜头，骁龙8 Gen3处理器，2K屏幕。', 5999.00, 4999.00, 100, 445, 'https://picsum.photos/seed/mi14/400/400', 'https://picsum.photos/seed/mi14_1/400/400,https://picsum.photos/seed/mi14_2/400/400', 6, 'Xiaomi', 1, 0),
('OPPO Find X7', '哈苏影像 旗舰体验', 'OPPO Find X7，哈苏移动影像系统，天玑9300处理器，100W快充。', 5499.00, 4999.00, 70, 189, 'https://picsum.photos/seed/oppox7/400/400', 'https://picsum.photos/seed/oppox7_1/400/400,https://picsum.photos/seed/oppox7_2/400/400', 6, 'OPPO', 1, 0),
('vivo X100 Pro', '蔡司影像 蓝海电池', 'vivo X100 Pro，蔡司APO超级长焦，蓝海电池技术。', 5999.00, 5499.00, 55, 234, 'https://picsum.photos/seed/vivox100/400/400', 'https://picsum.photos/seed/vivox100_1/400/400,https://picsum.photos/seed/vivox100_2/400/400', 6, 'vivo', 1, 0);

-- 电脑类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('MacBook Pro 14英寸', 'M3 Pro芯片 专业性能', '苹果MacBook Pro，M3 Pro芯片，18小时续航，Liquid Retina XDR显示屏。', 17999.00, 16999.00, 30, 89, 'https://picsum.photos/seed/macbook14/400/400', 'https://picsum.photos/seed/macbook14_1/400/400,https://picsum.photos/seed/macbook14_2/400/400', 7, 'Apple', 1, 0),
('MacBook Air 13英寸', 'M3芯片 轻薄便携', '苹果MacBook Air，M3芯片，1.24kg轻薄机身，18小时续航。', 10999.00, 9499.00, 45, 156, 'https://picsum.photos/seed/macbookair/400/400', 'https://picsum.photos/seed/macbookair_1/400/400,https://picsum.photos/seed/macbookair_2/400/400', 7, 'Apple', 1, 0),
('联想拯救者 Y9000P', '游戏本 酷睿i9 RTX4060', '联想拯救者Y9000P，酷睿i9处理器，RTX 4060显卡，165Hz高刷屏。', 12999.00, 10999.00, 40, 267, 'https://picsum.photos/seed/lenovo/400/400', 'https://picsum.photos/seed/lenovo_1/400/400,https://picsum.photos/seed/lenovo_2/400/400', 7, 'Lenovo', 1, 0),
('华硕 ROG 幻16', '电竞本 设计本双修', '华硕ROG幻16，酷睿i9，RTX 4070，星云屏，轻薄设计。', 14999.00, 13999.00, 25, 78, 'https://picsum.photos/seed/asusrog/400/400', 'https://picsum.photos/seed/asusrog_1/400/400,https://picsum.photos/seed/asusrog_2/400/400', 7, 'ASUS', 1, 0);

-- 平板类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('iPad Pro 12.9英寸', 'M2芯片 Liquid Retina XDR', '苹果iPad Pro，M2芯片，12.9英寸Liquid Retina XDR显示屏，支持Apple Pencil。', 9299.00, 8799.00, 35, 145, 'https://picsum.photos/seed/ipadpro/400/400', 'https://picsum.photos/seed/ipadpro_1/400/400,https://picsum.photos/seed/ipadpro_2/400/400', 8, 'Apple', 1, 0),
('iPad Air 5', 'M1芯片 性能强劲', '苹果iPad Air 5，M1芯片，10.9英寸Liquid Retina显示屏，全面屏设计。', 5499.00, 4799.00, 60, 234, 'https://picsum.photos/seed/ipadair/400/400', 'https://picsum.photos/seed/ipadair_1/400/400,https://picsum.photos/seed/ipadair_2/400/400', 8, 'Apple', 1, 0),
('小米平板6 Pro', '骁龙8+ 2.8K屏', '小米平板6 Pro，骁龙8+处理器，2.8K高清屏，144Hz刷新率。', 2799.00, 2299.00, 80, 456, 'https://picsum.photos/seed/mipad/400/400', 'https://picsum.photos/seed/mipad_1/400/400,https://picsum.photos/seed/mipad_2/400/400', 8, 'Xiaomi', 1, 0);

-- 耳机类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('AirPods Pro 2', '主动降噪 USB-C', '苹果AirPods Pro 2代，主动降噪，通透模式，空间音频。', 1999.00, 1799.00, 120, 567, 'https://picsum.photos/seed/airpods/400/400', 'https://picsum.photos/seed/airpods_1/400/400,https://picsum.photos/seed/airpods_2/400/400', 9, 'Apple', 1, 0),
('Sony WH-1000XM5', '头戴式降噪耳机', '索尼WH-1000XM5，行业领先的降噪效果，30小时续航。', 2699.00, 2399.00, 65, 234, 'https://picsum.photos/seed/sonywh/400/400', 'https://picsum.photos/seed/sonywh_1/400/400,https://picsum.photos/seed/sonywh_2/400/400', 9, 'Sony', 1, 0),
('Bose QC45', '无线消噪耳机', 'Bose QC45，无线消噪技术，24小时续航，舒适佩戴。', 2299.00, 1999.00, 55, 189, 'https://picsum.photos/seed/boseqc/400/400', 'https://picsum.photos/seed/boseqc_1/400/400,https://picsum.photos/seed/boseqc_2/400/400', 9, 'Bose', 1, 0);

-- 智能手表类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('Apple Watch Series 9', 'GPS + 蜂窝网络', '苹果手表Series 9，强大芯片，全天候视网膜显示屏，健康监测。', 3699.00, 3299.00, 70, 345, 'https://picsum.photos/seed/applewatch/400/400', 'https://picsum.photos/seed/applewatch_1/400/400,https://picsum.photos/seed/applewatch_2/400/400', 10, 'Apple', 1, 0),
('华为 Watch GT4', '健康管理 长续航', '华为Watch GT4，健康管理专家，14天超长续航。', 1688.00, 1488.00, 90, 567, 'https://picsum.photos/seed/huaweiwatch/400/400', 'https://picsum.photos/seed/huaweiwatch_1/400/400,https://picsum.photos/seed/huaweiwatch_2/400/400', 10, 'Huawei', 1, 0),
('小米手表 S3', 'eSIM独立通话', '小米手表S3，eSIM独立通话，百款表盘，117种运动模式。', 999.00, 799.00, 100, 678, 'https://picsum.photos/seed/miwatch/400/400', 'https://picsum.photos/seed/miwatch_1/400/400,https://picsum.photos/seed/miwatch_2/400/400', 10, 'Xiaomi', 1, 0);

-- 扩充品牌与价格带数据，便于前台做品牌筛选、价格区间筛选和专题会场展示
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('Redmi Note 13 Pro+', '2亿像素影像 中端爆款', 'Redmi Note 13 Pro+，面向注重性价比与影像体验的用户，覆盖热门中端价位筛选场景。', 2299.00, 1999.00, 130, 732, 'https://picsum.photos/seed/redmi_note13/400/400', 'https://picsum.photos/seed/redmi_note13_1/400/400,https://picsum.photos/seed/redmi_note13_2/400/400', 6, 'Xiaomi', 1, 0),
('荣耀 100 Pro', '轻旗舰人像手机', '荣耀100 Pro，兼顾人像拍摄、曲面屏与快充能力，用于丰富手机品牌与价格带分布。', 3999.00, 3399.00, 88, 418, 'https://picsum.photos/seed/honor100pro/400/400', 'https://picsum.photos/seed/honor100pro_1/400/400,https://picsum.photos/seed/honor100pro_2/400/400', 6, 'HONOR', 1, 0),
('美的 空气炸锅 5L', '少油烹饪 家庭常备', '美的空气炸锅，满足厨房小家电筛选场景，也让中低价家居商品更适合做价格区间过滤。', 499.00, 359.00, 160, 925, 'https://picsum.photos/seed/midea_airfryer/400/400', 'https://picsum.photos/seed/midea_airfryer_1/400/400,https://picsum.photos/seed/midea_airfryer_2/400/400', 18, 'Midea', 1, 0),
('MUJI 香薰机', '简约家居 氛围提升', '无印良品香薰机，用于补充家居装饰场景下更明确的品牌心智和 300 元内价格带样本。', 399.00, 299.00, 115, 286, 'https://picsum.photos/seed/muji_aroma/400/400', 'https://picsum.photos/seed/muji_aroma_1/400/400,https://picsum.photos/seed/muji_aroma_2/400/400', 19, 'MUJI', 1, 0),
('Anker 67W 氮化镓充电器', '轻巧快充 出差通勤必备', 'Anker 氮化镓充电器补充数码配件价位段，方便首页专题和列表页品牌筛选展示更多数码品牌。', 249.00, 199.00, 210, 1543, 'https://picsum.photos/seed/anker_charger/400/400', 'https://picsum.photos/seed/anker_charger_1/400/400,https://picsum.photos/seed/anker_charger_2/400/400', 1, 'Anker', 1, 0);

-- 男装类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('优衣库 男士圆领T恤', '纯棉舒适 舒适透气', '优衣库男士圆领T恤，100%纯棉，舒适透气，多色可选。', 99.00, 79.00, 200, 1234, 'https://picsum.photos/seed/men_tshirt/400/400', 'https://picsum.photos/seed/men_tshirt_1/400/400,https://picsum.photos/seed/men_tshirt_2/400/400', 11, 'Uniqlo', 1, 0),
('耐克 男士运动短裤', 'DRI-FIT技术 速干透气', '耐克男士运动短裤，DRI-FIT技术，速干透气，适合运动。', 299.00, 229.00, 150, 567, 'https://picsum.photos/seed/nike_shorts/400/400', 'https://picsum.photos/seed/nike_shorts_1/400/400,https://picsum.photos/seed/nike_shorts_2/400/400', 11, 'Nike', 1, 0),
('杰克琼斯 男士牛仔裤', '修身款 经典五袋', '杰克琼斯男士牛仔裤，修身剪裁，经典五袋设计，舒适耐磨。', 599.00, 399.00, 120, 345, 'https://picsum.photos/seed/jj_jeans/400/400', 'https://picsum.photos/seed/jj_jeans_1/400/400,https://picsum.photos/seed/jj_jeans_2/400/400', 11, 'Jack&Jones', 1, 0);

-- 女装类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('ONLY 女士连衣裙', '气质款 修身显瘦', 'ONLY女士连衣裙，气质设计，修身显瘦，优雅大方。', 499.00, 299.00, 100, 678, 'https://picsum.photos/seed/women_dress/400/400', 'https://picsum.photos/seed/women_dress_1/400/400,https://picsum.photos/seed/women_dress_2/400/400', 12, 'ONLY', 1, 0),
('优衣库 女士针织衫', '柔软舒适 百搭款', '优衣库女士针织衫，柔软舒适，百搭款式，春秋必备。', 199.00, 149.00, 150, 890, 'https://picsum.photos/seed/women_knit/400/400', 'https://picsum.photos/seed/women_knit_1/400/400,https://picsum.photos/seed/women_knit_2/400/400', 12, 'Uniqlo', 1, 0),
('ZARA 女士风衣', '时尚经典 双排扣', 'ZARA女士风衣，时尚经典款，双排扣设计，气场十足。', 799.00, 599.00, 80, 234, 'https://picsum.photos/seed/women_coat/400/400', 'https://picsum.photos/seed/women_coat_1/400/400,https://picsum.photos/seed/women_coat_2/400/400', 12, 'ZARA', 1, 0);

-- 运动鞋类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('耐克 Air Force 1', '经典百搭 AF1', '耐克Air Force 1，经典小白鞋，百搭款式，舒适透气。', 899.00, 749.00, 180, 2345, 'https://picsum.photos/seed/nike_af1/400/400', 'https://picsum.photos/seed/nike_af1_1/400/400,https://picsum.photos/seed/nike_af1_2/400/400', 13, 'Nike', 1, 0),
('阿迪达斯 Ultra Boost', '缓震科技 跑步鞋', '阿迪达斯Ultra Boost，Boost缓震科技，Primeknit鞋面，跑步神器。', 1599.00, 1199.00, 120, 987, 'https://picsum.photos/seed/adidas_ub/400/400', 'https://picsum.photos/seed/adidas_ub_1/400/400,https://picsum.photos/seed/adidas_ub_2/400/400', 13, 'Adidas', 1, 0),
('新百伦 574', '复古跑鞋 舒适百搭', '新百伦574，复古跑鞋，ENCAP缓震中底，舒适百搭。', 799.00, 599.00, 150, 654, 'https://picsum.photos/seed/nb574/400/400', 'https://picsum.photos/seed/nb574_1/400/400,https://picsum.photos/seed/nb574_2/400/400', 13, 'New Balance', 1, 0);

-- 箱包类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('新秀丽 商务双肩包', '大容量 通勤出差两用', '新秀丽商务双肩包，分层收纳设计，适合笔记本、文件与短途出行。', 899.00, 699.00, 90, 276, 'https://picsum.photos/seed/samsonite_bag/400/400', 'https://picsum.photos/seed/samsonite_bag_1/400/400,https://picsum.photos/seed/samsonite_bag_2/400/400', 14, 'Samsonite', 1, 0);

-- 零食类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('乐事薯片家庭装', '多口味组合 香脆可口', '乐事薯片家庭装，包含原味、番茄、烤肉等多种口味，香脆可口。', 39.90, 29.90, 300, 5678, 'https://picsum.photos/seed/lays_chips/400/400', 'https://picsum.photos/seed/lays_chips_1/400/400,https://picsum.photos/seed/lays_chips_2/400/400', 15, 'Lays', 1, 0),
('奥利奥饼干', '夹心饼干 经典美味', '奥利奥饼干，经典巧克力夹心，扭一扭舔一舔泡一泡。', 15.90, 12.90, 500, 3456, 'https://picsum.photos/seed/oreo/400/400', 'https://picsum.photos/seed/oreo_1/400/400,https://picsum.photos/seed/oreo_2/400/400', 15, 'Oreo', 1, 0),
('三只松鼠 坚果礼盒', '混合坚果 每日坚果', '三只松鼠坚果礼盒，包含核桃、杏仁、腰果等多种坚果，营养健康。', 199.00, 149.00, 200, 2345, 'https://picsum.photos/seed/squirrel/400/400', 'https://picsum.photos/seed/squirrel_1/400/400,https://picsum.photos/seed/squirrel_2/400/400', 15, '三只松鼠', 1, 0);

-- 饮料类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('可口可乐 330ml*24罐', '经典可乐 整箱装', '可口可乐，经典碳酸饮料，畅爽好滋味。', 79.00, 59.00, 400, 6789, 'https://picsum.photos/seed/coke/400/400', 'https://picsum.photos/seed/coke_1/400/400,https://picsum.photos/seed/coke_2/400/400', 16, 'Coca-Cola', 1, 0),
('百事可乐 330ml*24罐', '渴望就现 整箱装', '百事可乐，年轻一代的选择，畅爽刺激。', 79.00, 58.00, 380, 5432, 'https://picsum.photos/seed/pepsi/400/400', 'https://picsum.photos/seed/pepsi_1/400/400,https://picsum.photos/seed/pepsi_2/400/400', 16, 'Pepsi', 1, 0),
('元气森林气泡水', '0糖0脂0卡 健康饮品', '元气森林气泡水，0糖0脂0卡，健康无负担，多种口味。', 69.00, 49.00, 350, 4567, 'https://picsum.photos/seed/yuanqisenlin/400/400', 'https://picsum.photos/seed/yuanqisenlin_1/400/400,https://picsum.photos/seed/yuanqisenlin_2/400/400', 16, '元气森林', 1, 0);

-- 生鲜类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('智利车厘子礼盒', '新鲜直达 果粒饱满', '智利进口车厘子礼盒，果肉饱满，酸甜适口，适合节日送礼与家庭分享。', 258.00, 199.00, 85, 412, 'https://picsum.photos/seed/cherry_box/400/400', 'https://picsum.photos/seed/cherry_box_1/400/400,https://picsum.photos/seed/cherry_box_2/400/400', 17, 'Fresh Select', 1, 0);

-- 护肤品类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('雅诗兰黛 小棕瓶', '肌底修护精华液', '雅诗兰黛小棕瓶精华，修护肌肤，淡化细纹，紧致肌肤。', 1080.00, 980.00, 80, 1234, 'https://picsum.photos/seed/estee/400/400', 'https://picsum.photos/seed/estee_1/400/400,https://picsum.photos/seed/estee_2/400/400', 21, 'Estee Lauder', 1, 0),
('兰蔻 小黑瓶', '肌底精华滴管', '兰蔻小黑瓶精华，修护肌底，提亮肤色，改善肤质。', 1280.00, 1080.00, 70, 987, 'https://picsum.photos/seed/lancome/400/400', 'https://picsum.photos/seed/lancome_1/400/400,https://picsum.photos/seed/lancome_2/400/400', 21, 'Lancome', 1, 0),
('SK-II 神仙水', '护肤精华露', 'SK-II神仙水，含有Pitera成分，改善肌肤质地，让肌肤透亮。', 1890.00, 1690.00, 50, 765, 'https://picsum.photos/seed/skii/400/400', 'https://picsum.photos/seed/skii_1/400/400,https://picsum.photos/seed/skii_2/400/400', 21, 'SK-II', 1, 0);

-- 厨房用品类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('双立人 刀具套装', '德国工艺 锋利耐用', '双立人刀具套装，德国工艺，锋利耐用，包含菜刀、水果刀等。', 1299.00, 999.00, 60, 456, 'https://picsum.photos/seed/zwilling/400/400', 'https://picsum.photos/seed/zwilling_1/400/400,https://picsum.photos/seed/zwilling_2/400/400', 18, 'ZWILLING', 1, 0),
('美的 电饭煲', '智能预约 4L容量', '美的电饭煲，智能预约，24小时定时，4L大容量，多功能菜单。', 399.00, 299.00, 150, 2345, 'https://picsum.photos/seed/midi_rice/400/400', 'https://picsum.photos/seed/midi_rice_1/400/400,https://picsum.photos/seed/midi_rice_2/400/400', 18, 'Midea', 1, 0),
('苏泊尔 炒锅', '不粘锅 燃气电磁炉通用', '苏泊尔炒锅，不粘涂层，燃气电磁炉通用，炒菜更轻松。', 199.00, 149.00, 200, 3456, 'https://picsum.photos/seed/supor_pot/400/400', 'https://picsum.photos/seed/supor_pot_1/400/400,https://picsum.photos/seed/supor_pot_2/400/400', 18, 'SUPOR', 1, 0);

-- 家居装饰类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('北欧风装饰画组合', '客厅卧室百搭装饰', '简约北欧风装饰画组合，适合客厅、卧室与书房墙面点缀。', 299.00, 199.00, 130, 254, 'https://picsum.photos/seed/decor_painting/400/400', 'https://picsum.photos/seed/decor_painting_1/400/400,https://picsum.photos/seed/decor_painting_2/400/400', 19, 'Nordic Home', 1, 0);

-- 生活用品类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('维达 抽纸家庭装', '整箱囤货 柔韧亲肤', '维达抽纸家庭装，日常家用高频消耗品，柔韧亲肤，适合多场景使用。', 89.00, 69.00, 260, 1324, 'https://picsum.photos/seed/vinda_tissue/400/400', 'https://picsum.photos/seed/vinda_tissue_1/400/400,https://picsum.photos/seed/vinda_tissue_2/400/400', 20, 'Vinda', 1, 0);

-- 彩妆类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('完美日记 小细跟口红礼盒', '热门色号 日常百搭', '完美日记小细跟口红礼盒，包含多款热门色号，适合通勤与约会妆容。', 329.00, 239.00, 145, 548, 'https://picsum.photos/seed/perfect_diary_lipstick/400/400', 'https://picsum.photos/seed/perfect_diary_lipstick_1/400/400,https://picsum.photos/seed/perfect_diary_lipstick_2/400/400', 22, 'Perfect Diary', 1, 0);

-- 香水类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status, deleted) VALUES
('迪奥 花漾甜心淡香水', '清新花果香 约会气息', '迪奥花漾甜心淡香水，清新灵动的花果香调，适合日常通勤和约会使用。', 899.00, 799.00, 75, 436, 'https://picsum.photos/seed/dior_perfume/400/400', 'https://picsum.photos/seed/dior_perfume_1/400/400,https://picsum.photos/seed/dior_perfume_2/400/400', 23, 'Dior', 1, 0);

-- ============================================
-- 从 product.stock 初始化 inventory 数据
-- ============================================
INSERT INTO `inventory` (`product_id`, `total_stock`, `available_stock`, `locked_stock`, `sold_stock`, `version`)
SELECT `id`, `stock`, `stock`, 0, 0, 0
FROM `product`
WHERE `deleted` = 0
  AND `id` NOT IN (SELECT `product_id` FROM `inventory`);

