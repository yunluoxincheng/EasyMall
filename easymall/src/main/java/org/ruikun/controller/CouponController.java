package org.ruikun.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.common.ResponseCode;
import org.ruikun.dto.CouponCalculateDTO;
import org.ruikun.service.ICouponService;
import org.ruikun.vo.CouponCalculateResultVO;
import org.ruikun.vo.CouponTemplateVO;
import org.ruikun.vo.UserCouponVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * 优惠券控制器（用户端）
 */
@RestController
@RequestMapping("/api/coupon")
@RequiredArgsConstructor
public class CouponController {

    private final ICouponService couponService;

    /**
     * 获取可领取的优惠券列表
     */
    @GetMapping("/templates")
    public Result<List<CouponTemplateVO>> getAvailableTemplates(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(ResponseCode.UNAUTHORIZED);
        }
        List<CouponTemplateVO> templates = couponService.getAvailableTemplates(userId);
        return Result.success(templates);
    }

    /**
     * 领取优惠券
     */
    @PostMapping("/receive/{templateId}")
    public Result<Long> receiveCoupon(@PathVariable Long templateId,
                                       HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(ResponseCode.UNAUTHORIZED);
        }
        Long userCouponId = couponService.receiveCoupon(userId, templateId);
        return Result.success("领取成功", userCouponId);
    }

    /**
     * 查看我的优惠券列表
     */
    @GetMapping("/my")
    public Result<Page<UserCouponVO>> getUserCoupons(
            HttpServletRequest request,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(ResponseCode.UNAUTHORIZED);
        }
        Page<UserCouponVO> coupons = couponService.getUserCoupons(userId, status, pageNum, pageSize);
        return Result.success(coupons);
    }

    /**
     * 获取可用优惠券（下单时）
     */
    @GetMapping("/available")
    public Result<List<UserCouponVO>> getAvailableCoupons(
            @RequestParam BigDecimal orderAmount,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(ResponseCode.UNAUTHORIZED);
        }
        List<UserCouponVO> coupons = couponService.getAvailableCoupons(userId, orderAmount);
        return Result.success(coupons);
    }

    /**
     * 计算优惠金额
     */
    @PostMapping("/calculate")
    public Result<CouponCalculateResultVO> calculateDiscount(
            @RequestBody @Validated CouponCalculateDTO dto,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(ResponseCode.UNAUTHORIZED);
        }
        CouponCalculateResultVO result = couponService.calculateDiscount(userId, dto);
        return Result.success(result);
    }
}
