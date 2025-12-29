package org.ruikun.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.common.ResponseCode;
import org.ruikun.dto.admin.ProductQueryDTO;
import org.ruikun.dto.admin.ProductSaveDTO;
import org.ruikun.dto.ProductDTO;
import org.ruikun.entity.Category;
import org.ruikun.entity.Product;
import org.ruikun.mapper.CategoryMapper;
import org.ruikun.mapper.ProductMapper;
import org.ruikun.service.IProductService;
import org.ruikun.vo.admin.AdminProductPageVO;
import org.ruikun.vo.admin.AdminProductVO;
import org.ruikun.vo.ProductVO;
import org.springframework.beans.BeanUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 商品管理控制器（后台管理）
 */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final IProductService productService;
    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;

    /**
     * 分页查询商品列表
     */
    @GetMapping
    public Result<PageResult<AdminProductPageVO>> getProductPage(ProductQueryDTO queryDTO) {
        Page<Product> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        // 构建查询条件
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(queryDTO.getName())) {
            wrapper.like(Product::getName, queryDTO.getName());
        }
        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(Product::getCategoryId, queryDTO.getCategoryId());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Product::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(Product::getCreateTime);

        IPage<Product> productPage = productMapper.selectPage(page, wrapper);

        // 获取分类名称
        List<Long> categoryIds = productPage.getRecords().stream()
                .map(Product::getCategoryId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> categoryNameMap = categoryIds.isEmpty() ? Map.of() :
                categoryMapper.selectBatchIds(categoryIds).stream()
                        .collect(Collectors.toMap(Category::getId, Category::getName));

        // 转换为 VO
        List<AdminProductPageVO> vos = productPage.getRecords().stream()
                .map(product -> {
                    AdminProductPageVO vo = new AdminProductPageVO();
                    BeanUtils.copyProperties(product, vo);
                    vo.setCategoryName(categoryNameMap.get(product.getCategoryId()));
                    return vo;
                })
                .collect(Collectors.toList());

        PageResult<AdminProductPageVO> pageResult = new PageResult<>(
                productPage.getTotal(),
                vos,
                (int) productPage.getCurrent(),
                (int) productPage.getSize()
        );

        return Result.success(pageResult);
    }

    /**
     * 查询商品详情
     */
    @GetMapping("/{id}")
    public Result<AdminProductVO> getProductById(@PathVariable Long id) {
        Product product = productMapper.selectById(id);
        if (product == null || product.getDeleted() == 1) {
            return Result.error(ResponseCode.PRODUCT_NOT_FOUND);
        }

        // 获取分类名称
        Category category = categoryMapper.selectById(product.getCategoryId());

        AdminProductVO vo = new AdminProductVO();
        BeanUtils.copyProperties(product, vo);
        if (category != null) {
            vo.setCategoryName(category.getName());
        }
        if (StringUtils.hasText(product.getImages())) {
            vo.setImages(Arrays.asList(product.getImages().split(",")));
        }

        return Result.success(vo);
    }

    /**
     * 新增商品
     */
    @PostMapping
    public Result<?> saveProduct(@RequestBody @Validated ProductSaveDTO saveDTO) {
        ProductDTO productDTO = new ProductDTO();
        BeanUtils.copyProperties(saveDTO, productDTO);
        // 新增商品默认下架
        productDTO.setStatus(0);
        productService.saveProduct(productDTO);
        return Result.success("新增商品成功");
    }

    /**
     * 修改商品
     */
    @PutMapping("/{id}")
    public Result<?> updateProduct(@PathVariable Long id, @RequestBody @Validated ProductSaveDTO saveDTO) {
        ProductDTO productDTO = new ProductDTO();
        BeanUtils.copyProperties(saveDTO, productDTO);
        productService.updateProduct(id, productDTO);
        return Result.success("修改商品成功");
    }

    /**
     * 修改商品状态
     */
    @PutMapping("/{id}/status")
    public Result<?> updateProductStatus(@PathVariable Long id, @RequestParam Integer status) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            return Result.error(ResponseCode.PRODUCT_NOT_FOUND);
        }

        Product update = new Product();
        update.setId(id);
        update.setStatus(status);
        productMapper.updateById(update);

        return Result.success("修改商品状态成功");
    }

    /**
     * 修改商品库存
     */
    @PutMapping("/{id}/stock")
    public Result<?> updateProductStock(@PathVariable Long id, @RequestParam Integer stock) {
        if (stock < 0) {
            return Result.error(ResponseCode.STOCK_INVALID);
        }

        Product product = productMapper.selectById(id);
        if (product == null) {
            return Result.error(ResponseCode.PRODUCT_NOT_FOUND);
        }

        Product update = new Product();
        update.setId(id);
        update.setStock(stock);
        productMapper.updateById(update);

        return Result.success("修改商品库存成功");
    }

    /**
     * 删除商品
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return Result.success("删除商品成功");
    }
}
