package org.ruikun.modules.product.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.modules.product.entity.Category;
import org.ruikun.modules.product.mapper.CategoryMapper;
import org.ruikun.modules.product.vo.CategoryVO;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @BeforeAll
    static void initMybatisPlus() {
        Configuration config = new Configuration();
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(config, "");
        assistant.setCurrentNamespace("org.ruikun.modules.product.mapper.CategoryMapper");
        TableInfoHelper.initTableInfo(assistant, Category.class);
    }

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category createCategory(Long id, String name, Long parentId, Integer level, Integer sort, Integer status) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setParentId(parentId);
        category.setLevel(level);
        category.setSort(sort);
        category.setStatus(status);
        category.setCreateTime(LocalDateTime.of(2026, 1, 1, 12, 0));
        category.setUpdateTime(LocalDateTime.of(2026, 1, 1, 12, 0));
        category.setDeleted(0);
        return category;
    }

    @Nested
    @DisplayName("getCategoryTree")
    class GetCategoryTree {

        @Test
        @DisplayName("返回正确的树形层级结构，子分类嵌套在父分类的 children 列表中")
        void returnsHierarchicalTreeStructure() {
            Category parent = createCategory(1L, "电子产品", 0L, 1, 1, 1);
            Category child1 = createCategory(2L, "手机", 1L, 2, 1, 1);
            Category child2 = createCategory(3L, "电脑", 1L, 2, 2, 1);
            Category grandchild = createCategory(4L, "智能手机", 2L, 3, 1, 1);

            List<Category> allCategories = List.of(parent, child1, child2, grandchild);
            when(categoryMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(allCategories);

            List<CategoryVO> tree = categoryService.getCategoryTree();

            verify(categoryMapper).selectList(any(LambdaQueryWrapper.class));
            assertNotNull(tree);
            assertEquals(1, tree.size());

            CategoryVO root = tree.get(0);
            assertEquals(1L, root.getId());
            assertEquals("电子产品", root.getName());
            assertEquals(0L, root.getParentId());
            assertEquals(1, root.getLevel());

            List<CategoryVO> rootChildren = root.getChildren();
            assertNotNull(rootChildren);
            assertEquals(2, rootChildren.size());

            CategoryVO phone = rootChildren.get(0);
            assertEquals(2L, phone.getId());
            assertEquals("手机", phone.getName());

            List<CategoryVO> phoneChildren = phone.getChildren();
            assertNotNull(phoneChildren);
            assertEquals(1, phoneChildren.size());
            assertEquals(4L, phoneChildren.get(0).getId());
            assertEquals("智能手机", phoneChildren.get(0).getName());

            CategoryVO computer = rootChildren.get(1);
            assertEquals(3L, computer.getId());
            assertEquals("电脑", computer.getName());
            assertEquals(0, computer.getChildren().size());
        }

        @Test
        @DisplayName("无分类数据时返回空列表")
        void returnsEmptyListWhenNoCategories() {
            when(categoryMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of());

            List<CategoryVO> tree = categoryService.getCategoryTree();

            assertNotNull(tree);
            assertEquals(0, tree.size());
        }

        @Test
        @DisplayName("多个顶层根节点并列")
        void returnsMultipleRootNodes() {
            Category root1 = createCategory(1L, "电子产品", 0L, 1, 1, 1);
            Category root2 = createCategory(2L, "服装", 0L, 1, 2, 1);
            Category root3 = createCategory(3L, "食品", 0L, 1, 3, 1);
            Category child1 = createCategory(4L, "手机", 1L, 2, 1, 1);

            List<Category> allCategories = List.of(root1, root2, root3, child1);
            when(categoryMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(allCategories);

            List<CategoryVO> tree = categoryService.getCategoryTree();

            assertEquals(3, tree.size());
            assertEquals("电子产品", tree.get(0).getName());
            assertEquals("服装", tree.get(1).getName());
            assertEquals("食品", tree.get(2).getName());
            assertEquals(1, tree.get(0).getChildren().size());
            assertEquals(0, tree.get(2).getChildren().size());
        }
    }
}
