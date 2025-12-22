package org.ruikun.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.dto.PointsExchangeDTO;
import org.ruikun.service.IPointsExchangeService;
import org.ruikun.vo.PointsExchangeVO;
import org.ruikun.vo.PointsProductVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 积分兑换控制器
 */
@RestController
@RequestMapping("/api/points/exchange")
@RequiredArgsConstructor
public class PointsExchangeController {

    private final IPointsExchangeService pointsExchangeService;

    /**
     * 获取可兑换的商品列表
     */
    @GetMapping("/products")
    public Result<List<PointsProductVO>> getAvailableProducts(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        List<PointsProductVO> products = pointsExchangeService.getAvailableProducts(userId);
        return Result.success(products);
    }

    /**
     * 兑换商品
     */
    @PostMapping("/exchange")
    public Result<String> exchangeProduct(@RequestBody @Validated PointsExchangeDTO exchangeDTO,
                                          HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        String exchangeNo = pointsExchangeService.exchangeProduct(userId, exchangeDTO);
        return Result.success(exchangeNo);
    }

    /**
     * 分页查询兑换记录
     */
    @GetMapping("/records")
    public Result<Page<PointsExchangeVO>> getExchangeRecords(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        Page<PointsExchangeVO> records = pointsExchangeService.getExchangeRecords(userId, pageNum, pageSize);
        return Result.success(records);
    }

    /**
     * 获取兑换详情
     */
    @GetMapping("/detail/{exchangeId}")
    public Result<PointsExchangeVO> getExchangeDetail(@PathVariable Long exchangeId,
                                                      HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        PointsExchangeVO detail = pointsExchangeService.getExchangeDetail(userId, exchangeId);
        return Result.success(detail);
    }
}
