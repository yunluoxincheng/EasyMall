package org.ruikun.vo.admin;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 评论详情 VO（后台管理）
 */
@Data
public class AdminCommentVO {
    private Long id;
    private Long userId;
    private String username;
    private String nickname;
    private String userAvatar;
    private Long productId;
    private String productName;
    private String productImage;
    private Long orderId;
    private String content;
    private List<String> images;
    private Integer rating;
    private String reply;
    private LocalDateTime replyTime;
    private Integer showStatus;
    private LocalDateTime createTime;
}
