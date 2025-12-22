package org.ruikun.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.entity.Favorite;

/**
 * 商品收藏Mapper
 */
@Mapper
public interface FavoriteMapper extends BaseMapper<Favorite> {
}
