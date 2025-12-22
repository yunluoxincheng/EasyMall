package org.ruikun.controller;

import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.dto.ProductDTO;
import org.ruikun.service.IProductService;
import org.ruikun.vo.ProductVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {

    private final IProductService productService;

    @GetMapping("/page")
    public Result<PageResult<ProductVO>> getProductPage(PageRequest pageRequest) {
        PageResult<ProductVO> pageResult = productService.getProductPage(pageRequest);
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    public Result<ProductVO> getProductById(@PathVariable Long id) {
        ProductVO product = productService.getProductById(id);
        return Result.success(product);
    }

    @GetMapping("/hot")
    public Result<List<ProductVO>> getHotProducts(@RequestParam(defaultValue = "10") Integer limit) {
        List<ProductVO> products = productService.getHotProducts(limit);
        return Result.success(products);
    }

    @GetMapping("/new")
    public Result<List<ProductVO>> getNewProducts(@RequestParam(defaultValue = "10") Integer limit) {
        List<ProductVO> products = productService.getNewProducts(limit);
        return Result.success(products);
    }

    @GetMapping("/related")
    public Result<List<ProductVO>> getRelatedProducts(@RequestParam Long categoryId,
                                                      @RequestParam Long productId,
                                                      @RequestParam(defaultValue = "5") Integer limit) {
        List<ProductVO> products = productService.getRelatedProducts(categoryId, productId, limit);
        return Result.success(products);
    }

    @PostMapping
    public Result<?> saveProduct(@RequestBody @Validated ProductDTO productDTO) {
        productService.saveProduct(productDTO);
        return Result.success("商品添加成功");
    }

    @PutMapping("/{id}")
    public Result<?> updateProduct(@PathVariable Long id,
                                   @RequestBody @Validated ProductDTO productDTO) {
        productService.updateProduct(id, productDTO);
        return Result.success("商品更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return Result.success("商品删除成功");
    }
}