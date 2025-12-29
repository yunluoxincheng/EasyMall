package org.ruikun.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.dto.CouponCalculateDTO;
import org.ruikun.entity.*;
import org.ruikun.enums.CouponStatus;
import org.ruikun.enums.CouponType;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.*;
import org.ruikun.service.ICouponService;
import org.ruikun.vo.CouponCalculateResultVO;
import org.ruikun.vo.CouponTemplateVO;
import org.ruikun.vo.UserCouponVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 优惠券服务实现类
 */
@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements ICouponService {

    private final CouponTemplateMapper couponTemplateMapper;
    private final UserCouponMapper userCouponMapper;
    private final CouponUsageLogMapper couponUsageLogMapper;
    private final UserMapper userMapper;

    @Override
    public List<CouponTemplateVO> getAvailableTemplates(Long userId) {
        // 获取用户会员等级
        User user = userMapper.selectById(userId);
        Integer memberLevel = (user != null) ? user.getLevel() : 1;

        // 查询上架中的优惠券模板
        LambdaQueryWrapper<CouponTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CouponTemplate::getStatus, 1)
                .and(w -> w.isNull(CouponTemplate::getEndTime)
                        .or().gt(CouponTemplate::getEndTime, LocalDateTime.now()))
                .orderByAsc(CouponTemplate::getSortOrder)
                .orderByDesc(CouponTemplate::getCreateTime);

        List<CouponTemplate> templates = couponTemplateMapper.selectList(wrapper);

        // 转换为VO并设置是否可领取
        LocalDateTime now = LocalDateTime.now();
        return templates.stream().map(template -> {
            CouponTemplateVO vo = convertToTemplateVO(template);
            // 检查会员等级
            if (template.getMemberLevel() != null && template.getMemberLevel() > 0
                    && memberLevel < template.getMemberLevel()) {
                vo.setCanReceive(false);
            }
            // 检查数量限制
            else if (template.getReceivedCount() >= template.getTotalCount()) {
                vo.setCanReceive(false);
            }
            // 检查有效期
            else if (template.getStartTime() != null && now.isBefore(template.getStartTime())) {
                vo.setCanReceive(false);
            }
            // 检查用户是否已领取
            else {
                Long count = userCouponMapper.selectCount(new LambdaQueryWrapper<UserCoupon>()
                        .eq(UserCoupon::getUserId, userId)
                        .eq(UserCoupon::getTemplateId, template.getId()));
                vo.setReceivedByUser(count.intValue());
                vo.setCanReceive(count < 1); // 每人限领1张
            }
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long receiveCoupon(Long userId, Long templateId) {
        // 获取优惠券模板
        CouponTemplate template = couponTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException(ResponseCode.COUPON_TEMPLATE_NOT_FOUND);
        }
        if (template.getStatus() != 1) {
            throw new BusinessException(ResponseCode.COUPON_TEMPLATE_NOT_FOUND, "优惠券已下架");
        }

        // 检查会员等级
        User user = userMapper.selectById(userId);
        if (template.getMemberLevel() != null && template.getMemberLevel() > 0
                && user.getLevel() < template.getMemberLevel()) {
            throw new BusinessException(ResponseCode.COUPON_MEMBER_LEVEL_NOT_MET);
        }

        // 检查数量限制
        if (template.getReceivedCount() >= template.getTotalCount()) {
            throw new BusinessException(ResponseCode.COUPON_OUT_OF_STOCK);
        }

        // 检查是否已领取
        Long count = userCouponMapper.selectCount(new LambdaQueryWrapper<UserCoupon>()
                .eq(UserCoupon::getUserId, userId)
                .eq(UserCoupon::getTemplateId, templateId));
        if (count >= 1) {
            throw new BusinessException(ResponseCode.COUPON_ALREADY_RECEIVED);
        }

        // 更新模板领取数量
        template.setReceivedCount(template.getReceivedCount() + 1);
        couponTemplateMapper.updateById(template);

        // 创建用户优惠券
        UserCoupon userCoupon = new UserCoupon();
        userCoupon.setUserId(userId);
        userCoupon.setTemplateId(templateId);
        userCoupon.setCouponCode(generateCouponCode());
        userCoupon.setCouponName(template.getName());
        userCoupon.setType(template.getType());
        userCoupon.setDiscountAmount(template.getDiscountAmount());
        userCoupon.setDiscountPercentage(template.getDiscountPercentage());
        userCoupon.setMinAmount(template.getMinAmount());
        userCoupon.setMaxDiscount(template.getMaxDiscount());
        userCoupon.setMemberLevel(template.getMemberLevel());

        // 计算有效期
        LocalDateTime now = LocalDateTime.now();
        if (template.getValidDays() != null && template.getValidDays() > 0) {
            userCoupon.setStartTime(now);
            userCoupon.setEndTime(now.plusDays(template.getValidDays()));
        } else {
            userCoupon.setStartTime(template.getStartTime() != null ? template.getStartTime() : now);
            userCoupon.setEndTime(template.getEndTime());
        }

        userCoupon.setStatus(CouponStatus.UNUSED.getCode());
        userCoupon.setReceiveTime(now);
        userCouponMapper.insert(userCoupon);

        return userCoupon.getId();
    }

    @Override
    public Page<UserCouponVO> getUserCoupons(Long userId, Integer status, Integer pageNum, Integer pageSize) {
        Page<UserCoupon> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UserCoupon> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserCoupon::getUserId, userId);

        if (status != null) {
            wrapper.eq(UserCoupon::getStatus, status);
        } else {
            // 未指定状态时，未使用的排在前面
            wrapper.orderByAsc(UserCoupon::getStatus);
        }

        wrapper.orderByDesc(UserCoupon::getReceiveTime);

        Page<UserCoupon> couponPage = userCouponMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<UserCouponVO> voPage = new Page<>();
        BeanUtils.copyProperties(couponPage, voPage, "records");

        List<UserCouponVO> voList = couponPage.getRecords().stream()
                .map(this::convertToUserCouponVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public List<UserCouponVO> getAvailableCoupons(Long userId, BigDecimal orderAmount) {
        LambdaQueryWrapper<UserCoupon> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserCoupon::getUserId, userId)
                .eq(UserCoupon::getStatus, CouponStatus.UNUSED.getCode())
                .le(UserCoupon::getMinAmount, orderAmount)
                .gt(UserCoupon::getEndTime, LocalDateTime.now())
                .orderByAsc(UserCoupon::getEndTime);

        List<UserCoupon> coupons = userCouponMapper.selectList(wrapper);

        // 获取用户会员等级
        User user = userMapper.selectById(userId);
        Integer memberLevel = (user != null) ? user.getLevel() : 1;

        LocalDateTime now = LocalDateTime.now();

        return coupons.stream().filter(coupon -> {
            // 检查会员等级
            if (coupon.getMemberLevel() != null && coupon.getMemberLevel() > 0
                    && memberLevel < coupon.getMemberLevel()) {
                return false;
            }
            // 检查有效期开始时间
            if (coupon.getStartTime() != null && now.isBefore(coupon.getStartTime())) {
                return false;
            }
            return true;
        }).map(this::convertToUserCouponVO).collect(Collectors.toList());
    }

    @Override
    public CouponCalculateResultVO calculateDiscount(Long userId, CouponCalculateDTO dto) {
        UserCoupon userCoupon = userCouponMapper.selectById(dto.getUserCouponId());
        if (userCoupon == null || !userCoupon.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.COUPON_NOT_FOUND);
        }

        CouponCalculateResultVO result = new CouponCalculateResultVO();
        result.setUserCouponId(userCoupon.getId());
        result.setCouponName(userCoupon.getCouponName());
        result.setType(userCoupon.getType());
        result.setTypeDesc(CouponType.getByCode(userCoupon.getType()) != null
                ? CouponType.getByCode(userCoupon.getType()).getDesc() : "");
        result.setOriginalAmount(dto.getOrderAmount());

        // 检查优惠券状态
        if (!CouponStatus.UNUSED.getCode().equals(userCoupon.getStatus())) {
            result.setAvailable(false);
            result.setUnavailableReason("优惠券已使用或已过期");
            return result;
        }

        // 检查有效期
        LocalDateTime now = LocalDateTime.now();
        if (userCoupon.getEndTime() != null && now.isAfter(userCoupon.getEndTime())) {
            result.setAvailable(false);
            result.setUnavailableReason("优惠券已过期");
            return result;
        }
        if (userCoupon.getStartTime() != null && now.isBefore(userCoupon.getStartTime())) {
            result.setAvailable(false);
            result.setUnavailableReason("优惠券尚未生效");
            return result;
        }

        // 检查使用门槛
        if (userCoupon.getMinAmount() != null && dto.getOrderAmount().compareTo(userCoupon.getMinAmount()) < 0) {
            result.setAvailable(false);
            result.setUnavailableReason("订单金额不满" + userCoupon.getMinAmount() + "元");
            return result;
        }

        // 检查会员等级
        User user = userMapper.selectById(userId);
        if (userCoupon.getMemberLevel() != null && userCoupon.getMemberLevel() > 0
                && user.getLevel() < userCoupon.getMemberLevel()) {
            result.setAvailable(false);
            result.setUnavailableReason("会员等级不足");
            return result;
        }

        // 计算优惠金额
        BigDecimal discountAmount = calculateDiscountAmount(userCoupon, dto.getOrderAmount());
        result.setDiscountAmount(discountAmount);
        result.setFinalAmount(dto.getOrderAmount().subtract(discountAmount));
        result.setAvailable(true);

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BigDecimal useCoupon(Long userId, Long userCouponId, Long orderId, String orderNo, BigDecimal orderAmount) {
        UserCoupon userCoupon = userCouponMapper.selectById(userCouponId);
        if (userCoupon == null || !userCoupon.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.COUPON_NOT_FOUND);
        }

        // 检查状态
        if (!CouponStatus.UNUSED.getCode().equals(userCoupon.getStatus())) {
            throw new BusinessException(ResponseCode.COUPON_ALREADY_USED);
        }

        // 计算优惠金额
        BigDecimal discountAmount = calculateDiscountAmount(userCoupon, orderAmount);

        // 更新优惠券状态
        userCoupon.setStatus(CouponStatus.USED.getCode());
        userCoupon.setUseTime(LocalDateTime.now());
        userCoupon.setOrderId(orderId);
        userCoupon.setOrderNo(orderNo);
        userCouponMapper.updateById(userCoupon);

        // 更新模板使用数量
        CouponTemplate template = couponTemplateMapper.selectById(userCoupon.getTemplateId());
        if (template != null) {
            template.setUsedCount(template.getUsedCount() + 1);
            couponTemplateMapper.updateById(template);
        }

        // 记录使用日志
        CouponUsageLog log = new CouponUsageLog();
        log.setUserId(userId);
        log.setUserCouponId(userCouponId);
        log.setTemplateId(userCoupon.getTemplateId());
        log.setCouponName(userCoupon.getCouponName());
        log.setCouponType(userCoupon.getType());
        log.setOrderId(orderId);
        log.setOrderNo(orderNo);
        log.setOrderAmount(orderAmount);
        log.setDiscountAmount(discountAmount);
        log.setAction(1); // 1-使用
        couponUsageLogMapper.insert(log);

        return discountAmount;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void returnCoupon(Long userId, Long userCouponId, Long orderId) {
        UserCoupon userCoupon = userCouponMapper.selectById(userCouponId);
        if (userCoupon == null || !userCoupon.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.COUPON_NOT_FOUND);
        }

        // 检查订单是否匹配
        if (!orderId.equals(userCoupon.getOrderId())) {
            throw new BusinessException(ResponseCode.COUPON_CANNOT_RETURN, "优惠券与订单不匹配");
        }

        // 检查状态
        if (!CouponStatus.USED.getCode().equals(userCoupon.getStatus())) {
            throw new BusinessException(ResponseCode.COUPON_CANNOT_RETURN, "优惠券状态不正确");
        }

        // 恢复优惠券状态
        userCoupon.setStatus(CouponStatus.UNUSED.getCode());
        userCoupon.setUseTime(null);
        userCoupon.setOrderId(null);
        userCoupon.setOrderNo(null);
        userCouponMapper.updateById(userCoupon);

        // 更新模板使用数量
        CouponTemplate template = couponTemplateMapper.selectById(userCoupon.getTemplateId());
        if (template != null && template.getUsedCount() > 0) {
            template.setUsedCount(template.getUsedCount() - 1);
            couponTemplateMapper.updateById(template);
        }

        // 记录返还日志
        CouponUsageLog log = new CouponUsageLog();
        log.setUserId(userId);
        log.setUserCouponId(userCouponId);
        log.setTemplateId(userCoupon.getTemplateId());
        log.setCouponName(userCoupon.getCouponName());
        log.setCouponType(userCoupon.getType());
        log.setOrderId(orderId);
        log.setOrderNo(userCoupon.getOrderNo());
        log.setAction(2); // 2-返还
        couponUsageLogMapper.insert(log);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long issueCoupon(Long userId, Long templateId) {
        // 获取优惠券模板
        CouponTemplate template = couponTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException(ResponseCode.COUPON_TEMPLATE_NOT_FOUND);
        }

        // 更新模板领取数量
        template.setReceivedCount(template.getReceivedCount() + 1);
        couponTemplateMapper.updateById(template);

        // 创建用户优惠券
        UserCoupon userCoupon = new UserCoupon();
        userCoupon.setUserId(userId);
        userCoupon.setTemplateId(templateId);
        userCoupon.setCouponCode(generateCouponCode());
        userCoupon.setCouponName(template.getName());
        userCoupon.setType(template.getType());
        userCoupon.setDiscountAmount(template.getDiscountAmount());
        userCoupon.setDiscountPercentage(template.getDiscountPercentage());
        userCoupon.setMinAmount(template.getMinAmount());
        userCoupon.setMaxDiscount(template.getMaxDiscount());
        userCoupon.setMemberLevel(template.getMemberLevel());

        // 计算有效期
        LocalDateTime now = LocalDateTime.now();
        if (template.getValidDays() != null && template.getValidDays() > 0) {
            userCoupon.setStartTime(now);
            userCoupon.setEndTime(now.plusDays(template.getValidDays()));
        } else {
            userCoupon.setStartTime(template.getStartTime() != null ? template.getStartTime() : now);
            userCoupon.setEndTime(template.getEndTime());
        }

        userCoupon.setStatus(CouponStatus.UNUSED.getCode());
        userCoupon.setReceiveTime(now);
        userCouponMapper.insert(userCoupon);

        return userCoupon.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateExpiredCoupons() {
        // 批量更新过期的优惠券
        LocalDateTime now = LocalDateTime.now();

        // 查询所有需要更新的优惠券ID
        List<UserCoupon> expiredCoupons = userCouponMapper.selectList(
                new LambdaQueryWrapper<UserCoupon>()
                        .eq(UserCoupon::getStatus, CouponStatus.UNUSED.getCode())
                        .lt(UserCoupon::getEndTime, now)
        );

        // 批量更新状态
        for (UserCoupon coupon : expiredCoupons) {
            coupon.setStatus(CouponStatus.EXPIRED.getCode());
            userCouponMapper.updateById(coupon);
        }
    }

    /**
     * 生成优惠券编码
     */
    private String generateCouponCode() {
        return "CPN" + IdUtil.getSnowflake(1, 1).nextId();
    }

    /**
     * 计算优惠金额
     */
    private BigDecimal calculateDiscountAmount(UserCoupon coupon, BigDecimal orderAmount) {
        CouponType type = CouponType.getByCode(coupon.getType());
        if (type == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        switch (type) {
            case FIXED_AMOUNT:
            case NEWCOMER:
            case MEMBER_EXCLUSIVE:
                discount = coupon.getDiscountAmount() != null ? coupon.getDiscountAmount() : BigDecimal.ZERO;
                break;
            case PERCENTAGE:
                BigDecimal percentage = coupon.getDiscountPercentage();
                if (percentage == null || percentage.compareTo(BigDecimal.ZERO) <= 0) {
                    return BigDecimal.ZERO;
                }
                discount = orderAmount.multiply(BigDecimal.valueOf(100).subtract(percentage))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                // 检查最大优惠金额限制
                if (coupon.getMaxDiscount() != null && coupon.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0
                        && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                    discount = coupon.getMaxDiscount();
                }
                break;
            default:
                return BigDecimal.ZERO;
        }

        // 优惠金额不能超过订单金额
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return discount;
    }

    /**
     * 转换为模板VO
     */
    private CouponTemplateVO convertToTemplateVO(CouponTemplate template) {
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
     * 转换为用户优惠券VO
     */
    private UserCouponVO convertToUserCouponVO(UserCoupon coupon) {
        UserCouponVO vo = new UserCouponVO();
        BeanUtils.copyProperties(coupon, vo);

        CouponType type = CouponType.getByCode(coupon.getType());
        vo.setTypeDesc(type != null ? type.getDesc() : "");

        CouponStatus status = CouponStatus.getByCode(coupon.getStatus());
        vo.setStatusDesc(status != null ? status.getDesc() : "未知");

        // 检查是否即将过期（3天内）
        if (coupon.getEndTime() != null && CouponStatus.UNUSED.getCode().equals(coupon.getStatus())) {
            vo.setExpiringSoon(LocalDateTime.now().plusDays(3).isAfter(coupon.getEndTime()));
        }

        return vo;
    }
}
