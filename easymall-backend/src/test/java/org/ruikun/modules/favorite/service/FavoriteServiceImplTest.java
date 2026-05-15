package org.ruikun.modules.favorite.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.TestFixtures;
import org.ruikun.common.ResponseCode;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.favorite.entity.Favorite;
import org.ruikun.modules.favorite.mapper.FavoriteMapper;
import org.ruikun.modules.favorite.vo.FavoriteVO;
import org.ruikun.modules.product.entity.Product;
import org.ruikun.modules.product.mapper.ProductMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceImplTest {

    @BeforeAll
    static void initMybatisPlus() {
        Configuration config = new Configuration();
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(config, "");
        assistant.setCurrentNamespace("org.ruikun.modules.favorite.mapper.FavoriteMapper");
        TableInfoHelper.initTableInfo(assistant, Favorite.class);
    }

    @Mock
    private FavoriteMapper favoriteMapper;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private FavoriteServiceImpl favoriteService;

    @Captor
    private ArgumentCaptor<Favorite> favoriteCaptor;

    @Nested
    @DisplayName("addFavorite")
    class AddFavorite {

        @Test
        @DisplayName("商品存在且未收藏时，成功添加收藏")
        void shouldAddWhenProductExistsAndNotFavorited() {
            Long userId = 100L;
            Long productId = 5L;
            Product product = TestFixtures.createTestProduct();

            when(productMapper.selectById(productId)).thenReturn(product);
            when(favoriteMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
            when(favoriteMapper.insert(any(Favorite.class))).thenReturn(1);

            favoriteService.addFavorite(userId, productId);

            verify(favoriteMapper).insert(favoriteCaptor.capture());
            Favorite inserted = favoriteCaptor.getValue();
            assertEquals(userId, inserted.getUserId());
            assertEquals(productId, inserted.getProductId());
            assertEquals(product.getName(), inserted.getProductName());
            assertEquals(product.getImage(), inserted.getProductImage());
        }

        @Test
        @DisplayName("商品不存在时抛出 PRODUCT_NOT_FOUND 异常")
        void shouldThrowWhenProductNotFound() {
            when(productMapper.selectById(999L)).thenReturn(null);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> favoriteService.addFavorite(100L, 999L));

            assertEquals(ResponseCode.PRODUCT_NOT_FOUND, exception.getResponseCode());
            verify(favoriteMapper, never()).insert(any(Favorite.class));
        }

        @Test
        @DisplayName("已收藏该商品时抛出 PRODUCT_ALREADY_FAVORITED 异常")
        void shouldThrowWhenAlreadyFavorited() {
            Product product = TestFixtures.createTestProduct();
            when(productMapper.selectById(5L)).thenReturn(product);
            when(favoriteMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

            BusinessException exception = assertThrows(BusinessException.class,
                    () -> favoriteService.addFavorite(100L, 5L));

            assertEquals(ResponseCode.PRODUCT_ALREADY_FAVORITED, exception.getResponseCode());
            verify(favoriteMapper, never()).insert(any(Favorite.class));
        }
    }

    @Nested
    @DisplayName("removeFavorite")
    class RemoveFavorite {

        @Test
        @DisplayName("根据用户ID和商品ID删除收藏记录")
        void shouldDeleteByUserIdAndProductId() {
            when(favoriteMapper.delete(any(LambdaQueryWrapper.class))).thenReturn(1);
            favoriteService.removeFavorite(100L, 5L);
            verify(favoriteMapper).delete(any(LambdaQueryWrapper.class));
        }
    }

    @Nested
    @DisplayName("isFavorited")
    class IsFavorited {

        @Test
        @DisplayName("count > 0 时返回 true")
        void shouldReturnTrueWhenCountGreaterThanZero() {
            when(favoriteMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);
            assertTrue(favoriteService.isFavorited(100L, 5L));
        }

        @Test
        @DisplayName("count == 0 时返回 false")
        void shouldReturnFalseWhenCountIsZero() {
            when(favoriteMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
            assertFalse(favoriteService.isFavorited(100L, 5L));
        }
    }

    @Nested
    @DisplayName("getFavoritePage")
    class GetFavoritePage {

        @Test
        @DisplayName("返回分页的收藏VO列表")
        void shouldReturnPagedFavoriteVOs() {
            Favorite favorite = TestFixtures.createTestFavorite();
            Product product = TestFixtures.createTestProduct();

            Page<Favorite> favoritePage = new Page<>(1, 10);
            favoritePage.setRecords(List.of(favorite));
            favoritePage.setTotal(1);

            when(favoriteMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class)))
                    .thenReturn(favoritePage);
            when(productMapper.selectById(product.getId())).thenReturn(product);

            Page<FavoriteVO> result = favoriteService.getFavoritePage(100L, 1, 10);

            assertNotNull(result);
            assertEquals(1, result.getTotal());
            assertEquals(1, result.getRecords().size());
            assertTrue(result.getRecords().get(0).getIsFavorite());
        }
    }

    @Nested
    @DisplayName("toggleFavorite")
    class ToggleFavorite {

        @Test
        @DisplayName("已收藏时取消收藏，返回 false")
        void shouldRemoveAndReturnFalseWhenFavorited() {
            when(favoriteMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);
            when(favoriteMapper.delete(any(LambdaQueryWrapper.class))).thenReturn(1);

            boolean result = favoriteService.toggleFavorite(100L, 5L);

            assertFalse(result);
            verify(favoriteMapper).delete(any(LambdaQueryWrapper.class));
            verify(favoriteMapper, never()).insert(any(Favorite.class));
        }

        @Test
        @DisplayName("未收藏时添加收藏，返回 true")
        void shouldAddAndReturnTrueWhenNotFavorited() {
            Product product = TestFixtures.createTestProduct();
            when(favoriteMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
            when(productMapper.selectById(5L)).thenReturn(product);
            when(favoriteMapper.insert(any(Favorite.class))).thenReturn(1);

            boolean result = favoriteService.toggleFavorite(100L, 5L);

            assertTrue(result);
            verify(favoriteMapper).insert(any(Favorite.class));
        }
    }
}
