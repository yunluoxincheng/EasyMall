package org.ruikun.vo.admin;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 评论列表项 VO（后台管理）
 */
@Data
public class AdminCommentPageVO {
    private Long id;
    private Long userId;
    private String username;
    private String nickname;
    private Long productId;
    private String productName;
    private String content;
    private Integer rating;
    private Integer showStatus;
    private String reply;
    private LocalDateTime createTime;
}
