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
INSERT INTO category (name, icon, parent_id, level, sort, status) VALUES
('数码产品', 'digital', 0, 1, 1, 1),
('服装鞋帽', 'clothing', 0, 1, 2, 1),
('食品饮料', 'food', 0, 1, 3, 1),
('家居用品', 'home', 0, 1, 4, 1),
('美妆护肤', 'beauty', 0, 1, 5, 1);

-- 二级分类 - 数码产品
INSERT INTO category (name, icon, parent_id, level, sort, status) VALUES
('手机', 'phone', 1, 2, 1, 1),
('电脑', 'computer', 1, 2, 2, 1),
('平板', 'tablet', 1, 2, 3, 1),
('耳机', 'headphone', 1, 2, 4, 1),
('智能手表', 'watch', 1, 2, 5, 1);

-- 二级分类 - 服装鞋帽
INSERT INTO category (name, icon, parent_id, level, sort, status) VALUES
('男装', 'men', 2, 2, 1, 1),
('女装', 'women', 2, 2, 2, 1),
('运动鞋', 'sneaker', 2, 2, 3, 1),
('箱包', 'bag', 2, 2, 4, 1);

-- 二级分类 - 食品饮料
INSERT INTO category (name, icon, parent_id, level, sort, status) VALUES
('零食', 'snack', 3, 2, 1, 1),
('饮料', 'drink', 3, 2, 2, 1),
('生鲜', 'fresh', 3, 2, 3, 1);

-- 二级分类 - 家居用品
INSERT INTO category (name, icon, parent_id, level, sort, status) VALUES
('厨房用品', 'kitchen', 4, 2, 1, 1),
('家居装饰', 'decor', 4, 2, 2, 1),
('生活用品', 'daily', 4, 2, 3, 1);

-- 二级分类 - 美妆护肤
INSERT INTO category (name, icon, parent_id, level, sort, status) VALUES
('护肤品', 'skincare', 5, 2, 1, 1),
('彩妆', 'makeup', 5, 2, 2, 1),
('香水', 'perfume', 5, 2, 3, 1);

-- ============================================
-- 二、商品数据
-- ============================================

-- 手机类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('iPhone 15 Pro', '钛金属原色 超视网膜XDR显示屏', '苹果最新旗舰手机，搭载A17 Pro芯片，支持5G网络，拍照更清晰，续航更持久。', 8999.00, 7999.00, 50, 128, 'https://picsum.photos/seed/iphone15/400/400', 'https://picsum.photos/seed/iphone15_1/400/400,https://picsum.photos/seed/iphone15_2/400/400', 6, 'Apple', 1),
('iPhone 15', '粉色浪漫 经典设计', '苹果iPhone 15，搭载A16仿生芯片，USB-C接口，拍照更清晰。', 6999.00, 5999.00, 80, 256, 'https://picsum.photos/seed/iphone15_std/400/400', 'https://picsum.photos/seed/iphone15_std_1/400/400,https://picsum.photos/seed/iphone15_std_2/400/400', 6, 'Apple', 1),
('华为 Mate 60 Pro', '卫星通信 遥遥领先', '华为Mate 60 Pro，支持卫星通信，超光变摄像头，昆仑玻璃。', 7999.00, 6999.00, 60, 312, 'https://picsum.photos/seed/mate60/400/400', 'https://picsum.photos/seed/mate60_1/400/400,https://picsum.photos/seed/mate60_2/400/400', 6, 'Huawei', 1),
('小米14 Pro', '徕卡光学镜头 骁龙8Gen3', '小米14 Pro，徕卡专业光学镜头，骁龙8 Gen3处理器，2K屏幕。', 5999.00, 4999.00, 100, 445, 'https://picsum.photos/seed/mi14/400/400', 'https://picsum.photos/seed/mi14_1/400/400,https://picsum.photos/seed/mi14_2/400/400', 6, 'Xiaomi', 1),
('OPPO Find X7', '哈苏影像 旗舰体验', 'OPPO Find X7，哈苏移动影像系统，天玑9300处理器，100W快充。', 5499.00, 4999.00, 70, 189, 'https://picsum.photos/seed/oppox7/400/400', 'https://picsum.photos/seed/oppox7_1/400/400,https://picsum.photos/seed/oppox7_2/400/400', 6, 'OPPO', 1),
('vivo X100 Pro', '蔡司影像 蓝海电池', 'vivo X100 Pro，蔡司APO超级长焦，蓝海电池技术。', 5999.00, 5499.00, 55, 234, 'https://picsum.photos/seed/vivox100/400/400', 'https://picsum.photos/seed/vivox100_1/400/400,https://picsum.photos/seed/vivox100_2/400/400', 6, 'vivo', 1);

-- 电脑类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('MacBook Pro 14英寸', 'M3 Pro芯片 专业性能', '苹果MacBook Pro，M3 Pro芯片，18小时续航，Liquid Retina XDR显示屏。', 17999.00, 16999.00, 30, 89, 'https://picsum.photos/seed/macbook14/400/400', 'https://picsum.photos/seed/macbook14_1/400/400,https://picsum.photos/seed/macbook14_2/400/400', 7, 'Apple', 1),
('MacBook Air 13英寸', 'M3芯片 轻薄便携', '苹果MacBook Air，M3芯片，1.24kg轻薄机身，18小时续航。', 10999.00, 9499.00, 45, 156, 'https://picsum.photos/seed/macbookair/400/400', 'https://picsum.photos/seed/macbookair_1/400/400,https://picsum.photos/seed/macbookair_2/400/400', 7, 'Apple', 1),
('联想拯救者 Y9000P', '游戏本 酷睿i9 RTX4060', '联想拯救者Y9000P，酷睿i9处理器，RTX 4060显卡，165Hz高刷屏。', 12999.00, 10999.00, 40, 267, 'https://picsum.photos/seed/lenovo/400/400', 'https://picsum.photos/seed/lenovo_1/400/400,https://picsum.photos/seed/lenovo_2/400/400', 7, 'Lenovo', 1),
('华硕 ROG 幻16', '电竞本 设计本双修', '华硕ROG幻16，酷睿i9，RTX 4070，星云屏，轻薄设计。', 14999.00, 13999.00, 25, 78, 'https://picsum.photos/seed/asusrog/400/400', 'https://picsum.photos/seed/asusrog_1/400/400,https://picsum.photos/seed/asusrog_2/400/400', 7, 'ASUS', 1);

-- 平板类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('iPad Pro 12.9英寸', 'M2芯片 Liquid Retina XDR', '苹果iPad Pro，M2芯片，12.9英寸Liquid Retina XDR显示屏，支持Apple Pencil。', 9299.00, 8799.00, 35, 145, 'https://picsum.photos/seed/ipadpro/400/400', 'https://picsum.photos/seed/ipadpro_1/400/400,https://picsum.photos/seed/ipadpro_2/400/400', 8, 'Apple', 1),
('iPad Air 5', 'M1芯片 性能强劲', '苹果iPad Air 5，M1芯片，10.9英寸Liquid Retina显示屏，全面屏设计。', 5499.00, 4799.00, 60, 234, 'https://picsum.photos/seed/ipadair/400/400', 'https://picsum.photos/seed/ipadair_1/400/400,https://picsum.photos/seed/ipadair_2/400/400', 8, 'Apple', 1),
('小米平板6 Pro', '骁龙8+ 2.8K屏', '小米平板6 Pro，骁龙8+处理器，2.8K高清屏，144Hz刷新率。', 2799.00, 2299.00, 80, 456, 'https://picsum.photos/seed/mipad/400/400', 'https://picsum.photos/seed/mipad_1/400/400,https://picsum.photos/seed/mipad_2/400/400', 8, 'Xiaomi', 1);

-- 耳机类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('AirPods Pro 2', '主动降噪 USB-C', '苹果AirPods Pro 2代，主动降噪，通透模式，空间音频。', 1999.00, 1799.00, 120, 567, 'https://picsum.photos/seed/airpods/400/400', 'https://picsum.photos/seed/airpods_1/400/400,https://picsum.photos/seed/airpods_2/400/400', 9, 'Apple', 1),
('Sony WH-1000XM5', '头戴式降噪耳机', '索尼WH-1000XM5，行业领先的降噪效果，30小时续航。', 2699.00, 2399.00, 65, 234, 'https://picsum.photos/seed/sonywh/400/400', 'https://picsum.photos/seed/sonywh_1/400/400,https://picsum.photos/seed/sonywh_2/400/400', 9, 'Sony', 1),
('Bose QC45', '无线消噪耳机', 'Bose QC45，无线消噪技术，24小时续航，舒适佩戴。', 2299.00, 1999.00, 55, 189, 'https://picsum.photos/seed/boseqc/400/400', 'https://picsum.photos/seed/boseqc_1/400/400,https://picsum.photos/seed/boseqc_2/400/400', 9, 'Bose', 1);

-- 智能手表类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('Apple Watch Series 9', 'GPS + 蜂窝网络', '苹果手表Series 9，强大芯片，全天候视网膜显示屏，健康监测。', 3699.00, 3299.00, 70, 345, 'https://picsum.photos/seed/applewatch/400/400', 'https://picsum.photos/seed/applewatch_1/400/400,https://picsum.photos/seed/applewatch_2/400/400', 10, 'Apple', 1),
('华为 Watch GT4', '健康管理 长续航', '华为Watch GT4，健康管理专家，14天超长续航。', 1688.00, 1488.00, 90, 567, 'https://picsum.photos/seed/huaweiwatch/400/400', 'https://picsum.photos/seed/huaweiwatch_1/400/400,https://picsum.photos/seed/huaweiwatch_2/400/400', 10, 'Huawei', 1),
('小米手表 S3', 'eSIM独立通话', '小米手表S3，eSIM独立通话，百款表盘，117种运动模式。', 999.00, 799.00, 100, 678, 'https://picsum.photos/seed/miwatch/400/400', 'https://picsum.photos/seed/miwatch_1/400/400,https://picsum.photos/seed/miwatch_2/400/400', 10, 'Xiaomi', 1);

-- 男装类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('优衣库 男士圆领T恤', '纯棉舒适 舒适透气', '优衣库男士圆领T恤，100%纯棉，舒适透气，多色可选。', 99.00, 79.00, 200, 1234, 'https://picsum.photos/seed/men_tshirt/400/400', 'https://picsum.photos/seed/men_tshirt_1/400/400,https://picsum.photos/seed/men_tshirt_2/400/400', 11, 'Uniqlo', 1),
('耐克 男士运动短裤', 'DRI-FIT技术 速干透气', '耐克男士运动短裤，DRI-FIT技术，速干透气，适合运动。', 299.00, 229.00, 150, 567, 'https://picsum.photos/seed/nike_shorts/400/400', 'https://picsum.photos/seed/nike_shorts_1/400/400,https://picsum.photos/seed/nike_shorts_2/400/400', 11, 'Nike', 1),
('杰克琼斯 男士牛仔裤', '修身款 经典五袋', '杰克琼斯男士牛仔裤，修身剪裁，经典五袋设计，舒适耐磨。', 599.00, 399.00, 120, 345, 'https://picsum.photos/seed/jj_jeans/400/400', 'https://picsum.photos/seed/jj_jeans_1/400/400,https://picsum.photos/seed/jj_jeans_2/400/400', 11, 'Jack&Jones', 1);

-- 女装类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('ONLY 女士连衣裙', '气质款 修身显瘦', 'ONLY女士连衣裙，气质设计，修身显瘦，优雅大方。', 499.00, 299.00, 100, 678, 'https://picsum.photos/seed/women_dress/400/400', 'https://picsum.photos/seed/women_dress_1/400/400,https://picsum.photos/seed/women_dress_2/400/400', 12, 'ONLY', 1),
('优衣库 女士针织衫', '柔软舒适 百搭款', '优衣库女士针织衫，柔软舒适，百搭款式，春秋必备。', 199.00, 149.00, 150, 890, 'https://picsum.photos/seed/women_knit/400/400', 'https://picsum.photos/seed/women_knit_1/400/400,https://picsum.photos/seed/women_knit_2/400/400', 12, 'Uniqlo', 1),
('ZARA 女士风衣', '时尚经典 双排扣', 'ZARA女士风衣，时尚经典款，双排扣设计，气场十足。', 799.00, 599.00, 80, 234, 'https://picsum.photos/seed/women_coat/400/400', 'https://picsum.photos/seed/women_coat_1/400/400,https://picsum.photos/seed/women_coat_2/400/400', 12, 'ZARA', 1);

-- 运动鞋类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('耐克 Air Force 1', '经典百搭 AF1', '耐克Air Force 1，经典小白鞋，百搭款式，舒适透气。', 899.00, 749.00, 180, 2345, 'https://picsum.photos/seed/nike_af1/400/400', 'https://picsum.photos/seed/nike_af1_1/400/400,https://picsum.photos/seed/nike_af1_2/400/400', 13, 'Nike', 1),
('阿迪达斯 Ultra Boost', '缓震科技 跑步鞋', '阿迪达斯Ultra Boost，Boost缓震科技，Primeknit鞋面，跑步神器。', 1599.00, 1199.00, 120, 987, 'https://picsum.photos/seed/adidas_ub/400/400', 'https://picsum.photos/seed/adidas_ub_1/400/400,https://picsum.photos/seed/adidas_ub_2/400/400', 13, 'Adidas', 1),
('新百伦 574', '复古跑鞋 舒适百搭', '新百伦574，复古跑鞋，ENCAP缓震中底，舒适百搭。', 799.00, 599.00, 150, 654, 'https://picsum.photos/seed/nb574/400/400', 'https://picsum.photos/seed/nb574_1/400/400,https://picsum.photos/seed/nb574_2/400/400', 13, 'New Balance', 1);

-- 零食类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('乐事薯片家庭装', '多口味组合 香脆可口', '乐事薯片家庭装，包含原味、番茄、烤肉等多种口味，香脆可口。', 39.90, 29.90, 300, 5678, 'https://picsum.photos/seed/lays_chips/400/400', 'https://picsum.photos/seed/lays_chips_1/400/400,https://picsum.photos/seed/lays_chips_2/400/400', 15, 'Lays', 1),
('奥利奥饼干', '夹心饼干 经典美味', '奥利奥饼干，经典巧克力夹心，扭一扭舔一舔泡一泡。', 15.90, 12.90, 500, 3456, 'https://picsum.photos/seed/oreo/400/400', 'https://picsum.photos/seed/oreo_1/400/400,https://picsum.photos/seed/oreo_2/400/400', 15, 'Oreo', 1),
('三只松鼠 坚果礼盒', '混合坚果 每日坚果', '三只松鼠坚果礼盒，包含核桃、杏仁、腰果等多种坚果，营养健康。', 199.00, 149.00, 200, 2345, 'https://picsum.photos/seed/squirrel/400/400', 'https://picsum.photos/seed/squirrel_1/400/400,https://picsum.photos/seed/squirrel_2/400/400', 15, '三只松鼠', 1);

-- 饮料类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('可口可乐 330ml*24罐', '经典可乐 整箱装', '可口可乐，经典碳酸饮料，畅爽好滋味。', 79.00, 59.00, 400, 6789, 'https://picsum.photos/seed/coke/400/400', 'https://picsum.photos/seed/coke_1/400/400,https://picsum.photos/seed/coke_2/400/400', 16, 'Coca-Cola', 1),
('百事可乐 330ml*24罐', '渴望就现 整箱装', '百事可乐，年轻一代的选择，畅爽刺激。', 79.00, 58.00, 380, 5432, 'https://picsum.photos/seed/pepsi/400/400', 'https://picsum.photos/seed/pepsi_1/400/400,https://picsum.photos/seed/pepsi_2/400/400', 16, 'Pepsi', 1),
('元气森林气泡水', '0糖0脂0卡 健康饮品', '元气森林气泡水，0糖0脂0卡，健康无负担，多种口味。', 69.00, 49.00, 350, 4567, 'https://picsum.photos/seed/yuanqisenlin/400/400', 'https://picsum.photos/seed/yuanqisenlin_1/400/400,https://picsum.photos/seed/yuanqisenlin_2/400/400', 16, '元气森林', 1);

-- 护肤品类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('雅诗兰黛 小棕瓶', '肌底修护精华液', '雅诗兰黛小棕瓶精华，修护肌肤，淡化细纹，紧致肌肤。', 1080.00, 980.00, 80, 1234, 'https://picsum.photos/seed/estee/400/400', 'https://picsum.photos/seed/estee_1/400/400,https://picsum.photos/seed/estee_2/400/400', 21, 'Estee Lauder', 1),
('兰蔻 小黑瓶', '肌底精华滴管', '兰蔻小黑瓶精华，修护肌底，提亮肤色，改善肤质。', 1280.00, 1080.00, 70, 987, 'https://picsum.photos/seed/lancome/400/400', 'https://picsum.photos/seed/lancome_1/400/400,https://picsum.photos/seed/lancome_2/400/400', 21, 'Lancome', 1),
('SK-II 神仙水', '护肤精华露', 'SK-II神仙水，含有Pitera成分，改善肌肤质地，让肌肤透亮。', 1890.00, 1690.00, 50, 765, 'https://picsum.photos/seed/skii/400/400', 'https://picsum.photos/seed/skii_1/400/400,https://picsum.photos/seed/skii_2/400/400', 21, 'SK-II', 1);

-- 厨房用品类商品
INSERT INTO product (name, subtitle, description, original_price, price, stock, sales, image, images, category_id, brand, status) VALUES
('双立人 刀具套装', '德国工艺 锋利耐用', '双立人刀具套装，德国工艺，锋利耐用，包含菜刀、水果刀等。', 1299.00, 999.00, 60, 456, 'https://picsum.photos/seed/zwilling/400/400', 'https://picsum.photos/seed/zwilling_1/400/400,https://picsum.photos/seed/zwilling_2/400/400', 18, 'ZWILLING', 1),
('美的 电饭煲', '智能预约 4L容量', '美的电饭煲，智能预约，24小时定时，4L大容量，多功能菜单。', 399.00, 299.00, 150, 2345, 'https://picsum.photos/seed/midi_rice/400/400', 'https://picsum.photos/seed/midi_rice_1/400/400,https://picsum.photos/seed/midi_rice_2/400/400', 18, 'Midea', 1),
('苏泊尔 炒锅', '不粘锅 燃气电磁炉通用', '苏泊尔炒锅，不粘涂层，燃气电磁炉通用，炒菜更轻松。', 199.00, 149.00, 200, 3456, 'https://picsum.photos/seed/supor_pot/400/400', 'https://picsum.photos/seed/supor_pot_1/400/400,https://picsum.photos/seed/supor_pot_2/400/400', 18, 'SUPOR', 1);
