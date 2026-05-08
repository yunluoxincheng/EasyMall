package org.ruikun.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 商品评论VO
 */
@Data
public class CommentVO {
    /**
     * 评论ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户昵称
     */
    private String userNickname;

    /**
     * 用户头像
     */
    private String userAvatar;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * 订单ID
     */
    private Long orderId;

    /**
     * 评论内容
     */
    private String content;

    /**
     * 评分 1-5星
     */
    private Integer rating;

    /**
     * 评论图片
     */
    private String images;

    /**
     * 商家回复
     */
    private String reply;

    /**
     * 回复时间
     */
    private LocalDateTime replyTime;

    /**
     * 评论时间
     */
    private LocalDateTime createTime;
}
