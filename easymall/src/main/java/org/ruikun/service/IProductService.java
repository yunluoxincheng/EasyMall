package org.ruikun.service;

import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.dto.ProductDTO;
import org.ruikun.vo.ProductVO;

import java.util.List;

public interface IProductService {
    PageResult<ProductVO> getProductPage(PageRequest pageRequest);

    ProductVO getProductById(Long id);

    void saveProduct(ProductDTO productDTO);

    void updateProduct(Long id, ProductDTO productDTO);

    void deleteProduct(Long id);

    List<ProductVO> getHotProducts(Integer limit);

    List<ProductVO> getNewProducts(Integer limit);

    List<ProductVO> getRelatedProducts(Long categoryId, Long productId, Integer limit);

    void updateSales(Long productId, Integer quantity);

    boolean checkStock(Long productId, Integer quantity);
}