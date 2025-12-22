package org.ruikun.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.ruikun.dto.CommentCreateDTO;
import org.ruikun.vo.CommentVO;

/**
 * 商品评论服务接口
 */
public interface ICommentService {

    /**
     * 创建商品评论
     *
     * @param userId 用户ID
     * @param commentDTO 评论信息
     * @return 评论ID
     */
    Long createComment(Long userId, CommentCreateDTO commentDTO);

    /**
     * 分页查询商品评论
     *
     * @param productId 商品ID
     * @param pageNum 页码
     * @param pageSize 页大小
     * @return 评论分页数据
     */
    Page<CommentVO> getCommentsByProductId(Long productId, Integer pageNum, Integer pageSize);

    /**
     * 分页查询用户评论
     *
     * @param userId 用户ID
     * @param pageNum 页码
     * @param pageSize 页大小
     * @return 评论分页数据
     */
    Page<CommentVO> getCommentsByUserId(Long userId, Integer pageNum, Integer pageSize);

    /**
     * 删除评论
     *
     * @param userId 用户ID
     * @param commentId 评论ID
     */
    void deleteComment(Long userId, Long commentId);

    /**
     * 获取商品评论数量
     *
     * @param productId 商品ID
     * @return 评论数量
     */
    Long getCommentCount(Long productId);

    /**
     * 获取商品平均评分
     *
     * @param productId 商品ID
     * @return 平均评分
     */
    Double getAverageRating(Long productId);
}
