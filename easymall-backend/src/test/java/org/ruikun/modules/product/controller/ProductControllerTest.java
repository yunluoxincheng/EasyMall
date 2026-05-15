package org.ruikun.modules.product.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.modules.product.service.IProductService;
import org.ruikun.modules.product.vo.ProductVO;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("ProductController 单元测试")
class ProductControllerTest {

    private MockMvc mockMvc;
    private IProductService productService;

    @BeforeEach
    void setUp() {
        productService = mock(IProductService.class);
        ProductController controller = new ProductController(productService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    private ProductVO createProductVO(Long id, String name, BigDecimal price) {
        ProductVO vo = new ProductVO();
        vo.setId(id);
        vo.setName(name);
        vo.setPrice(price);
        return vo;
    }

    @Nested
    @DisplayName("GET /api/product/page")
    class GetProductPage {

        @Test
        @DisplayName("9.3.1 传入分页参数返回 PageResult")
        void shouldReturnPageResult() throws Exception {
            ProductVO vo1 = createProductVO(1L, "商品A", new BigDecimal("50.00"));
            ProductVO vo2 = createProductVO(2L, "商品B", new BigDecimal("80.00"));
            PageResult<ProductVO> pageResult = new PageResult<>(2L, List.of(vo1, vo2), 1, 10);

            when(productService.getProductPage(any(PageRequest.class))).thenReturn(pageResult);

            mockMvc.perform(get("/api/product/page")
                            .param("pageNum", "1")
                            .param("pageSize", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.total").value(2))
                    .andExpect(jsonPath("$.data.records[0].id").value(1))
                    .andExpect(jsonPath("$.data.records[0].name").value("商品A"))
                    .andExpect(jsonPath("$.data.records[1].id").value(2));
        }
    }

    @Nested
    @DisplayName("GET /api/product/{id}")
    class GetProductById {

        @Test
        @DisplayName("9.3.2 传入有效商品ID返回 ProductVO")
        void shouldReturnProductVO() throws Exception {
            ProductVO vo = createProductVO(5L, "测试商品", new BigDecimal("99.00"));
            when(productService.getProductById(5L)).thenReturn(vo);

            mockMvc.perform(get("/api/product/5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(5))
                    .andExpect(jsonPath("$.data.name").value("测试商品"))
                    .andExpect(jsonPath("$.data.price").value(99.00));
        }
    }

    @Nested
    @DisplayName("GET /api/product/hot")
    class GetHotProducts {

        @Test
        @DisplayName("9.3.3 返回热门商品列表")
        void shouldReturnHotProductsList() throws Exception {
            ProductVO vo = createProductVO(1L, "热门商品", new BigDecimal("199.00"));
            when(productService.getHotProducts(10)).thenReturn(List.of(vo));

            mockMvc.perform(get("/api/product/hot").param("limit", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data[0].id").value(1))
                    .andExpect(jsonPath("$.data[0].name").value("热门商品"));
        }
    }

    @Nested
    @DisplayName("GET /api/product/new")
    class GetNewProducts {

        @Test
        @DisplayName("9.3.4 返回新品列表")
        void shouldReturnNewProductsList() throws Exception {
            ProductVO vo = createProductVO(3L, "新品", new BigDecimal("149.00"));
            when(productService.getNewProducts(10)).thenReturn(List.of(vo));

            mockMvc.perform(get("/api/product/new").param("limit", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data[0].id").value(3))
                    .andExpect(jsonPath("$.data[0].name").value("新品"));
        }
    }
}
