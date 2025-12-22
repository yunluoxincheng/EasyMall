package org.ruikun.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.service.IFavoriteService;
import org.ruikun.vo.FavoriteVO;
import org.springframework.web.bind.annotation.*;

/**
 * 商品收藏控制器
 */
@RestController
@RequestMapping("/api/favorite")
@RequiredArgsConstructor
public class FavoriteController {

    private final IFavoriteService favoriteService;

    /**
     * 添加收藏
     */
    @PostMapping("/add/{productId}")
    public Result<?> addFavorite(@PathVariable Long productId,
                                 HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        favoriteService.addFavorite(userId, productId);
        return Result.success("收藏成功");
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/remove/{productId}")
    public Result<?> removeFavorite(@PathVariable Long productId,
                                    HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        favoriteService.removeFavorite(userId, productId);
        return Result.success("取消收藏成功");
    }

    /**
     * 切换收藏状态
     */
    @PostMapping("/toggle/{productId}")
    public Result<Boolean> toggleFavorite(@PathVariable Long productId,
                                         HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        boolean isFavorited = favoriteService.toggleFavorite(userId, productId);
        return Result.success(isFavorited);
    }

    /**
     * 检查是否已收藏
     */
    @GetMapping("/check/{productId}")
    public Result<Boolean> isFavorited(@PathVariable Long productId,
                                      HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.success(false);
        }
        boolean isFavorited = favoriteService.isFavorited(userId, productId);
        return Result.success(isFavorited);
    }

    /**
     * 分页查询用户收藏列表
     */
    @GetMapping("/page")
    public Result<Page<FavoriteVO>> getFavoritePage(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        Page<FavoriteVO> favorites = favoriteService.getFavoritePage(userId, pageNum, pageSize);
        return Result.success(favorites);
    }
}
