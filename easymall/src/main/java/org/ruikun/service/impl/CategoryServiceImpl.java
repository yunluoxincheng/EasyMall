package org.ruikun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.dto.CategoryDTO;
import org.ruikun.entity.Category;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.CategoryMapper;
import org.ruikun.service.ICategoryService;
import org.ruikun.vo.CategoryVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements ICategoryService {

    private final CategoryMapper categoryMapper;

    @Override
    public List<CategoryVO> getCategoryTree() {
        List<Category> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>()
                        .eq(Category::getStatus, 1)
                        .orderByAsc(Category::getSort, Category::getId)
        );

        return buildCategoryTree(allCategories, 0L);
    }

    private List<CategoryVO> buildCategoryTree(List<Category> categories, Long parentId) {
        List<CategoryVO> result = new ArrayList<>();

        for (Category category : categories) {
            if (category.getParentId() != null && category.getParentId().equals(parentId)) {
                CategoryVO categoryVO = new CategoryVO();
                BeanUtils.copyProperties(category, categoryVO);

                List<CategoryVO> children = buildCategoryTree(categories, category.getId());
                categoryVO.setChildren(children);

                result.add(categoryVO);
            }
        }

        return result;
    }

    @Override
    public void saveCategory(CategoryDTO categoryDTO) {
        if (categoryDTO.getParentId() != null && categoryDTO.getParentId() > 0) {
            Category parent = categoryMapper.selectById(categoryDTO.getParentId());
            if (parent == null) {
                throw new BusinessException(ResponseCode.CATEGORY_PARENT_NOT_FOUND, "父分类不存在");
            }
            categoryDTO.setLevel(parent.getLevel() + 1);
        } else {
            categoryDTO.setParentId(0L);
            categoryDTO.setLevel(1);
        }

        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getName, categoryDTO.getName())
               .eq(Category::getParentId, categoryDTO.getParentId());
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ResponseCode.CATEGORY_NAME_EXISTS, "同级分类名称已存在");
        }

        Category category = new Category();
        BeanUtils.copyProperties(categoryDTO, category);
        categoryMapper.insert(category);
    }

    @Override
    public void updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResponseCode.CATEGORY_NOT_FOUND, "分类不存在");
        }

        if (categoryDTO.getParentId() != null && categoryDTO.getParentId() > 0) {
            if (categoryDTO.getParentId().equals(id)) {
                throw new BusinessException(ResponseCode.CATEGORY_INVALID_PARENT, "父分类不能是自己");
            }

            Category parent = categoryMapper.selectById(categoryDTO.getParentId());
            if (parent == null) {
                throw new BusinessException(ResponseCode.CATEGORY_PARENT_NOT_FOUND, "父分类不存在");
            }

            if (isChildCategory(id, categoryDTO.getParentId())) {
                throw new BusinessException(ResponseCode.CATEGORY_PARENT_IS_CHILD, "父分类不能是自己的子分类");
            }

            categoryDTO.setLevel(parent.getLevel() + 1);
        } else {
            categoryDTO.setParentId(0L);
            categoryDTO.setLevel(1);
        }

        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getName, categoryDTO.getName())
               .eq(Category::getParentId, categoryDTO.getParentId())
               .ne(Category::getId, id);
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ResponseCode.CATEGORY_NAME_EXISTS, "同级分类名称已存在");
        }

        BeanUtils.copyProperties(categoryDTO, category, "id");
        categoryMapper.updateById(category);
    }

    private boolean isChildCategory(Long parentId, Long childId) {
        List<Category> children = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>()
                        .eq(Category::getParentId, parentId)
        );

        for (Category child : children) {
            if (child.getId().equals(childId)) {
                return true;
            }
            if (isChildCategory(child.getId(), childId)) {
                return true;
            }
        }

        return false;
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResponseCode.CATEGORY_NOT_FOUND, "分类不存在");
        }

        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getParentId, id);
        Long childCount = categoryMapper.selectCount(wrapper);
        if (childCount > 0) {
            throw new BusinessException(ResponseCode.CATEGORY_HAS_CHILDREN, "存在子分类，无法删除");
        }

        categoryMapper.deleteById(id);
    }

    @Override
    public CategoryVO getCategoryById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResponseCode.CATEGORY_NOT_FOUND, "分类不存在");
        }

        CategoryVO categoryVO = new CategoryVO();
        BeanUtils.copyProperties(category, categoryVO);
        return categoryVO;
    }

    @Override
    public List<CategoryVO> getLevelCategories(Integer level) {
        List<Category> categories = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>()
                        .eq(Category::getLevel, level)
                        .eq(Category::getStatus, 1)
                        .orderByAsc(Category::getSort, Category::getId)
        );

        return categories.stream()
                .map(category -> {
                    CategoryVO categoryVO = new CategoryVO();
                    BeanUtils.copyProperties(category, categoryVO);
                    return categoryVO;
                })
                .collect(Collectors.toList());
    }
}