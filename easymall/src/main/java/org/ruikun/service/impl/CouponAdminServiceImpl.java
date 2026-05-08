package org.ruikun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.dto.CouponTemplateDTO;
import org.ruikun.dto.CouponTemplateQueryDTO;
import org.ruikun.entity.CouponTemplate;
import org.ruikun.entity.CouponUsageLog;
import org.ruikun.entity.UserCoupon;
import org.ruikun.enums.CouponType;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.CouponTemplateMapper;
import org.ruikun.mapper.CouponUsageLogMapper;
import org.ruikun.mapper.UserCouponMapper;
import org.ruikun.service.ICouponAdminService;
import org.ruikun.vo.CouponTemplateVO;
import org.ruikun.vo.CouponUsageLogVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 优惠券管理服务实现类
 */
@Service
@RequiredArgsConstructor
public class CouponAdminServiceImpl implements ICouponAdminService {

    private final CouponTemplateMapper couponTemplateMapper;
    private final UserCouponMapper userCouponMapper;
    private final CouponUsageLogMapper couponUsageLogMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createTemplate(CouponTemplateDTO dto) {
        // 检查名称重复
        Long count = couponTemplateMapper.selectCount(new LambdaQueryWrapper<CouponTemplate>()
                .eq(CouponTemplate::getName, dto.getName()));
        if (count > 0) {
            throw new BusinessException(ResponseCode.VALIDATION_ERROR, "优惠券名称已存在");
        }

        CouponTemplate template = new CouponTemplate();
        BeanUtils.copyProperties(dto, template);

        // 设置默认值
        if (template.getReceivedCount() == null) {
            template.setReceivedCount(0);
        }
        if (template.getUsedCount() == null) {
            template.setUsedCount(0);
        }
        if (template.getMemberLevel() == null) {
            template.setMemberLevel(0);
        }
        if (template.getSortOrder() == null) {
            template.setSortOrder(0);
        }
        if (template.getStatus() == null) {
            template.setStatus(1);
        }

        couponTemplateMapper.insert(template);
        return template.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTemplate(CouponTemplateDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException(ResponseCode.VALIDATION_ERROR, "优惠券ID不能为空");
        }

        CouponTemplate template = couponTemplateMapper.selectById(dto.getId());
        if (template == null) {
            throw new BusinessException(ResponseCode.COUPON_TEMPLATE_NOT_FOUND);
        }

        // 检查是否已被领取
        if (template.getReceivedCount() > 0) {
            // 已被领取的模板只能修改部分字段
            template.setName(dto.getName());
            template.setDescription(dto.getDescription());
            template.setSortOrder(dto.getSortOrder());
            template.setStatus(dto.getStatus());
        } else {
            // 未被领取的模板可以修改所有字段
            BeanUtils.copyProperties(dto, template);
        }

        couponTemplateMapper.updateById(template);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTemplateStatus(Long templateId, Integer status) {
        CouponTemplate template = couponTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException(ResponseCode.COUPON_TEMPLATE_NOT_FOUND);
        }
        template.setStatus(status);
        couponTemplateMapper.updateById(template);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTemplate(Long templateId) {
        CouponTemplate template = couponTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException(ResponseCode.COUPON_TEMPLATE_NOT_FOUND);
        }

        // 检查是否已被领取
        if (template.getReceivedCount() > 0) {
            throw new BusinessException(ResponseCode.COUPON_TEMPLATE_HAS_RECEIVED);
        }

        couponTemplateMapper.deleteById(templateId);
    }

    @Override
    public CouponTemplateVO getTemplateDetail(Long templateId) {
        CouponTemplate template = couponTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException(ResponseCode.COUPON_TEMPLATE_NOT_FOUND);
        }
        return convertToVO(template);
    }

    @Override
    public Page<CouponTemplateVO> getTemplatePage(CouponTemplateQueryDTO dto) {
        Page<CouponTemplate> page = new Page<>(dto.getPageNum(), dto.getPageSize());
        LambdaQueryWrapper<CouponTemplate> wrapper = new LambdaQueryWrapper<>();

        if (dto.getName() != null && !dto.getName().isEmpty()) {
            wrapper.like(CouponTemplate::getName, dto.getName());
        }
        if (dto.getType() != null) {
            wrapper.eq(CouponTemplate::getType, dto.getType());
        }
        if (dto.getStatus() != null) {
            wrapper.eq(CouponTemplate::getStatus, dto.getStatus());
        }

        wrapper.orderByDesc(CouponTemplate::getCreateTime);

        Page<CouponTemplate> templatePage = couponTemplateMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<CouponTemplateVO> voPage = new Page<>();
        BeanUtils.copyProperties(templatePage, voPage, "records");

        List<CouponTemplateVO> voList = templatePage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public Page<CouponUsageLogVO> getUsageLogs(Long templateId, Long userId, Integer pageNum, Integer pageSize) {
        Page<CouponUsageLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CouponUsageLog> wrapper = new LambdaQueryWrapper<>();

        if (templateId != null) {
            wrapper.eq(CouponUsageLog::getTemplateId, templateId);
        }
        if (userId != null) {
            wrapper.eq(CouponUsageLog::getUserId, userId);
        }

        wrapper.orderByDesc(CouponUsageLog::getCreateTime);

        Page<CouponUsageLog> logPage = couponUsageLogMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<CouponUsageLogVO> voPage = new Page<>();
        BeanUtils.copyProperties(logPage, voPage, "records");

        List<CouponUsageLogVO> voList = logPage.getRecords().stream()
                .map(this::convertToLogVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public Map<String, Object> getStatistics(Long templateId) {
        Map<String, Object> stats = new HashMap<>();

        if (templateId != null) {
            // 单个优惠券统计
            CouponTemplate template = couponTemplateMapper.selectById(templateId);
            if (template == null) {
                throw new BusinessException(ResponseCode.COUPON_TEMPLATE_NOT_FOUND);
            }

            stats.put("templateId", template.getId());
            stats.put("templateName", template.getName());
            stats.put("totalCount", template.getTotalCount());
            stats.put("receivedCount", template.getReceivedCount());
            stats.put("usedCount", template.getUsedCount());
            stats.put("remainingCount", template.getTotalCount() - template.getReceivedCount());

            // 计算领取率和使用率
            if (template.getTotalCount() > 0) {
                stats.put("receiveRate", template.getReceivedCount() * 100.0 / template.getTotalCount());
            }
            if (template.getReceivedCount() > 0) {
                stats.put("usageRate", template.getUsedCount() * 100.0 / template.getReceivedCount());
            }

            // 获取核销金额
            List<CouponUsageLog> logs = couponUsageLogMapper.selectList(new LambdaQueryWrapper<CouponUsageLog>()
                    .eq(CouponUsageLog::getTemplateId, templateId)
                    .eq(CouponUsageLog::getAction, 1)); // 1-使用
            double totalDiscount = logs.stream()
                    .map(log -> log.getDiscountAmount() != null ? log.getDiscountAmount().doubleValue() : 0.0)
                    .mapToDouble(Double::doubleValue)
                    .sum();
            stats.put("totalDiscount", totalDiscount);
            stats.put("orderCount", logs.size());
        } else {
            // 全部优惠券统计
            List<CouponTemplate> templates = couponTemplateMapper.selectList(null);

            int totalTemplates = templates.size();
            int activeTemplates = (int) templates.stream().filter(t -> t.getStatus() == 1).count();

            int totalIssued = templates.stream().mapToInt(CouponTemplate::getTotalCount).sum();
            int totalReceived = templates.stream().mapToInt(CouponTemplate::getReceivedCount).sum();
            int totalUsed = templates.stream().mapToInt(CouponTemplate::getUsedCount).sum();

            stats.put("totalTemplates", totalTemplates);
            stats.put("activeTemplates", activeTemplates);
            stats.put("totalIssued", totalIssued);
            stats.put("totalReceived", totalReceived);
            stats.put("totalUsed", totalUsed);
            stats.put("remainingCount", totalIssued - totalReceived);

            if (totalIssued > 0) {
                stats.put("receiveRate", totalReceived * 100.0 / totalIssued);
            }
            if (totalReceived > 0) {
                stats.put("usageRate", totalUsed * 100.0 / totalReceived);
            }
        }

        return stats;
    }

    /**
     * 转换为VO
     */
    private CouponTemplateVO convertToVO(CouponTemplate template) {
        CouponTemplateVO vo = new CouponTemplateVO();
        BeanUtils.copyProperties(template, vo);

        CouponType type = CouponType.getByCode(template.getType());
        vo.setTypeDesc(type != null ? type.getDesc() : "");
        vo.setStatusDesc(template.getStatus() == 1 ? "上架" : "下架");

        // 计算剩余数量
        vo.setRemainingCount(template.getTotalCount() - template.getReceivedCount());

        // 计算领取率和使用率
        if (template.getTotalCount() > 0) {
            vo.setReceiveRate(template.getReceivedCount() * 100.0 / template.getTotalCount());
        }
        if (template.getReceivedCount() > 0) {
            vo.setUsageRate(template.getUsedCount() * 100.0 / template.getReceivedCount());
        }

        return vo;
    }

    /**
     * 转换为日志VO
     */
    private CouponUsageLogVO convertToLogVO(CouponUsageLog log) {
        CouponUsageLogVO vo = new CouponUsageLogVO();
        BeanUtils.copyProperties(log, vo);

        CouponType type = CouponType.getByCode(log.getCouponType());
        vo.setCouponTypeDesc(type != null ? type.getDesc() : "");
        vo.setActionDesc(log.getAction() == 1 ? "使用" : "返还");

        return vo;
    }
}
