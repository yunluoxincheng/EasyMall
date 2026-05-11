package org.ruikun.modules.coupon.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.CouponUsageAction;
import org.ruikun.modules.coupon.dto.CouponCalculateDTO;
import org.ruikun.modules.coupon.entity.CouponTemplate;
import org.ruikun.modules.coupon.entity.CouponUsageLog;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.coupon.entity.UserCoupon;
import org.ruikun.enums.CouponStatus;
import org.ruikun.enums.CouponType;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.coupon.mapper.CouponTemplateMapper;
import org.ruikun.modules.coupon.mapper.CouponUsageLogMapper;
import org.ruikun.modules.coupon.mapper.UserCouponMapper;
import org.ruikun.modules.user.mapper.UserMapper;
import org.ruikun.modules.coupon.service.ICouponService;
import org.ruikun.modules.coupon.vo.CouponCalculateResultVO;
import org.ruikun.modules.coupon.vo.CouponTemplateVO;
import org.ruikun.modules.coupon.vo.UserCouponVO;
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
    public BigDecimal lockCoupon(Long userId, Long userCouponId, Long orderId, String orderNo, BigDecimal orderAmount) {
        UserCoupon userCoupon = userCouponMapper.selectById(userCouponId);
        validateCouponForLock(userId, userCoupon, orderAmount);

        // 计算优惠金额
        BigDecimal discountAmount = calculateDiscountAmount(userCoupon, orderAmount);

        // UNUSED -> LOCKED，按当前状态做 CAS，避免同一张券被并发订单重复锁定
        int rows = userCouponMapper.update(null,
                new LambdaUpdateWrapper<UserCoupon>()
                        .eq(UserCoupon::getId, userCouponId)
                        .eq(UserCoupon::getUserId, userId)
                        .eq(UserCoupon::getStatus, CouponStatus.UNUSED.getCode())
                        .set(UserCoupon::getStatus, CouponStatus.LOCKED.getCode())
                        .set(UserCoupon::getOrderId, orderId)
                        .set(UserCoupon::getOrderNo, orderNo)
                        .set(UserCoupon::getUseTime, null)
        );
        if (rows == 0) {
            throw new BusinessException(ResponseCode.COUPON_ALREADY_USED, "优惠券已被使用或锁定");
        }

        insertUsageLog(userCoupon, userId, orderId, orderNo, orderAmount, discountAmount, CouponUsageAction.LOCK);

        return discountAmount;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmCouponUsed(Long userId, Long userCouponId, Long orderId) {
        UserCoupon userCoupon = userCouponMapper.selectById(userCouponId);
        if (userCoupon == null || !userCoupon.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.COUPON_NOT_FOUND);
        }

        int rows = userCouponMapper.update(null,
                new LambdaUpdateWrapper<UserCoupon>()
                        .eq(UserCoupon::getId, userCouponId)
                        .eq(UserCoupon::getUserId, userId)
                        .eq(UserCoupon::getOrderId, orderId)
                        .eq(UserCoupon::getStatus, CouponStatus.LOCKED.getCode())
                        .set(UserCoupon::getStatus, CouponStatus.USED.getCode())
                        .set(UserCoupon::getUseTime, LocalDateTime.now())
        );
        if (rows == 0) {
            UserCoupon fresh = userCouponMapper.selectById(userCouponId);
            if (fresh != null
                    && userId.equals(fresh.getUserId())
                    && orderId.equals(fresh.getOrderId())
                    && CouponStatus.USED.getCode().equals(fresh.getStatus())) {
                return;
            }
            throw new BusinessException(ResponseCode.COUPON_ALREADY_USED, "优惠券未处于锁定状态，无法确认使用");
        }

        couponTemplateMapper.update(null,
                new LambdaUpdateWrapper<CouponTemplate>()
                        .eq(CouponTemplate::getId, userCoupon.getTemplateId())
                        .setSql("used_count = used_count + 1")
        );

        CouponUsageLog lockLog = findLockLog(userCouponId, orderId);
        insertUsageLog(userCoupon, userId, orderId, userCoupon.getOrderNo(),
                lockLog != null ? lockLog.getOrderAmount() : null,
                lockLog != null ? lockLog.getDiscountAmount() : null,
                CouponUsageAction.CONFIRM_USED);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void returnLockedCoupon(Long userId, Long userCouponId, Long orderId) {
        UserCoupon userCoupon = userCouponMapper.selectById(userCouponId);
        if (userCoupon == null || !userCoupon.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.COUPON_NOT_FOUND);
        }

        if (!orderId.equals(userCoupon.getOrderId()) || !CouponStatus.LOCKED.getCode().equals(userCoupon.getStatus())) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        boolean expired = userCoupon.getEndTime() != null && now.isAfter(userCoupon.getEndTime());
        CouponStatus targetStatus = expired ? CouponStatus.EXPIRED : CouponStatus.UNUSED;

        int rows = userCouponMapper.update(null,
                new LambdaUpdateWrapper<UserCoupon>()
                        .eq(UserCoupon::getId, userCouponId)
                        .eq(UserCoupon::getUserId, userId)
                        .eq(UserCoupon::getOrderId, orderId)
                        .eq(UserCoupon::getStatus, CouponStatus.LOCKED.getCode())
                        .set(UserCoupon::getStatus, targetStatus.getCode())
                        .set(UserCoupon::getUseTime, null)
                        .set(UserCoupon::getOrderId, null)
                        .set(UserCoupon::getOrderNo, null)
        );
        if (rows == 0) {
            return;
        }

        insertUsageLog(userCoupon, userId, orderId, userCoupon.getOrderNo(),
                null, null, expired ? CouponUsageAction.EXPIRE : CouponUsageAction.RETURN);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Deprecated
    public BigDecimal useCoupon(Long userId, Long userCouponId, Long orderId, String orderNo, BigDecimal orderAmount) {
        return lockCoupon(userId, userCouponId, orderId, orderNo, orderAmount);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Deprecated
    public void returnCoupon(Long userId, Long userCouponId, Long orderId) {
        returnLockedCoupon(userId, userCouponId, orderId);
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
            insertUsageLog(coupon, coupon.getUserId(), coupon.getOrderId(), coupon.getOrderNo(),
                    null, null, CouponUsageAction.EXPIRE);
        }
    }

    private void validateCouponForLock(Long userId, UserCoupon userCoupon, BigDecimal orderAmount) {
        if (userCoupon == null || !userCoupon.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.COUPON_NOT_FOUND);
        }
        if (!CouponStatus.UNUSED.getCode().equals(userCoupon.getStatus())) {
            throw new BusinessException(ResponseCode.COUPON_ALREADY_USED, "优惠券不可用");
        }

        LocalDateTime now = LocalDateTime.now();
        if (userCoupon.getEndTime() != null && now.isAfter(userCoupon.getEndTime())) {
            throw new BusinessException(ResponseCode.COUPON_EXPIRED);
        }
        if (userCoupon.getStartTime() != null && now.isBefore(userCoupon.getStartTime())) {
            throw new BusinessException(ResponseCode.COUPON_EXPIRED, "优惠券尚未生效");
        }
        if (userCoupon.getMinAmount() != null && orderAmount.compareTo(userCoupon.getMinAmount()) < 0) {
            throw new BusinessException(ResponseCode.COUPON_AMOUNT_THRESHOLD_NOT_MET);
        }

        User user = userMapper.selectById(userId);
        Integer memberLevel = user != null ? user.getLevel() : 1;
        if (userCoupon.getMemberLevel() != null && userCoupon.getMemberLevel() > 0
                && memberLevel < userCoupon.getMemberLevel()) {
            throw new BusinessException(ResponseCode.COUPON_MEMBER_LEVEL_NOT_MET);
        }
    }

    private void insertUsageLog(UserCoupon coupon, Long userId, Long orderId, String orderNo,
                                BigDecimal orderAmount, BigDecimal discountAmount, CouponUsageAction action) {
        CouponUsageLog log = new CouponUsageLog();
        log.setUserId(userId);
        log.setUserCouponId(coupon.getId());
        log.setTemplateId(coupon.getTemplateId());
        log.setCouponName(coupon.getCouponName());
        log.setCouponType(coupon.getType());
        log.setOrderId(orderId);
        log.setOrderNo(orderNo);
        log.setOrderAmount(orderAmount);
        log.setDiscountAmount(discountAmount);
        log.setAction(action.getCode());
        couponUsageLogMapper.insert(log);
    }

    private CouponUsageLog findLockLog(Long userCouponId, Long orderId) {
        return couponUsageLogMapper.selectOne(new LambdaQueryWrapper<CouponUsageLog>()
                .eq(CouponUsageLog::getUserCouponId, userCouponId)
                .eq(CouponUsageLog::getOrderId, orderId)
                .eq(CouponUsageLog::getAction, CouponUsageAction.LOCK.getCode())
                .orderByDesc(CouponUsageLog::getCreateTime)
                .last("LIMIT 1"));
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
