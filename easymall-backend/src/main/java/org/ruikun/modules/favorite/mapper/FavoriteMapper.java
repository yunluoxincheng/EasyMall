package org.ruikun.modules.favorite.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.ruikun.modules.favorite.entity.Favorite;

/**
 * 商品收藏Mapper
 */
@Mapper
public interface FavoriteMapper extends BaseMapper<Favorite> {

    @Delete("DELETE FROM favorite WHERE user_id = #{userId} AND product_id = #{productId} AND deleted = 1")
    int physicallyDeleteSoftDeleted(@Param("userId") Long userId, @Param("productId") Long productId);
}
