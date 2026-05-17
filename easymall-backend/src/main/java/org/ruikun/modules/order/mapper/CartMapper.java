package org.ruikun.modules.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.ruikun.modules.order.entity.Cart;

import java.util.List;

@Mapper
public interface CartMapper extends BaseMapper<Cart> {
    List<Cart> getCartByUserId(Long userId);

    Cart getCartByUserIdAndProductId(@Param("userId") Long userId,
                                     @Param("productId") Long productId);

    void batchUpdateSelected(@Param("userId") Long userId,
                            @Param("cartIds") List<Long> cartIds,
                            @Param("selected") Boolean selected);

    void updateCartByUserIdAndProductId(@Param("userId") Long userId,
                                        @Param("productId") Long productId,
                                        @Param("quantity") Integer quantity);

    @Delete("DELETE FROM cart WHERE user_id = #{userId} AND product_id = #{productId} AND deleted = 1")
    int physicallyDeleteSoftDeleted(@Param("userId") Long userId, @Param("productId") Long productId);

    @Delete("DELETE FROM cart WHERE user_id = #{userId} AND deleted = 1")
    int physicallyDeleteAllSoftDeleted(@Param("userId") Long userId);
}