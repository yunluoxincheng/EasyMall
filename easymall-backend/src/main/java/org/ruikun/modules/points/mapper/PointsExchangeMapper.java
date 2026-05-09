package org.ruikun.modules.points.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.modules.points.entity.PointsExchange;

/**
 * 积分兑换记录Mapper
 */
@Mapper
public interface PointsExchangeMapper extends BaseMapper<PointsExchange> {
}
