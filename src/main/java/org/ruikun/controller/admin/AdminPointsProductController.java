package org.ruikun.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.dto.admin.PointsProductQueryDTO;
import org.ruikun.dto.admin.PointsProductSaveDTO;
import org.ruikun.entity.PointsProduct;
import org.ruikun.mapper.PointsProductMapper;
import org.ruikun.vo.admin.AdminPointsProductPageVO;
import org.ruikun.vo.admin.AdminPointsProductVO;
import org.springframework.beans.BeanUtils;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 积分兑换商品管理控制器（后台管理）
 */
@RestController
@RequestMapping("/api/admin/points-products")
@RequiredArgsConstructor
public class AdminPointsProductController {

    private final PointsProductMapper pointsProductMapper;

    /**
     * 分页查询积分兑换商品列表
     */
    @GetMapping
    public Result<PageResult<AdminPointsProductPageVO>> getPointsProductPage(PointsProductQueryDTO queryDTO) {
        Page<PointsProduct> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        // 构建查询条件
        LambdaQueryWrapper<PointsProduct> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(queryDTO.getName())) {
            wrapper.like(PointsProduct::getName, queryDTO.getName());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(PointsProduct::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByAsc(PointsProduct::getSortOrder)
                .orderByDesc(PointsProduct::getCreateTime);

        IPage<PointsProduct> productPage = pointsProductMapper.selectPage(page, wrapper);

        // 转换为 VO
        List<AdminPointsProductPageVO> vos = productPage.getRecords().stream()
                .map(product -> {
                    AdminPointsProductPageVO vo = new AdminPointsProductPageVO();
                    BeanUtils.copyProperties(product, vo);
                    return vo;
                })
                .collect(Collectors.toList());

        PageResult<AdminPointsProductPageVO> pageResult = new PageResult<>(
                productPage.getTotal(),
                vos,
                (int) productPage.getCurrent(),
                (int) productPage.getSize()
        );

        return Result.success(pageResult);
    }

    /**
     * 查询积分兑换商品详情
     */
    @GetMapping("/{id}")
    public Result<AdminPointsProductVO> getPointsProductById(@PathVariable Long id) {
        PointsProduct product = pointsProductMapper.selectById(id);
        if (product == null || product.getDeleted() == 1) {
            return Result.error("积分兑换商品不存在");
        }

        AdminPointsProductVO vo = new AdminPointsProductVO();
        BeanUtils.copyProperties(product, vo);

        return Result.success(vo);
    }

    /**
     * 新增积分兑换商品
     */
    @PostMapping
    public Result<?> savePointsProduct(@RequestBody @Validated PointsProductSaveDTO saveDTO) {
        PointsProduct product = new PointsProduct();
        BeanUtils.copyProperties(saveDTO, product);
        product.setStatus(0); // 默认下架
        product.setExchangeCount(0);

        if (pointsProductMapper.insert(product) <= 0) {
            return Result.error("新增积分兑换商品失败");
        }

        return Result.success("新增积分兑换商品成功");
    }

    /**
     * 修改积分兑换商品
     */
    @PutMapping("/{id}")
    public Result<?> updatePointsProduct(@PathVariable Long id, @RequestBody @Validated PointsProductSaveDTO saveDTO) {
        PointsProduct existProduct = pointsProductMapper.selectById(id);
        if (existProduct == null) {
            return Result.error("积分兑换商品不存在");
        }

        PointsProduct product = new PointsProduct();
        product.setId(id);
        BeanUtils.copyProperties(saveDTO, product);

        if (pointsProductMapper.updateById(product) <= 0) {
            return Result.error("修改积分兑换商品失败");
        }

        return Result.success("修改积分兑换商品成功");
    }

    /**
     * 修改商品状态
     */
    @PutMapping("/{id}/status")
    public Result<?> updatePointsProductStatus(@PathVariable Long id, @RequestParam Integer status) {
        PointsProduct product = pointsProductMapper.selectById(id);
        if (product == null) {
            return Result.error("积分兑换商品不存在");
        }

        PointsProduct update = new PointsProduct();
        update.setId(id);
        update.setStatus(status);
        pointsProductMapper.updateById(update);

        return Result.success("修改商品状态成功");
    }

    /**
     * 修改商品库存
     */
    @PutMapping("/{id}/stock")
    public Result<?> updatePointsProductStock(@PathVariable Long id, @RequestParam Integer stock) {
        if (stock < 0) {
            return Result.error("库存不能为负数");
        }

        PointsProduct product = pointsProductMapper.selectById(id);
        if (product == null) {
            return Result.error("积分兑换商品不存在");
        }

        PointsProduct update = new PointsProduct();
        update.setId(id);
        update.setStock(stock);
        pointsProductMapper.updateById(update);

        return Result.success("修改商品库存成功");
    }

    /**
     * 删除积分兑换商品
     */
    @DeleteMapping("/{id}")
    public Result<?> deletePointsProduct(@PathVariable Long id) {
        PointsProduct product = pointsProductMapper.selectById(id);
        if (product == null) {
            return Result.error("积分兑换商品不存在");
        }

        pointsProductMapper.deleteById(id);
        return Result.success("删除积分兑换商品成功");
    }
}
