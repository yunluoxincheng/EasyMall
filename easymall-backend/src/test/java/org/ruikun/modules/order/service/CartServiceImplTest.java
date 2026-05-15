package org.ruikun.modules.order.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
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
import org.ruikun.modules.order.dto.CartAddDTO;
import org.ruikun.modules.order.dto.CartUpdateDTO;
import org.ruikun.modules.order.entity.Cart;
import org.ruikun.modules.order.mapper.CartMapper;
import org.ruikun.modules.order.vo.CartVO;
import org.ruikun.modules.product.entity.Product;
import org.ruikun.modules.product.mapper.ProductMapper;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @BeforeAll
    static void initMybatisPlusLambdaCache() {
        Configuration configuration = new Configuration();
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(configuration, "");
        assistant.setCurrentNamespace("org.ruikun.modules.order.mapper.CartMapper");
        TableInfoHelper.initTableInfo(assistant, Cart.class);
    }

    @Mock
    private CartMapper cartMapper;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private CartServiceImpl cartService;

    @Captor
    private ArgumentCaptor<Cart> cartCaptor;

    @Nested
    @DisplayName("addToCart")
    class AddToCart {

        @Test
        @DisplayName("2.2 商品存在且有库存、购物车为空时成功添加")
        void addToCartSuccess() {
            CartAddDTO dto = new CartAddDTO();
            dto.setProductId(5L);
            dto.setQuantity(1);

            Product product = TestFixtures.createTestProduct();
            when(productMapper.selectById(5L)).thenReturn(product);
            when(cartMapper.getCartByUserIdAndProductId(100L, 5L)).thenReturn(null);

            cartService.addToCart(100L, dto);

            verify(cartMapper).insert(cartCaptor.capture());
            Cart inserted = cartCaptor.getValue();
            assertEquals(100L, inserted.getUserId());
            assertEquals(5L, inserted.getProductId());
            assertEquals("测试商品", inserted.getProductName());
            assertEquals(1, inserted.getQuantity());
            assertTrue(inserted.getSelected());
        }

        @Test
        @DisplayName("2.2 商品已在购物车中时增加数量")
        void addToCartExistingItem() {
            CartAddDTO dto = new CartAddDTO();
            dto.setProductId(5L);
            dto.setQuantity(2);

            Product product = TestFixtures.createTestProduct();
            when(productMapper.selectById(5L)).thenReturn(product);
            when(cartMapper.getCartByUserIdAndProductId(100L, 5L)).thenReturn(TestFixtures.createTestCart());

            cartService.addToCart(100L, dto);

            verify(cartMapper).updateCartByUserIdAndProductId(100L, 5L, 2);
            verify(cartMapper, never()).insert(any(Cart.class));
        }

        @Test
        @DisplayName("2.3 商品不存在时抛出 PRODUCT_SHELF_EMPTY")
        void addToCartProductNotFound() {
            CartAddDTO dto = new CartAddDTO();
            dto.setProductId(999L);
            dto.setQuantity(1);
            when(productMapper.selectById(999L)).thenReturn(null);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> cartService.addToCart(100L, dto));
            assertEquals(ResponseCode.PRODUCT_SHELF_EMPTY, ex.getResponseCode());
        }

        @Test
        @DisplayName("2.4 库存不足时抛出 PRODUCT_OUT_OF_STOCK")
        void addToCartInsufficientStock() {
            CartAddDTO dto = new CartAddDTO();
            dto.setProductId(5L);
            dto.setQuantity(10);
            Product product = TestFixtures.createTestProduct(1);
            when(productMapper.selectById(5L)).thenReturn(product);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> cartService.addToCart(100L, dto));
            assertEquals(ResponseCode.PRODUCT_OUT_OF_STOCK, ex.getResponseCode());
        }
    }

    @Nested
    @DisplayName("updateCartItem")
    class UpdateCartItem {

        @Test
        @DisplayName("2.5 更新数量成功")
        void updateQuantitySuccess() {
            CartUpdateDTO dto = new CartUpdateDTO();
            dto.setQuantity(3);
            Cart cart = TestFixtures.createTestCart();
            Product product = TestFixtures.createTestProduct();
            when(cartMapper.selectById(1L)).thenReturn(cart);
            when(productMapper.selectById(5L)).thenReturn(product);

            cartService.updateCartItem(100L, 1L, dto);

            verify(cartMapper).updateById(cartCaptor.capture());
            assertEquals(3, cartCaptor.getValue().getQuantity());
        }
    }

    @Nested
    @DisplayName("deleteCartItem")
    class DeleteCartItem {

        @Test
        @DisplayName("2.6 成功删除")
        void deleteSuccess() {
            when(cartMapper.selectById(1L)).thenReturn(TestFixtures.createTestCart());
            cartService.deleteCartItem(100L, 1L);
            verify(cartMapper).deleteById(1L);
        }
    }

    @Nested
    @DisplayName("batchDeleteCartItems")
    class BatchDeleteCartItems {

        @Test
        @DisplayName("2.7 批量删除")
        void batchDelete() {
            cartService.batchDeleteCartItems(100L, List.of(1L, 2L, 3L));
            verify(cartMapper).delete(any(LambdaQueryWrapper.class));
        }
    }

    @Nested
    @DisplayName("selectAll / batchSelect")
    class SelectOperations {

        @Test
        @DisplayName("2.8 selectAll 全选")
        void selectAll() {
            cartService.selectAll(100L, true);
            verify(cartMapper).batchUpdateSelected(100L, null, true);
        }

        @Test
        @DisplayName("2.8 batchSelect 批量选择")
        void batchSelect() {
            cartService.batchSelect(100L, List.of(1L, 2L), true);
            verify(cartMapper).batchUpdateSelected(100L, List.of(1L, 2L), true);
        }
    }

    @Nested
    @DisplayName("getCartList")
    class GetCartList {

        @Test
        @DisplayName("2.9 返回购物车列表")
        void returnsCartList() {
            when(cartMapper.getCartByUserId(100L)).thenReturn(List.of(TestFixtures.createTestCart()));
            List<CartVO> result = cartService.getCartList(100L);
            assertEquals(1, result.size());
        }
    }

    @Nested
    @DisplayName("getCartCount")
    class GetCartCount {

        @Test
        @DisplayName("2.10 返回购物车数量")
        void returnsCount() {
            when(cartMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(5L);
            assertEquals(5, cartService.getCartCount(100L));
        }
    }
}
