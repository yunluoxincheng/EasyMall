-- ============================================
-- 添加商品全文搜索索引
-- ============================================
-- 说明：为商品表的 name 和 subtitle 字段添加 FULLTEXT 索引
-- 支持中文全文搜索，使用 ngram 分词器
-- ============================================

-- 添加商品名称和副标题的全文索引
-- 使用 ngram 分词器支持中文搜索
ALTER TABLE `product`
ADD FULLTEXT INDEX `ft_product_search` (`name`, `subtitle`) WITH PARSER ngram;

-- 为商品描述单独添加全文索引（可选，因为描述字段可能很长）
ALTER TABLE `product`
ADD FULLTEXT INDEX `ft_product_description` (`description`) WITH PARSER ngram;

-- 查看索引创建结果
-- SHOW INDEX FROM `product`;
