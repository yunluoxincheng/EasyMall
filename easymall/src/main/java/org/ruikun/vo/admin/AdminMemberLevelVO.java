package org.ruikun.vo.admin;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 会员等级详情 VO（后台管理）
 */
@Data
public class AdminMemberLevelVO {
    private Long id;
    private Integer level;
    private String levelName;
    private Integer minPoints;
    private Integer maxPoints;
    private BigDecimal discount;
    private String icon;
    private String benefits;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
