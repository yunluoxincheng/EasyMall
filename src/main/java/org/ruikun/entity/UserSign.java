package org.ruikun.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户签到记录表
 */
@Data
@TableName("user_sign")
public class UserSign {
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 签到日期
     */
    private LocalDate signDate;

    /**
     * 连续签到天数
     */
    private Integer continuousDays;

    /**
     * 本次签到获得的积分
     */
    private Integer pointsEarned;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
