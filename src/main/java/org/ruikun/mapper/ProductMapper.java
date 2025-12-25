package org.ruikun.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.ruikun.entity.Product;

import java.util.List;

@Mapper
public interface ProductMapper extends BaseMapper<Product> {
    IPage<Product> selectProductPage(Page<Product> page, @Param("categoryId") Long categoryId,
                                     @Param("keyword") String keyword, @Param("status") Integer status);

    /**
     * 使用全文索引搜索商品（性能更好）
     */
    IPage<Product> selectProductPageWithFullText(Page<Product> page, @Param("categoryId") Long categoryId,
                                                  @Param("keyword") String keyword, @Param("status") Integer status);

    List<Product> selectHotProducts(@Param("limit") Integer limit);

    List<Product> selectNewProducts(@Param("limit") Integer limit);

    List<Product> selectRelatedProducts(@Param("categoryId") Long categoryId,
                                       @Param("productId") Long productId,
                                       @Param("limit") Integer limit);

    void decreaseStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    void increaseStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);
}