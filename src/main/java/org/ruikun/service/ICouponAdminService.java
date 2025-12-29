package org.ruikun.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.ruikun.dto.CouponTemplateDTO;
import org.ruikun.dto.CouponTemplateQueryDTO;
import org.ruikun.entity.CouponTemplate;
import org.ruikun.vo.CouponTemplateVO;
import org.ruikun.vo.CouponUsageLogVO;

import java.util.Map;

/**
 * 优惠券管理服务接口
 */
public interface ICouponAdminService {

    /**
     * 创建优惠券模板
     *
     * @param dto 优惠券模板信息
     * @return 模板ID
     */
    Long createTemplate(CouponTemplateDTO dto);

    /**
     * 更新优惠券模板
     *
     * @param dto 优惠券模板信息
     */
    void updateTemplate(CouponTemplateDTO dto);

    /**
     * 上下架优惠券
     *
     * @param templateId 模板ID
     * @param status     状态（0-下架，1-上架）
     */
    void updateTemplateStatus(Long templateId, Integer status);

    /**
     * 删除优惠券模板
     *
     * @param templateId 模板ID
     */
    void deleteTemplate(Long templateId);

    /**
     * 查询优惠券模板详情
     *
     * @param templateId 模板ID
     * @return 优惠券模板
     */
    CouponTemplateVO getTemplateDetail(Long templateId);

    /**
     * 分页查询优惠券模板列表
     *
     * @param dto 查询条件
     * @return 分页结果
     */
    Page<CouponTemplateVO> getTemplatePage(CouponTemplateQueryDTO dto);

    /**
     * 查询优惠券使用记录
     *
     * @param templateId 模板ID（可选）
     * @param userId     用户ID（可选）
     * @param pageNum    页码
     * @param pageSize   页大小
     * @return 分页结果
     */
    Page<CouponUsageLogVO> getUsageLogs(Long templateId, Long userId, Integer pageNum, Integer pageSize);

    /**
     * 获取优惠券统计数据
     *
     * @param templateId 模板ID（可选，为null时返回所有统计数据）
     * @return 统计数据
     */
    Map<String, Object> getStatistics(Long templateId);
}
