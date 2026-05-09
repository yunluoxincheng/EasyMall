package org.ruikun.modules.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.modules.user.entity.MemberLevel;

/**
 * 会员等级配置Mapper
 */
@Mapper
public interface MemberLevelMapper extends BaseMapper<MemberLevel> {
}
