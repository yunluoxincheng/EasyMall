package org.ruikun.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.entity.Comment;

/**
 * 商品评论Mapper
 */
@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
