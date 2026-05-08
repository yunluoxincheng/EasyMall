package org.ruikun.controller.admin;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.dto.CouponTemplateDTO;
import org.ruikun.dto.CouponTemplateQueryDTO;
import org.ruikun.service.ICouponAdminService;
import org.ruikun.vo.CouponTemplateVO;
import org.ruikun.vo.CouponUsageLogVO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 优惠券管理控制器（管理端）
 */
@RestController
@RequestMapping("/api/admin/coupon")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CouponAdminController {

    private final ICouponAdminService couponAdminService;

    /**
     * 创建优惠券模板
     */
    @PostMapping("/template")
    public Result<Long> createTemplate(@RequestBody @Validated CouponTemplateDTO dto) {
        Long templateId = couponAdminService.createTemplate(dto);
        return Result.success("创建成功", templateId);
    }

    /**
     * 更新优惠券模板
     */
    @PutMapping("/template")
    public Result<String> updateTemplate(@RequestBody @Validated CouponTemplateDTO dto) {
        couponAdminService.updateTemplate(dto);
        return Result.success("更新成功");
    }

    /**
     * 上下架优惠券
     */
    @PutMapping("/template/{templateId}/status")
    public Result<String> updateTemplateStatus(
            @PathVariable Long templateId,
            @RequestParam Integer status) {
        couponAdminService.updateTemplateStatus(templateId, status);
        return Result.success("操作成功");
    }

    /**
     * 删除优惠券模板
     */
    @DeleteMapping("/template/{templateId}")
    public Result<String> deleteTemplate(@PathVariable Long templateId) {
        couponAdminService.deleteTemplate(templateId);
        return Result.success("删除成功");
    }

    /**
     * 查询优惠券模板详情
     */
    @GetMapping("/template/{templateId}")
    public Result<CouponTemplateVO> getTemplateDetail(@PathVariable Long templateId) {
        CouponTemplateVO template = couponAdminService.getTemplateDetail(templateId);
        return Result.success(template);
    }

    /**
     * 分页查询优惠券模板列表
     */
    @GetMapping("/templates")
    public Result<Page<CouponTemplateVO>> getTemplatePage(CouponTemplateQueryDTO dto) {
        Page<CouponTemplateVO> page = couponAdminService.getTemplatePage(dto);
        return Result.success(page);
    }

    /**
     * 查询优惠券使用记录
     */
    @GetMapping("/usage-logs")
    public Result<Page<CouponUsageLogVO>> getUsageLogs(
            @RequestParam(required = false) Long templateId,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<CouponUsageLogVO> page = couponAdminService.getUsageLogs(templateId, userId, pageNum, pageSize);
        return Result.success(page);
    }

    /**
     * 获取优惠券统计数据
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics(
            @RequestParam(required = false) Long templateId) {
        Map<String, Object> stats = couponAdminService.getStatistics(templateId);
        return Result.success(stats);
    }
}
