package org.ruikun.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分变动记录表
 */
@Data
@TableName("points_record")
public class PointsRecord {
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 积分变动值(正为增加，负为减少)
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
     * 积分类型 1-订单获得 2-评价获得 3-签到获得 4-系统赠送 5-兑换消耗 6-退款扣除
     */
    private Integer type;

    /**
     * 来源ID(订单ID等)
     */
    private Long sourceId;

    /**
     * 描述
     */
    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
