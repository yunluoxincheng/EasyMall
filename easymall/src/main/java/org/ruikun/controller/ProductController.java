package org.ruikun.controller;

import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.service.IProductService;
import org.ruikun.vo.ProductVO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品控制器（用户端）
 * 仅提供查询功能，增删改功能在后台管理接口中
 */
@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {

    private final IProductService productService;

    /**
     * 分页查询商品列表
     */
    @GetMapping("/page")
    public Result<PageResult<ProductVO>> getProductPage(PageRequest pageRequest) {
        PageResult<ProductVO> pageResult = productService.getProductPage(pageRequest);
        return Result.success(pageResult);
    }

    /**
     * 根据ID查询商品详情
     */
    @GetMapping("/{id}")
    public Result<ProductVO> getProductById(@PathVariable Long id) {
        ProductVO product = productService.getProductById(id);
        return Result.success(product);
    }

    /**
     * 查询热门商品
     */
    @GetMapping("/hot")
    public Result<List<ProductVO>> getHotProducts(@RequestParam(defaultValue = "10") Integer limit) {
        List<ProductVO> products = productService.getHotProducts(limit);
        return Result.success(products);
    }

    /**
     * 查询新品
     */
    @GetMapping("/new")
    public Result<List<ProductVO>> getNewProducts(@RequestParam(defaultValue = "10") Integer limit) {
        List<ProductVO> products = productService.getNewProducts(limit);
        return Result.success(products);
    }

    /**
     * 查询相关商品
     */
    @GetMapping("/related")
    public Result<List<ProductVO>> getRelatedProducts(@RequestParam Long categoryId,
                                                      @RequestParam Long productId,
                                                      @RequestParam(defaultValue = "5") Integer limit) {
        List<ProductVO> products = productService.getRelatedProducts(categoryId, productId, limit);
        return Result.success(products);
    }
}