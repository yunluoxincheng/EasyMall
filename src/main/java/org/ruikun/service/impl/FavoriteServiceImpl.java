package org.ruikun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.entity.Favorite;
import org.ruikun.entity.Product;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.FavoriteMapper;
import org.ruikun.mapper.ProductMapper;
import org.ruikun.service.IFavoriteService;
import org.ruikun.vo.FavoriteVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 商品收藏服务实现类
 */
@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements IFavoriteService {

    private final FavoriteMapper favoriteMapper;
    private final ProductMapper productMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addFavorite(Long userId, Long productId) {
        // 检查商品是否存在
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new BusinessException("商品不存在");
        }

        // 检查是否已收藏
        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Favorite::getUserId, userId)
               .eq(Favorite::getProductId, productId);
        if (favoriteMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("已收藏该商品");
        }

        // 添加收藏
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setProductId(productId);
        favorite.setProductName(product.getName());
        favorite.setProductImage(product.getImage());
        favorite.setProductPrice(product.getPrice().toString());
        favoriteMapper.insert(favorite);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeFavorite(Long userId, Long productId) {
        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Favorite::getUserId, userId)
               .eq(Favorite::getProductId, productId);
        favoriteMapper.delete(wrapper);
    }

    @Override
    public boolean isFavorited(Long userId, Long productId) {
        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Favorite::getUserId, userId)
               .eq(Favorite::getProductId, productId);
        return favoriteMapper.selectCount(wrapper) > 0;
    }

    @Override
    public Page<FavoriteVO> getFavoritePage(Long userId, Integer pageNum, Integer pageSize) {
        Page<Favorite> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Favorite::getUserId, userId)
               .orderByDesc(Favorite::getCreateTime);

        Page<Favorite> favoritePage = favoriteMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<FavoriteVO> voPage = new Page<>();
        BeanUtils.copyProperties(favoritePage, voPage, "records");

        List<FavoriteVO> voList = favoritePage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean toggleFavorite(Long userId, Long productId) {
        if (isFavorited(userId, productId)) {
            removeFavorite(userId, productId);
            return false;
        } else {
            addFavorite(userId, productId);
            return true;
        }
    }

    /**
     * 转换为VO
     */
    private FavoriteVO convertToVO(Favorite favorite) {
        FavoriteVO vo = new FavoriteVO();
        BeanUtils.copyProperties(favorite, vo);

        // 获取商品最新信息
        Product product = productMapper.selectById(favorite.getProductId());
        if (product != null) {
            vo.setProductName(product.getName());
            vo.setProductImage(product.getImage());
            vo.setProductPrice(product.getPrice());
            vo.setProductStock(product.getStock());
        }

        vo.setIsFavorite(true);

        return vo;
    }
}
