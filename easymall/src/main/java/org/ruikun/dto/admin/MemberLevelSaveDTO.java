package org.ruikun.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 会员等级保存 DTO（后台管理）
 */
@Data
public class MemberLevelSaveDTO {
    @NotNull(message = "等级不能为空")
    private Integer level;

    @NotBlank(message = "等级名称不能为空")
    private String levelName;

    @NotNull(message = "最小积分不能为空")
    private Integer minPoints;

    @NotNull(message = "最大积分不能为空")
    private Integer maxPoints;

    @NotNull(message = "折扣率不能为空")
    @DecimalMin(value = "0.01", message = "折扣率必须大于0")
    @DecimalMin(value = "1.0", message = "折扣率不能大于1")
    private BigDecimal discount;

    private String icon;

    private String benefits;

    private Integer sortOrder;
}
