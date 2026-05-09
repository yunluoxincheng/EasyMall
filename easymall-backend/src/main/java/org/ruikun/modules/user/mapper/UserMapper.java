package org.ruikun.modules.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.modules.user.entity.User;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}