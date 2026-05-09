package org.ruikun.modules.comment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.modules.comment.entity.Comment;

/**
 * 商品评论Mapper
 */
@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
