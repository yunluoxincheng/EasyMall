package org.ruikun.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.dto.CommentCreateDTO;
import org.ruikun.service.ICommentService;
import org.ruikun.vo.CommentVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 商品评论控制器
 */
@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
public class CommentController {

    private final ICommentService commentService;

    /**
     * 创建商品评论
     */
    @PostMapping("/create")
    public Result<Long> createComment(@RequestBody @Validated CommentCreateDTO commentDTO,
                                      HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        Long commentId = commentService.createComment(userId, commentDTO);
        return Result.success(commentId);
    }

    /**
     * 分页查询商品评论
     */
    @GetMapping("/product/{productId}")
    public Result<Page<CommentVO>> getCommentsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<CommentVO> comments = commentService.getCommentsByProductId(productId, pageNum, pageSize);
        return Result.success(comments);
    }

    /**
     * 分页查询用户评论
     */
    @GetMapping("/user")
    public Result<Page<CommentVO>> getCommentsByUserId(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        Page<CommentVO> comments = commentService.getCommentsByUserId(userId, pageNum, pageSize);
        return Result.success(comments);
    }

    /**
     * 删除评论
     */
    @DeleteMapping("/{commentId}")
    public Result<?> deleteComment(@PathVariable Long commentId,
                                   HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        commentService.deleteComment(userId, commentId);
        return Result.success("删除成功");
    }

    /**
     * 获取商品评论数量
     */
    @GetMapping("/count/{productId}")
    public Result<Long> getCommentCount(@PathVariable Long productId) {
        Long count = commentService.getCommentCount(productId);
        return Result.success(count);
    }

    /**
     * 获取商品平均评分
     */
    @GetMapping("/rating/{productId}")
    public Result<Double> getAverageRating(@PathVariable Long productId) {
        Double rating = commentService.getAverageRating(productId);
        return Result.success(rating);
    }
}
