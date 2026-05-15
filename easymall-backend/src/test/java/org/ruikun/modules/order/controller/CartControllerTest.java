package org.ruikun.modules.order.controller;

import com.alibaba.fastjson2.JSON;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.ruikun.infrastructure.security.JwtUtil;
import org.ruikun.modules.order.dto.CartAddDTO;
import org.ruikun.modules.order.service.ICartService;
import org.ruikun.modules.order.vo.CartVO;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("CartController 单元测试")
class CartControllerTest {

    private MockMvc mockMvc;
    private ICartService cartService;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        cartService = mock(ICartService.class);
        jwtUtil = mock(JwtUtil.class);
        CartController controller = new CartController(cartService, jwtUtil);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    private CartVO createCartVO(Long id, Long productId, String productName) {
        CartVO vo = new CartVO();
        vo.setId(id);
        vo.setProductId(productId);
        vo.setProductName(productName);
        vo.setProductPrice(new BigDecimal("99.00"));
        vo.setQuantity(1);
        vo.setTotalPrice(new BigDecimal("99.00"));
        vo.setSelected(true);
        vo.setStock(100);
        vo.setCreateTime(LocalDateTime.now());
        return vo;
    }

    @Nested
    @DisplayName("GET /api/cart/list")
    class GetCartList {

        @Test
        @DisplayName("9.4.1 返回用户购物车列表")
        void getCartList() throws Exception {
            CartVO vo = createCartVO(1L, 5L, "测试商品");
            when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(100L);
            when(cartService.getCartList(100L)).thenReturn(List.of(vo));

            mockMvc.perform(get("/api/cart/list")
                            .header("Authorization", "Bearer test-token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data[0].id").value(1))
                    .andExpect(jsonPath("$.data[0].productId").value(5))
                    .andExpect(jsonPath("$.data[0].productName").value("测试商品"));

            verify(cartService).getCartList(100L);
        }
    }

    @Nested
    @DisplayName("POST /api/cart/add")
    class AddToCart {

        @Test
        @DisplayName("9.4.2 成功添加商品到购物车")
        void addToCart() throws Exception {
            when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(100L);
            doNothing().when(cartService).addToCart(eq(100L), any(CartAddDTO.class));

            CartAddDTO dto = new CartAddDTO();
            dto.setProductId(5L);
            dto.setQuantity(1);

            mockMvc.perform(post("/api/cart/add")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(JSON.toJSONString(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(cartService).addToCart(eq(100L), any(CartAddDTO.class));
        }
    }

    @Nested
    @DisplayName("DELETE /api/cart/{cartId}")
    class DeleteCartItem {

        @Test
        @DisplayName("9.4.3 成功删除购物车商品")
        void deleteCartItem() throws Exception {
            when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(100L);
            doNothing().when(cartService).deleteCartItem(100L, 1L);

            mockMvc.perform(delete("/api/cart/{cartId}", 1L)
                            .header("Authorization", "Bearer test-token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(cartService).deleteCartItem(100L, 1L);
        }
    }
}
