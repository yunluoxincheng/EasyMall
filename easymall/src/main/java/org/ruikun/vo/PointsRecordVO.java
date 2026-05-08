package org.ruikun.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分记录VO
 */
@Data
public class PointsRecordVO {
    /**
     * 记录ID
     */
    private Long id;

    /**
     * 积分变动值
     */
    private Integer pointsChange;

    /**
     * 变动前积分
     */
    private Integer beforePoints;

    /**
     * 变动后积分
     */
    private Integer afterPoints;

    /**
     * 类型
     */
    private Integer type;

    /**
     * 类型描述
     */
    private String typeDesc;

    /**
     * 来源ID
     */
    private Long sourceId;

    /**
     * 描述
     */
    private String description;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}
