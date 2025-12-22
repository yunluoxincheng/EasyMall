package org.ruikun.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.entity.UserSign;

/**
 * 用户签到记录Mapper
 */
@Mapper
public interface UserSignMapper extends BaseMapper<UserSign> {
}
