package org.ruikun.modules.product.service;

import org.ruikun.modules.product.dto.CategoryDTO;
import org.ruikun.modules.product.vo.CategoryVO;

import java.util.List;

public interface ICategoryService {
    List<CategoryVO> getCategoryTree();

    void saveCategory(CategoryDTO categoryDTO);

    void updateCategory(Long id, CategoryDTO categoryDTO);

    void deleteCategory(Long id);

    CategoryVO getCategoryById(Long id);

    List<CategoryVO> getLevelCategories(Integer level);
}