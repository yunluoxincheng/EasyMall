package org.ruikun.service;

import org.ruikun.dto.CategoryDTO;
import org.ruikun.vo.CategoryVO;

import java.util.List;

public interface ICategoryService {
    List<CategoryVO> getCategoryTree();

    void saveCategory(CategoryDTO categoryDTO);

    void updateCategory(Long id, CategoryDTO categoryDTO);

    void deleteCategory(Long id);

    CategoryVO getCategoryById(Long id);

    List<CategoryVO> getLevelCategories(Integer level);
}