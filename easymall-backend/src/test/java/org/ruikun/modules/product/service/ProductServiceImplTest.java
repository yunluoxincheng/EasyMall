package org.ruikun.modules.product.service;

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
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.common.ResponseCode;
import org.ruikun.exception.BusinessException;
import org.ruikun.infrastructure.mq.DomainEvent;
import org.ruikun.infrastructure.mq.DomainEventPublisher;
import org.ruikun.infrastructure.mq.MqConstants;
import org.ruikun.infrastructure.mq.event.ProductChangedPayload;
import org.ruikun.modules.inventory.service.IInventoryService;
import org.ruikun.modules.product.dto.ProductDTO;
import org.ruikun.modules.product.entity.Product;
import org.ruikun.modules.product.mapper.CategoryMapper;
import org.ruikun.modules.product.mapper.ProductMapper;
import org.ruikun.modules.product.vo.ProductVO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @BeforeAll
    static void initMybatisPlusLambdaCache() {
        Configuration configuration = new Configuration();
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(configuration, "");
        assistant.setCurrentNamespace("org.ruikun.modules.product.mapper.ProductMapper");
        TableInfoHelper.initTableInfo(assistant, Product.class);
    }

    @Mock
    private ProductMapper productMapper;

    @Mock
    private CategoryMapper categoryMapper;

    @Mock
    private IInventoryService inventoryService;

    @Mock
    private DomainEventPublisher eventPublisher;

    @InjectMocks
    private ProductServiceImpl productService;

    @Captor
    private ArgumentCaptor<Product> productCaptor;

    private Product createProduct() {
        Product product = new Product();
        product.setId(1L);
        product.setName("测试商品");
        product.setSubtitle("测试副标题");
        product.setPrice(new BigDecimal("99.00"));
        product.setOriginalPrice(new BigDecimal("199.00"));
        product.setStock(100);
        product.setSales(50);
        product.setImage("cover.jpg");
        product.setImages("img1.jpg,img2.jpg,img3.jpg");
        product.setCategoryId(10L);
        product.setStatus(1);
        product.setDeleted(0);
        product.setCreateTime(LocalDateTime.of(2026, 5, 1, 10, 0));
        return product;
    }

    private ProductDTO createProductDTO() {
        ProductDTO dto = new ProductDTO();
        dto.setName("新品商品");
        dto.setPrice(new BigDecimal("149.00"));
        dto.setStock(200);
        dto.setCategoryId(20L);
        dto.setStatus(1);
        return dto;
    }

    @Nested
    @DisplayName("getProductById")
    class GetProductById {

        @Test
        @DisplayName("7.2 根据有效ID返回 ProductVO")
        void returnsProductVOForExistingProduct() {
            Product product = createProduct();
            when(productMapper.selectById(1L)).thenReturn(product);

            ProductVO result = productService.getProductById(1L);

            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals("测试商品", result.getName());
            assertEquals(0, new BigDecimal("99.00").compareTo(result.getPrice()));
            assertNotNull(result.getImages());
            assertEquals(3, result.getImages().size());
            verify(productMapper).selectById(1L);
        }

        @Test
        @DisplayName("7.3 商品不存在时抛出 PRODUCT_NOT_FOUND")
        void throwsProductNotFoundWhenNull() {
            when(productMapper.selectById(999L)).thenReturn(null);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> productService.getProductById(999L));

            assertEquals(ResponseCode.PRODUCT_NOT_FOUND, ex.getResponseCode());
        }

        @Test
        @DisplayName("商品已逻辑删除时抛出 PRODUCT_NOT_FOUND")
        void throwsProductNotFoundWhenDeleted() {
            Product product = createProduct();
            product.setDeleted(1);
            when(productMapper.selectById(1L)).thenReturn(product);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> productService.getProductById(1L));

            assertEquals(ResponseCode.PRODUCT_NOT_FOUND, ex.getResponseCode());
        }
    }

    @Nested
    @DisplayName("getProductPage")
    class GetProductPage {

        @Test
        @DisplayName("7.4 分页查询返回 PageResult")
        void returnsPageResult() {
            PageRequest pageRequest = new PageRequest();
            pageRequest.setPageNum(1);
            pageRequest.setPageSize(10);

            Product product = createProduct();
            Page<Product> mockPage = new Page<>(1, 10);
            mockPage.setRecords(List.of(product));
            mockPage.setTotal(1);

            when(productMapper.selectProductPage(any(Page.class), isNull(), isNull(), eq(1)))
                    .thenReturn(mockPage);

            PageResult<ProductVO> result = productService.getProductPage(pageRequest);

            assertNotNull(result);
            assertEquals(1L, result.getTotal());
            assertEquals(1, result.getRecords().size());
        }
    }

    @Nested
    @DisplayName("saveProduct")
    class SaveProduct {

        @Test
        @DisplayName("7.5 新增商品成功，初始化库存，发布事件")
        void insertsProductAndInitializesInventory() {
            ProductDTO dto = createProductDTO();
            when(productMapper.insert(any(Product.class))).thenAnswer(invocation -> {
                Product p = invocation.getArgument(0);
                p.setId(100L);
                return 1;
            });
            doNothing().when(inventoryService).initializeInventory(anyLong(), anyInt());
            doNothing().when(eventPublisher).publishAfterCommit(anyString(), anyString(), any());

            productService.saveProduct(dto);

            verify(productMapper).insert(productCaptor.capture());
            assertEquals("新品商品", productCaptor.getValue().getName());
            verify(inventoryService).initializeInventory(100L, 200);
            verify(eventPublisher).publishAfterCommit(
                    eq(MqConstants.PRODUCT_EXCHANGE),
                    eq(MqConstants.PRODUCT_CHANGED_ROUTING_KEY),
                    any());
        }
    }

    @Nested
    @DisplayName("updateProduct")
    class UpdateProduct {

        @Test
        @DisplayName("7.6 更新已有商品成功")
        void updatesExistingProduct() {
            Product existing = createProduct();
            when(productMapper.selectById(1L)).thenReturn(existing);
            when(productMapper.updateById(any(Product.class))).thenReturn(1);
            doNothing().when(eventPublisher).publishAfterCommit(anyString(), anyString(), any());

            ProductDTO dto = createProductDTO();
            productService.updateProduct(1L, dto);

            verify(productMapper).updateById(productCaptor.capture());
            assertEquals(1L, productCaptor.getValue().getId());
            assertEquals("新品商品", productCaptor.getValue().getName());
            verify(eventPublisher).publishAfterCommit(
                    eq(MqConstants.PRODUCT_EXCHANGE),
                    eq(MqConstants.PRODUCT_CHANGED_ROUTING_KEY),
                    any());
        }
    }

    @Nested
    @DisplayName("deleteProduct")
    class DeleteProduct {

        @Test
        @DisplayName("7.7 删除已有商品成功")
        void deletesExistingProduct() {
            when(productMapper.selectById(1L)).thenReturn(createProduct());
            when(productMapper.deleteById(1L)).thenReturn(1);
            doNothing().when(eventPublisher).publishAfterCommit(anyString(), anyString(), any());

            productService.deleteProduct(1L);

            verify(productMapper).deleteById(1L);
            verify(eventPublisher).publishAfterCommit(
                    eq(MqConstants.PRODUCT_EXCHANGE),
                    eq(MqConstants.PRODUCT_CHANGED_ROUTING_KEY),
                    any());
        }
    }
}
