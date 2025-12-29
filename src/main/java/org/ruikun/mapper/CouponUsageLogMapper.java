package org.ruikun.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.entity.CouponUsageLog;

/**
 * 优惠券使用记录 Mapper 接口
 */
@Mapper
public interface CouponUsageLogMapper extends BaseMapper<CouponUsageLog> {
}
