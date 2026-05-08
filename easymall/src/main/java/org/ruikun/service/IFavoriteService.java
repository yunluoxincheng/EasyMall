package org.ruikun.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.ruikun.vo.FavoriteVO;

/**
 * 商品收藏服务接口
 */
public interface IFavoriteService {

    /**
     * 添加收藏
     *
     * @param userId 用户ID
     * @param productId 商品ID
     */
    void addFavorite(Long userId, Long productId);

    /**
     * 取消收藏
     *
     * @param userId 用户ID
     * @param productId 商品ID
     */
    void removeFavorite(Long userId, Long productId);

    /**
     * 检查是否已收藏
     *
     * @param userId 用户ID
     * @param productId 商品ID
     * @return true-已收藏 false-未收藏
     */
    boolean isFavorited(Long userId, Long productId);

    /**
     * 分页查询用户收藏列表
     *
     * @param userId 用户ID
     * @param pageNum 页码
     * @param pageSize 页大小
     * @return 收藏分页数据
     */
    Page<FavoriteVO> getFavoritePage(Long userId, Integer pageNum, Integer pageSize);

    /**
     * 切换收藏状态（已收藏则取消，未收藏则添加）
     *
     * @param userId 用户ID
     * @param productId 商品ID
     * @return true-已收藏 false-未收藏
     */
    boolean toggleFavorite(Long userId, Long productId);
}
