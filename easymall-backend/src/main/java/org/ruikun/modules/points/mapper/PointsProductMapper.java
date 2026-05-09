package org.ruikun.modules.points.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.modules.points.entity.PointsProduct;

/**
 * 积分兑换商品Mapper
 */
@Mapper
public interface PointsProductMapper extends BaseMapper<PointsProduct> {
}
