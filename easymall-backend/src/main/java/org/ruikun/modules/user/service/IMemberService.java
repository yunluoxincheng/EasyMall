package org.ruikun.modules.user.service;

import org.ruikun.modules.user.entity.MemberLevel;
import org.ruikun.modules.user.vo.MemberLevelVO;

import java.util.List;

/**
 * 会员服务接口
 */
public interface IMemberService {

    /**
     * 获取所有会员等级配置
     */
    List<MemberLevelVO> getAllMemberLevels();

    /**
     * 根据用户积分获取对应的会员等级
     */
    MemberLevel getMemberLevelByPoints(Integer points);

    /**
     * 检查用户是否可以升级，如果可以则升级
     */
    void checkAndUpgradeMember(Long userId);

    /**
     * 根据用户ID获取会员等级
     */
    MemberLevelVO getMemberLevelByUserId(Long userId);

    /**
     * 获取会员折扣率
     */
    Double getMemberDiscount(Long userId);
}
