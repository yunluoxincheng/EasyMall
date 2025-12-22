package org.ruikun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.dto.CommentCreateDTO;
import org.ruikun.entity.Comment;
import org.ruikun.entity.Order;
import org.ruikun.entity.OrderItem;
import org.ruikun.entity.User;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.CommentMapper;
import org.ruikun.mapper.OrderItemMapper;
import org.ruikun.mapper.OrderMapper;
import org.ruikun.mapper.UserMapper;
import org.ruikun.service.ICommentService;
import org.ruikun.service.IPointsService;
import org.ruikun.vo.CommentVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 商品评论服务实现类
 */
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements ICommentService {

    private final CommentMapper commentMapper;
    private final UserMapper userMapper;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final PointsServiceImpl pointsService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createComment(Long userId, CommentCreateDTO commentDTO) {
        // 验证评分范围
        if (commentDTO.getRating() < 1 || commentDTO.getRating() > 5) {
            throw new BusinessException("评分必须在1-5星之间");
        }

        // 验证订单是否属于该用户且已完成
        Order order = orderMapper.selectById(commentDTO.getOrderId());
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() != 3) {
            throw new BusinessException("只能评论已完成的订单");
        }

        // 验证订单中是否包含该商品
        LambdaQueryWrapper<org.ruikun.entity.OrderItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(org.ruikun.entity.OrderItem::getOrderId, commentDTO.getOrderId())
               .eq(org.ruikun.entity.OrderItem::getProductId, commentDTO.getProductId());
        OrderItem orderItem = orderItemMapper.selectOne(wrapper);
        if (orderItem == null) {
            throw new BusinessException("订单中不包含该商品");
        }

        // 检查是否已评论过
        LambdaQueryWrapper<Comment> existWrapper = new LambdaQueryWrapper<>();
        existWrapper.eq(Comment::getUserId, userId)
                    .eq(Comment::getOrderId, commentDTO.getOrderId())
                    .eq(Comment::getProductId, commentDTO.getProductId());
        if (commentMapper.selectCount(existWrapper) > 0) {
            throw new BusinessException("您已评论过该商品");
        }

        // 创建评论
        Comment comment = new Comment();
        comment.setUserId(userId);
        comment.setProductId(commentDTO.getProductId());
        comment.setOrderId(commentDTO.getOrderId());
        comment.setContent(commentDTO.getContent());
        comment.setRating(commentDTO.getRating());
        comment.setImages(commentDTO.getImages());
        comment.setShowStatus(1);
        commentMapper.insert(comment);

        // 增加积分
        pointsService.addPointsForComment(userId, commentDTO.getProductId());

        return comment.getId();
    }

    @Override
    public Page<CommentVO> getCommentsByProductId(Long productId, Integer pageNum, Integer pageSize) {
        Page<Comment> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getProductId, productId)
               .eq(Comment::getShowStatus, 1)
               .orderByDesc(Comment::getCreateTime);

        Page<Comment> commentPage = commentMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<CommentVO> voPage = new Page<>();
        BeanUtils.copyProperties(commentPage, voPage, "records");

        List<CommentVO> voList = commentPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public Page<CommentVO> getCommentsByUserId(Long userId, Integer pageNum, Integer pageSize) {
        Page<Comment> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getUserId, userId)
               .orderByDesc(Comment::getCreateTime);

        Page<Comment> commentPage = commentMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<CommentVO> voPage = new Page<>();
        BeanUtils.copyProperties(commentPage, voPage, "records");

        List<CommentVO> voList = commentPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        if (!comment.getUserId().equals(userId)) {
            throw new BusinessException("无权删除该评论");
        }
        commentMapper.deleteById(commentId);
    }

    @Override
    public Long getCommentCount(Long productId) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getProductId, productId)
               .eq(Comment::getShowStatus, 1);
        return commentMapper.selectCount(wrapper);
    }

    @Override
    public Double getAverageRating(Long productId) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getProductId, productId)
               .eq(Comment::getShowStatus, 1);
        List<Comment> comments = commentMapper.selectList(wrapper);

        if (comments.isEmpty()) {
            return 0.0;
        }

        double sum = comments.stream()
                .mapToInt(Comment::getRating)
                .sum();
        return sum / comments.size();
    }

    /**
     * 转换为VO
     */
    private CommentVO convertToVO(Comment comment) {
        CommentVO vo = new CommentVO();
        BeanUtils.copyProperties(comment, vo);

        // 设置用户信息
        User user = userMapper.selectById(comment.getUserId());
        if (user != null) {
            vo.setUserNickname(user.getNickname());
            vo.setUserAvatar(user.getAvatar());
        }

        return vo;
    }
}
