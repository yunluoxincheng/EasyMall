package org.ruikun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.common.ResponseCode;
import org.ruikun.dto.ProductDTO;
import org.ruikun.entity.Product;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.CategoryMapper;
import org.ruikun.mapper.ProductMapper;
import org.ruikun.service.IProductService;
import org.ruikun.vo.ProductVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {

    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;

    @Override
    public PageResult<ProductVO> getProductPage(PageRequest pageRequest) {
        Page<Product> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());
        IPage<Product> productPage = productMapper.selectProductPage(page,
                pageRequest.getCategoryId(),
                pageRequest.getKeyword(),
                1);

        List<ProductVO> productVOs = productPage.getRecords().stream()
                .map(product -> convertToVO(product))
                .collect(Collectors.toList());

        return new PageResult<>(productPage.getTotal(), productVOs,
                (int) productPage.getCurrent(), (int) productPage.getSize());
    }

    @Override
    public ProductVO getProductById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null || product.getDeleted() == 1) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品不存在");
        }
        return convertToVO(product);
    }

    @Override
    public void saveProduct(ProductDTO productDTO) {
        Product product = new Product();
        BeanUtils.copyProperties(productDTO, product);
        product.setSales(0);

        if (productMapper.insert(product) <= 0) {
            throw new BusinessException(ResponseCode.PRODUCT_CREATE_FAILED, "商品添加失败");
        }
    }

    @Override
    public void updateProduct(Long id, ProductDTO productDTO) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品不存在");
        }

        BeanUtils.copyProperties(productDTO, product, "id", "sales");
        if (productMapper.updateById(product) <= 0) {
            throw new BusinessException(ResponseCode.PRODUCT_UPDATE_FAILED, "商品更新失败");
        }
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品不存在");
        }

        productMapper.deleteById(id);
    }

    @Override
    public List<ProductVO> getHotProducts(Integer limit) {
        List<Product> products = productMapper.selectHotProducts(limit);
        return products.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductVO> getNewProducts(Integer limit) {
        List<Product> products = productMapper.selectNewProducts(limit);
        return products.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
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
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品不存在");
        }

        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Product::getId, productId)
               .ge(Product::getStock, quantity);

        Product updateProduct = new Product();
        updateProduct.setSales(product.getSales() + quantity);
        updateProduct.setStock(product.getStock() - quantity);

        if (productMapper.update(updateProduct, wrapper) <= 0) {
            throw new BusinessException(ResponseCode.PRODUCT_OUT_OF_STOCK, "库存不足");
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