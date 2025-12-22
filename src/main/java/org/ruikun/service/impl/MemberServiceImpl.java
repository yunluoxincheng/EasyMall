package org.ruikun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.ruikun.entity.MemberLevel;
import org.ruikun.entity.User;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.MemberLevelMapper;
import org.ruikun.mapper.UserMapper;
import org.ruikun.service.IMemberService;
import org.ruikun.vo.MemberLevelVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 会员服务实现类
 */
@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements IMemberService {

    private final MemberLevelMapper memberLevelMapper;
    private final UserMapper userMapper;

    @Override
    public List<MemberLevelVO> getAllMemberLevels() {
        LambdaQueryWrapper<MemberLevel> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MemberLevel::getStatus, 1)
               .orderByAsc(MemberLevel::getLevel);

        List<MemberLevel> levels = memberLevelMapper.selectList(wrapper);

        return levels.stream().map(level -> {
            MemberLevelVO vo = new MemberLevelVO();
            BeanUtils.copyProperties(level, vo);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public MemberLevel getMemberLevelByPoints(Integer points) {
        if (points == null) {
            points = 0;
        }

        LambdaQueryWrapper<MemberLevel> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MemberLevel::getStatus, 1)
               .le(MemberLevel::getMinPoints, points)
               .orderByDesc(MemberLevel::getMinPoints)
               .last("LIMIT 1");

        return memberLevelMapper.selectOne(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkAndUpgradeMember(Long userId) {
        // 获取用户信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 获取当前积分对应的会员等级
        MemberLevel targetLevel = getMemberLevelByPoints(user.getPoints());
        if (targetLevel == null) {
            return;
        }

        // 如果当前等级与目标等级不同，则升级
        if (!targetLevel.getLevel().equals(user.getLevel())) {
            Integer oldLevel = user.getLevel();
            user.setLevel(targetLevel.getLevel());
            userMapper.updateById(user);
        }
    }

    @Override
    public MemberLevelVO getMemberLevelByUserId(Long userId) {
        // 获取用户信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 获取当前积分对应的会员等级
        MemberLevel memberLevel = getMemberLevelByPoints(user.getPoints());
        if (memberLevel == null) {
            return null;
        }

        // 转换为VO
        MemberLevelVO vo = new MemberLevelVO();
        BeanUtils.copyProperties(memberLevel, vo);
        vo.setCurrentPoints(user.getPoints());
        vo.setIsCurrentLevel(memberLevel.getLevel().equals(user.getLevel()));

        // 计算距离下一等级所需的积分
        MemberLevel nextLevel = getNextLevel(memberLevel.getLevel());
        if (nextLevel != null) {
            Integer pointsNeeded = nextLevel.getMinPoints() - user.getPoints();
            vo.setPointsToNextLevel(pointsNeeded > 0 ? pointsNeeded : 0);
        } else {
            vo.setPointsToNextLevel(0); // 已经是最高等级
        }

        return vo;
    }

    @Override
    public Double getMemberDiscount(Long userId) {
        // 获取用户信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 获取会员等级
        MemberLevel memberLevel = getMemberLevelByPoints(user.getPoints());
        if (memberLevel == null) {
            return 1.0; // 无等级，无折扣
        }

        // 返回折扣率
        return memberLevel.getDiscount().doubleValue();
    }

    /**
     * 获取下一等级
     */
    private MemberLevel getNextLevel(Integer currentLevel) {
        LambdaQueryWrapper<MemberLevel> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MemberLevel::getStatus, 1)
               .gt(MemberLevel::getLevel, currentLevel)
               .orderByAsc(MemberLevel::getLevel)
               .last("LIMIT 1");

        return memberLevelMapper.selectOne(wrapper);
    }
}
