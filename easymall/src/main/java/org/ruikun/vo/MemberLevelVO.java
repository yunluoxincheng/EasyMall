package org.ruikun.vo;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 会员等级VO
 */
@Data
public class MemberLevelVO {
    /**
     * 等级
     */
    private Integer level;

    /**
     * 等级名称
     */
    private String levelName;

    /**
     * 所需最小积分
     */
    private Integer minPoints;

    /**
     * 所需最大积分
     */
    private Integer maxPoints;

    /**
     * 折扣率
     */
    private BigDecimal discount;

    /**
     * 等级图标
     */
    private String icon;

    /**
     * 会员权益描述
     */
    private String benefits;

    /**
     * 当前用户积分(用于显示进度)
     */
    private Integer currentPoints;

    /**
     * 距离下一等级所需积分
     */
    private Integer pointsToNextLevel;

    /**
     * 是否为当前用户的等级
     */
    private Boolean isCurrentLevel;
}
