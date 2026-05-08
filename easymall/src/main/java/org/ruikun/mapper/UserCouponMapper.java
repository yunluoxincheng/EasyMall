package org.ruikun.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.entity.UserCoupon;

/**
 * 用户优惠券 Mapper 接口
 */
@Mapper
public interface UserCouponMapper extends BaseMapper<UserCoupon> {
}
