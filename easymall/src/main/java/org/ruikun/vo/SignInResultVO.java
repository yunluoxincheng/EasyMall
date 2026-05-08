package org.ruikun.vo;

import lombok.Data;

/**
 * 签到结果VO
 */
@Data
public class SignInResultVO {
    /**
     * 是否签到成功
     */
    private Boolean success;

    /**
     * 签到消息
     */
    private String message;

    /**
     * 本次签到获得的积分
     */
    private Integer pointsEarned;

    /**
     * 连续签到天数
     */
    private Integer continuousDays;

    /**
     * 当前总积分
     */
    private Integer currentPoints;

    /**
     * 今日是否已签到
     */
    private Boolean hasSignedToday;
}
