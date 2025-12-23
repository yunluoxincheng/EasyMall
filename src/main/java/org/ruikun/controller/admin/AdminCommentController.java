package org.ruikun.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.dto.admin.CommentQueryDTO;
import org.ruikun.entity.Comment;
import org.ruikun.mapper.CommentMapper;
import org.ruikun.mapper.ProductMapper;
import org.ruikun.mapper.UserMapper;
import org.ruikun.vo.admin.AdminCommentPageVO;
import org.ruikun.vo.admin.AdminCommentVO;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 评论管理控制器（后台管理）
 */
@RestController
@RequestMapping("/api/admin/comments")
@RequiredArgsConstructor
public class AdminCommentController {

    private final CommentMapper commentMapper;
    private final UserMapper userMapper;
    private final ProductMapper productMapper;

    /**
     * 分页查询评论列表
     */
    @GetMapping
    public Result<PageResult<AdminCommentPageVO>> getCommentPage(CommentQueryDTO queryDTO) {
        Page<Comment> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        // 构建查询条件
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        if (queryDTO.getProductId() != null) {
            wrapper.eq(Comment::getProductId, queryDTO.getProductId());
        }
        if (queryDTO.getUserId() != null) {
            wrapper.eq(Comment::getUserId, queryDTO.getUserId());
        }
        if (queryDTO.getShowStatus() != null) {
            wrapper.eq(Comment::getShowStatus, queryDTO.getShowStatus());
        }
        if (queryDTO.getRating() != null) {
            wrapper.eq(Comment::getRating, queryDTO.getRating());
        }
        wrapper.orderByDesc(Comment::getCreateTime);

        IPage<Comment> commentPage = commentMapper.selectPage(page, wrapper);

        // 获取用户信息
        List<Long> userIds = commentPage.getRecords().stream()
                .map(Comment::getUserId)
                .distinct()
                .collect(Collectors.toList());

        // 获取商品信息
        List<Long> productIds = commentPage.getRecords().stream()
                .map(Comment::getProductId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, String> userNameMap = getUserIdToNicknameMap(userIds);
        Map<Long, String> productNameMap = getProductIdToNameMap(productIds);

        // 转换为 VO
        List<AdminCommentPageVO> vos = commentPage.getRecords().stream()
                .map(comment -> {
                    AdminCommentPageVO vo = new AdminCommentPageVO();
                    BeanUtils.copyProperties(comment, vo);
                    vo.setUsername(userNameMap.get(comment.getUserId()));
                    vo.setNickname(userNameMap.get(comment.getUserId()));
                    vo.setProductName(productNameMap.get(comment.getProductId()));
                    return vo;
                })
                .collect(Collectors.toList());

        PageResult<AdminCommentPageVO> pageResult = new PageResult<>(
                commentPage.getTotal(),
                vos,
                (int) commentPage.getCurrent(),
                (int) commentPage.getSize()
        );

        return Result.success(pageResult);
    }

    /**
     * 查询评论详情
     */
    @GetMapping("/{id}")
    public Result<AdminCommentVO> getCommentById(@PathVariable Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null || comment.getDeleted() == 1) {
            return Result.error("评论不存在");
        }

        // 获取用户信息
        var user = userMapper.selectById(comment.getUserId());

        // 获取商品信息
        var product = productMapper.selectById(comment.getProductId());

        AdminCommentVO vo = new AdminCommentVO();
        BeanUtils.copyProperties(comment, vo);
        if (user != null) {
            vo.setUsername(user.getUsername());
            vo.setNickname(user.getNickname());
            vo.setUserAvatar(user.getAvatar());
        }
        if (product != null) {
            vo.setProductName(product.getName());
            vo.setProductImage(product.getImage());
        }
        if (comment.getImages() != null && !comment.getImages().isEmpty()) {
            vo.setImages(Arrays.asList(comment.getImages().split(",")));
        }

        return Result.success(vo);
    }

    /**
     * 审核通过评论
     */
    @PutMapping("/{id}/approve")
    public Result<?> approveComment(@PathVariable Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            return Result.error("评论不存在");
        }

        Comment update = new Comment();
        update.setId(id);
        update.setShowStatus(1);
        commentMapper.updateById(update);

        return Result.success("审核通过");
    }

    /**
     * 审核拒绝评论
     */
    @PutMapping("/{id}/reject")
    public Result<?> rejectComment(@PathVariable Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            return Result.error("评论不存在");
        }

        Comment update = new Comment();
        update.setId(id);
        update.setShowStatus(0);
        commentMapper.updateById(update);

        return Result.success("审核拒绝");
    }

    /**
     * 商家回复评论
     */
    @PutMapping("/{id}/reply")
    public Result<?> replyComment(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String reply = request.get("reply");
        if (reply == null || reply.trim().isEmpty()) {
            return Result.error("回复内容不能为空");
        }

        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            return Result.error("评论不存在");
        }

        Comment update = new Comment();
        update.setId(id);
        update.setReply(reply);
        update.setReplyTime(LocalDateTime.now());
        commentMapper.updateById(update);

        return Result.success("回复成功");
    }

    /**
     * 删除评论
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteComment(@PathVariable Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            return Result.error("评论不存在");
        }

        commentMapper.deleteById(id);
        return Result.success("删除评论成功");
    }

    private Map<Long, String> getUserIdToNicknameMap(List<Long> userIds) {
        if (userIds.isEmpty()) return Map.of();
        return userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(
                        org.ruikun.entity.User::getId,
                        u -> u.getNickname() != null ? u.getNickname() : u.getUsername()
                ));
    }

    private Map<Long, String> getProductIdToNameMap(List<Long> productIds) {
        if (productIds.isEmpty()) return Map.of();
        return productMapper.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(
                        org.ruikun.entity.Product::getId,
                        org.ruikun.entity.Product::getName
                ));
    }
}
