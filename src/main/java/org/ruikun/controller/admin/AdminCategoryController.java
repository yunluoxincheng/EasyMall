package org.ruikun.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.dto.admin.CategoryQueryDTO;
import org.ruikun.dto.admin.CategorySaveDTO;
import org.ruikun.dto.CategoryDTO;
import org.ruikun.entity.Category;
import org.ruikun.mapper.CategoryMapper;
import org.ruikun.service.ICategoryService;
import org.ruikun.vo.admin.AdminCategoryPageVO;
import org.ruikun.vo.admin.AdminCategoryVO;
import org.springframework.beans.BeanUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 分类管理控制器（后台管理）
 */
@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

    private final ICategoryService categoryService;
    private final CategoryMapper categoryMapper;

    /**
     * 分页查询分类列表
     */
    @GetMapping
    public Result<PageResult<AdminCategoryPageVO>> getCategoryPage(CategoryQueryDTO queryDTO) {
        Page<Category> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        // 构建查询条件
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(queryDTO.getName())) {
            wrapper.like(Category::getName, queryDTO.getName());
        }
        if (queryDTO.getParentId() != null) {
            wrapper.eq(Category::getParentId, queryDTO.getParentId());
        }
        if (queryDTO.getLevel() != null) {
            wrapper.eq(Category::getLevel, queryDTO.getLevel());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Category::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByAsc(Category::getSort).orderByDesc(Category::getCreateTime);

        IPage<Category> categoryPage = categoryMapper.selectPage(page, wrapper);

        // 获取父分类名称
        List<Long> parentIds = categoryPage.getRecords().stream()
                .map(Category::getParentId)
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> parentNameMap = parentIds.isEmpty() ? Map.of() :
                categoryMapper.selectBatchIds(parentIds).stream()
                        .collect(Collectors.toMap(Category::getId, Category::getName));

        // 转换为 VO
        List<AdminCategoryPageVO> vos = categoryPage.getRecords().stream()
                .map(category -> {
                    AdminCategoryPageVO vo = new AdminCategoryPageVO();
                    BeanUtils.copyProperties(category, vo);
                    if (category.getParentId() != null && category.getParentId() > 0) {
                        vo.setParentName(parentNameMap.get(category.getParentId()));
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        PageResult<AdminCategoryPageVO> pageResult = new PageResult<>(
                categoryPage.getTotal(),
                vos,
                (int) categoryPage.getCurrent(),
                (int) categoryPage.getSize()
        );

        return Result.success(pageResult);
    }

    /**
     * 查询分类详情
     */
    @GetMapping("/{id}")
    public Result<AdminCategoryVO> getCategoryById(@PathVariable Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null || category.getDeleted() == 1) {
            return Result.error("分类不存在");
        }

        // 获取父分类名称
        String parentName = null;
        if (category.getParentId() != null && category.getParentId() > 0) {
            Category parent = categoryMapper.selectById(category.getParentId());
            if (parent != null) {
                parentName = parent.getName();
            }
        }

        AdminCategoryVO vo = new AdminCategoryVO();
        BeanUtils.copyProperties(category, vo);
        vo.setParentName(parentName);

        return Result.success(vo);
    }

    /**
     * 新增分类
     */
    @PostMapping
    public Result<?> saveCategory(@RequestBody @Validated CategorySaveDTO saveDTO) {
        CategoryDTO categoryDTO = new CategoryDTO();
        BeanUtils.copyProperties(saveDTO, categoryDTO);
        categoryService.saveCategory(categoryDTO);
        return Result.success("新增分类成功");
    }

    /**
     * 修改分类
     */
    @PutMapping("/{id}")
    public Result<?> updateCategory(@PathVariable Long id, @RequestBody @Validated CategorySaveDTO saveDTO) {
        CategoryDTO categoryDTO = new CategoryDTO();
        BeanUtils.copyProperties(saveDTO, categoryDTO);
        categoryService.updateCategory(id, categoryDTO);
        return Result.success("修改分类成功");
    }

    /**
     * 修改分类状态
     */
    @PutMapping("/{id}/status")
    public Result<?> updateCategoryStatus(@PathVariable Long id, @RequestParam Integer status) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            return Result.error("分类不存在");
        }

        Category update = new Category();
        update.setId(id);
        update.setStatus(status);
        categoryMapper.updateById(update);

        return Result.success("修改分类状态成功");
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteCategory(@PathVariable Long id) {
        // 检查是否有子分类
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getParentId, id);
        Long count = categoryMapper.selectCount(wrapper);
        if (count > 0) {
            return Result.error("该分类下存在子分类，无法删除");
        }

        categoryService.deleteCategory(id);
        return Result.success("删除分类成功");
    }
}
