package org.ruikun.controller;

import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.service.ICategoryService;
import org.ruikun.vo.CategoryVO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 分类控制器（用户端）
 * 仅提供查询功能，增删改功能在后台管理接口中
 */
@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final ICategoryService categoryService;

    /**
     * 获取分类树
     */
    @GetMapping("/tree")
    public Result<List<CategoryVO>> getCategoryTree() {
        List<CategoryVO> categoryTree = categoryService.getCategoryTree();
        return Result.success(categoryTree);
    }

    /**
     * 根据ID查询分类详情
     */
    @GetMapping("/{id}")
    public Result<CategoryVO> getCategoryById(@PathVariable Long id) {
        CategoryVO category = categoryService.getCategoryById(id);
        return Result.success(category);
    }

    /**
     * 按级别获取分类
     */
    @GetMapping("/level/{level}")
    public Result<List<CategoryVO>> getLevelCategories(@PathVariable Integer level) {
        List<CategoryVO> categories = categoryService.getLevelCategories(level);
        return Result.success(categories);
    }
}
