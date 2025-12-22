package org.ruikun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.ruikun.entity.User;
import org.ruikun.entity.UserSign;
import org.ruikun.enums.PointsTypeEnum;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.UserMapper;
import org.ruikun.mapper.UserSignMapper;
import org.ruikun.service.ISignInService;
import org.ruikun.service.IPointsService;
import org.ruikun.vo.SignInResultVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * 签到服务实现类
 */
@Service
@RequiredArgsConstructor
public class SignInServiceImpl implements ISignInService {

    private final UserSignMapper userSignMapper;
    private final UserMapper userMapper;
    private final IPointsService pointsService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SignInResultVO signIn(Long userId) {
        // 检查用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 检查今日是否已签到
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<UserSign> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserSign::getUserId, userId)
               .eq(UserSign::getSignDate, today);

        UserSign todaySign = userSignMapper.selectOne(wrapper);
        if (todaySign != null) {
            SignInResultVO result = new SignInResultVO();
            result.setSuccess(false);
            result.setMessage("今日已签到，请明天再来");
            result.setHasSignedToday(true);
            result.setContinuousDays(todaySign.getContinuousDays());
            result.setCurrentPoints(user.getPoints());
            return result;
        }

        // 获取昨天的签到记录，计算连续签到天数
        LocalDate yesterday = today.minusDays(1);
        LambdaQueryWrapper<UserSign> yesterdayWrapper = new LambdaQueryWrapper<>();
        yesterdayWrapper.eq(UserSign::getUserId, userId)
                       .eq(UserSign::getSignDate, yesterday);

        UserSign yesterdaySign = userSignMapper.selectOne(yesterdayWrapper);
        int continuousDays = (yesterdaySign != null) ? yesterdaySign.getContinuousDays() + 1 : 1;

        // 计算签到积分
        int pointsEarned = org.ruikun.service.impl.PointsServiceImpl.calculateSignPoints(continuousDays);

        // 创建签到记录
        UserSign userSign = new UserSign();
        userSign.setUserId(userId);
        userSign.setSignDate(today);
        userSign.setContinuousDays(continuousDays);
        userSign.setPointsEarned(pointsEarned);
        userSignMapper.insert(userSign);

        // 增加积分
        pointsService.addPoints(userId, pointsEarned, PointsTypeEnum.SIGN.getCode(),
                               userSign.getId(), "连续签到" + continuousDays + "天");

        // 获取用户最新积分
        user = userMapper.selectById(userId);

        // 返回结果
        SignInResultVO result = new SignInResultVO();
        result.setSuccess(true);
        result.setMessage("签到成功！获得" + pointsEarned + "积分");
        result.setPointsEarned(pointsEarned);
        result.setContinuousDays(continuousDays);
        result.setCurrentPoints(user.getPoints());
        result.setHasSignedToday(false);

        return result;
    }

    @Override
    public boolean hasSignedToday(Long userId) {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<UserSign> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserSign::getUserId, userId)
               .eq(UserSign::getSignDate, today);

        return userSignMapper.selectCount(wrapper) > 0;
    }

    @Override
    public Integer getContinuousDays(Long userId) {
        // 获取最近一次的签到记录
        LambdaQueryWrapper<UserSign> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserSign::getUserId, userId)
               .orderByDesc(UserSign::getSignDate)
               .last("LIMIT 1");

        UserSign lastSign = userSignMapper.selectOne(wrapper);
        if (lastSign == null) {
            return 0;
        }

        // 如果最后一次签到是今天或昨天，返回连续天数
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        if (lastSign.getSignDate().equals(today) || lastSign.getSignDate().equals(yesterday)) {
            return lastSign.getContinuousDays();
        }

        // 否则连续天数已中断
        return 0;
    }
}
