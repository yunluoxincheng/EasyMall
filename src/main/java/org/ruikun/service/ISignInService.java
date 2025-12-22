package org.ruikun.service;

import org.ruikun.vo.SignInResultVO;

/**
 * 签到服务接口
 */
public interface ISignInService {

    /**
     * 用户签到
     *
     * @param userId 用户ID
     * @return 签到结果
     */
    SignInResultVO signIn(Long userId);

    /**
     * 检查用户今日是否已签到
     *
     * @param userId 用户ID
     * @return true-已签到 false-未签到
     */
    boolean hasSignedToday(Long userId);

    /**
     * 获取用户连续签到天数
     *
     * @param userId 用户ID
     * @return 连续签到天数
     */
    Integer getContinuousDays(Long userId);
}
