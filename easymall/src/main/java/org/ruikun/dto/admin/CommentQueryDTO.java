package org.ruikun.dto.admin;

import lombok.Data;

/**
 * 评论查询条件 DTO（后台管理）
 */
@Data
public class CommentQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private Long productId;       // 商品 ID
    private Long userId;          // 用户 ID
    private Integer showStatus;   // 审核状态（0=隐藏/待审核，1=显示）
    private Integer rating;       // 评分
}
