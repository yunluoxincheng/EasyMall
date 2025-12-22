package org.ruikun.controller;

import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.dto.CategoryDTO;
import org.ruikun.service.ICategoryService;
import org.ruikun.vo.CategoryVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final ICategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<CategoryVO>> getCategoryTree() {
        List<CategoryVO> categoryTree = categoryService.getCategoryTree();
        return Result.success(categoryTree);
    }

    @GetMapping("/{id}")
    public Result<CategoryVO> getCategoryById(@PathVariable Long id) {
        CategoryVO category = categoryService.getCategoryById(id);
        return Result.success(category);
    }

    @GetMapping("/level/{level}")
    public Result<List<CategoryVO>> getLevelCategories(@PathVariable Integer level) {
        List<CategoryVO> categories = categoryService.getLevelCategories(level);
        return Result.success(categories);
    }

    @PostMapping
    public Result<?> saveCategory(@RequestBody @Validated CategoryDTO categoryDTO) {
        categoryService.saveCategory(categoryDTO);
        return Result.success("分类添加成功");
    }

    @PutMapping("/{id}")
    public Result<?> updateCategory(@PathVariable Long id,
                                    @RequestBody @Validated CategoryDTO categoryDTO) {
        categoryService.updateCategory(id, categoryDTO);
        return Result.success("分类更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<?> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success("分类删除成功");
    }
}