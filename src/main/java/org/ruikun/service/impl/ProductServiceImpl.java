package org.ruikun.service.impl;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.dto.ProductDTO;
import org.ruikun.entity.Product;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.CategoryMapper;
import org.ruikun.mapper.ProductMapper;
import org.ruikun.service.IProductService;
import org.ruikun.vo.ProductVO;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {

    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 缓存相关常量
     */
    private static final String PRODUCT_SEARCH_CACHE_PREFIX = "product:search:";
    private static final String PRODUCT_DETAIL_CACHE_PREFIX = "product:detail:";
    private static final String PRODUCT_HOT_CACHE_KEY = "product:hot";
    private static final String PRODUCT_NEW_CACHE_KEY = "product:new";
    private static final long CACHE_EXPIRE_MINUTES = 5;

    /**
     * 是否使用全文索引搜索（默认开启，可通过配置关闭）
     */
    private static final boolean USE_FULLTEXT_SEARCH = true;

    @Override
    public PageResult<ProductVO> getProductPage(PageRequest pageRequest) {
        // 生成缓存 key
        String cacheKey = buildSearchCacheKey(pageRequest);

        // 尝试从缓存获取
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return JSON.parseObject(JSON.toJSONString(cached), PageResult.class);
        }

        // 缓存未命中，查询数据库
        Page<Product> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        IPage<Product> productPage;

        // 根据配置选择搜索方式
        if (USE_FULLTEXT_SEARCH && StringUtils.hasText(pageRequest.getKeyword())) {
            // 使用全文索引搜索（性能更好，按相关性排序）
            productPage = productMapper.selectProductPageWithFullText(page,
                    pageRequest.getCategoryId(),
                    pageRequest.getKeyword(),
                    1);
        } else {
            // 使用 LIKE 模糊搜索（兼容性更好）
            productPage = productMapper.selectProductPage(page,
                    pageRequest.getCategoryId(),
                    pageRequest.getKeyword(),
                    1);
        }

        List<ProductVO> productVOs = productPage.getRecords().stream()
                .map(product -> convertToVO(product))
                .collect(Collectors.toList());

        PageResult<ProductVO> result = new PageResult<>(productPage.getTotal(), productVOs,
                (int) productPage.getCurrent(), (int) productPage.getSize());

        // 存入缓存，5分钟过期
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_EXPIRE_MINUTES, TimeUnit.MINUTES);

        return result;
    }

    /**
     * 构建搜索缓存 key
     */
    private String buildSearchCacheKey(PageRequest pageRequest) {
        StringBuilder keyBuilder = new StringBuilder(PRODUCT_SEARCH_CACHE_PREFIX);
        keyBuilder.append("page:").append(pageRequest.getPageNum())
                  .append(":size:").append(pageRequest.getPageSize());

        if (pageRequest.getCategoryId() != null) {
            keyBuilder.append(":category:").append(pageRequest.getCategoryId());
        }

        if (StringUtils.hasText(pageRequest.getKeyword())) {
            keyBuilder.append(":keyword:").append(pageRequest.getKeyword());
        }

        return keyBuilder.toString();
    }

    @Override
    public ProductVO getProductById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null || product.getDeleted() == 1) {
            throw new BusinessException("商品不存在");
        }
        return convertToVO(product);
    }

    @Override
    public void saveProduct(ProductDTO productDTO) {
        Product product = new Product();
        BeanUtils.copyProperties(productDTO, product);
        product.setSales(0);

        if (productMapper.insert(product) <= 0) {
            throw new BusinessException("商品添加失败");
        }

        // 清除相关缓存
        clearProductCache();
    }

    @Override
    public void updateProduct(Long id, ProductDTO productDTO) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException("商品不存在");
        }

        BeanUtils.copyProperties(productDTO, product, "id", "sales");
        if (productMapper.updateById(product) <= 0) {
            throw new BusinessException("商品更新失败");
        }

        // 清除相关缓存
        clearProductCache();
        // 清除商品详情缓存
        redisTemplate.delete(PRODUCT_DETAIL_CACHE_PREFIX + id);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException("商品不存在");
        }

        productMapper.deleteById(id);

        // 清除相关缓存
        clearProductCache();
        // 清除商品详情缓存
        redisTemplate.delete(PRODUCT_DETAIL_CACHE_PREFIX + id);
    }

    /**
     * 清除所有商品相关缓存
     */
    private void clearProductCache() {
        // 清除搜索缓存
        redisTemplate.delete(redisTemplate.keys(PRODUCT_SEARCH_CACHE_PREFIX + "*"));
        // 清除热门商品缓存（所有 limit）
        redisTemplate.delete(redisTemplate.keys(PRODUCT_HOT_CACHE_KEY + "*"));
        // 清除新品缓存（所有 limit）
        redisTemplate.delete(redisTemplate.keys(PRODUCT_NEW_CACHE_KEY + "*"));
    }

    @Override
    public List<ProductVO> getHotProducts(Integer limit) {
        // 尝试从缓存获取
        Object cached = redisTemplate.opsForValue().get(PRODUCT_HOT_CACHE_KEY + ":" + limit);
        if (cached != null) {
            return JSON.parseArray(JSON.toJSONString(cached), ProductVO.class);
        }

        // 缓存未命中，查询数据库
        List<Product> products = productMapper.selectHotProducts(limit);
        List<ProductVO> result = products.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        // 存入缓存，5分钟过期
        redisTemplate.opsForValue().set(PRODUCT_HOT_CACHE_KEY + ":" + limit, result, CACHE_EXPIRE_MINUTES, TimeUnit.MINUTES);

        return result;
    }

    @Override
    public List<ProductVO> getNewProducts(Integer limit) {
        // 尝试从缓存获取
        Object cached = redisTemplate.opsForValue().get(PRODUCT_NEW_CACHE_KEY + ":" + limit);
        if (cached != null) {
            return JSON.parseArray(JSON.toJSONString(cached), ProductVO.class);
        }

        // 缓存未命中，查询数据库
        List<Product> products = productMapper.selectNewProducts(limit);
        List<ProductVO> result = products.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        // 存入缓存，5分钟过期
        redisTemplate.opsForValue().set(PRODUCT_NEW_CACHE_KEY + ":" + limit, result, CACHE_EXPIRE_MINUTES, TimeUnit.MINUTES);

        return result;
    }

    @Override
    public List<ProductVO> getRelatedProducts(Long categoryId, Long productId, Integer limit) {
        List<Product> products = productMapper.selectRelatedProducts(categoryId, productId, limit);
        return products.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public void updateSales(Long productId, Integer quantity) {
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new BusinessException("商品不存在");
        }

        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Product::getId, productId)
               .ge(Product::getStock, quantity);

        Product updateProduct = new Product();
        updateProduct.setSales(product.getSales() + quantity);
        updateProduct.setStock(product.getStock() - quantity);

        if (productMapper.update(updateProduct, wrapper) <= 0) {
            throw new BusinessException("库存不足");
        }
    }

    @Override
    public boolean checkStock(Long productId, Integer quantity) {
        Product product = productMapper.selectById(productId);
        return product != null && product.getStock() >= quantity;
    }

    private ProductVO convertToVO(Product product) {
        ProductVO productVO = new ProductVO();
        BeanUtils.copyProperties(product, productVO);

        if (StringUtils.hasText(product.getImages())) {
            productVO.setImages(Arrays.asList(product.getImages().split(",")));
        }

        return productVO;
    }
}