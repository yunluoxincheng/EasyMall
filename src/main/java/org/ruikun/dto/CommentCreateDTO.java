package org.ruikun.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建评论DTO
 */
@Data
public class CommentCreateDTO {

    /**
     * 商品ID
     */
    @NotNull(message = "商品ID不能为空")
    private Long productId;

    /**
     * 订单ID
     */
    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    /**
     * 评论内容
     */
    @Size(min = 5, max = 500, message = "评论内容长度必须在5-500字符之间")
    private String content;

    /**
     * 评分 1-5星
     */
    @NotNull(message = "评分不能为空")
    private Integer rating;

    /**
     * 评论图片，多个用逗号分隔
     */
    private String images;
}
