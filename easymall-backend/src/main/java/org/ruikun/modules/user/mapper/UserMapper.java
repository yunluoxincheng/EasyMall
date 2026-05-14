package org.ruikun.modules.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.ruikun.modules.user.entity.User;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("SELECT points FROM user WHERE id = #{userId}")
    Integer selectPointsById(@Param("userId") Long userId);

    @Update("UPDATE user SET points = points + #{delta} WHERE id = #{userId}")
    int atomicAddPoints(@Param("userId") Long userId, @Param("delta") int delta);

    @Update("UPDATE user SET points = points - #{delta} WHERE id = #{userId} AND points >= #{delta}")
    int atomicDeductPoints(@Param("userId") Long userId, @Param("delta") int delta);
}
