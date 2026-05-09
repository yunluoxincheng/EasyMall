package org.ruikun.modules.points.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.modules.points.entity.PointsRecord;

/**
 * 积分变动记录Mapper
 */
@Mapper
public interface PointsRecordMapper extends BaseMapper<PointsRecord> {
}
