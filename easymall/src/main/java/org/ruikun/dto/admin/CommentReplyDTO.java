package org.ruikun.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 评论回复 DTO（后台管理）
 */
@Data
public class CommentReplyDTO {

    @NotBlank(message = "回复内容不能为空")
    private String reply;
}
