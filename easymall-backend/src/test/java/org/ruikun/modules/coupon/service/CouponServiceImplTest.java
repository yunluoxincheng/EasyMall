package org.ruikun.modules.coupon.service;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.CouponStatus;
import org.ruikun.enums.CouponUsageAction;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.coupon.entity.CouponTemplate;
import org.ruikun.modules.coupon.entity.CouponUsageLog;
import org.ruikun.modules.coupon.entity.UserCoupon;
import org.ruikun.modules.coupon.mapper.CouponTemplateMapper;
import org.ruikun.modules.coupon.mapper.CouponUsageLogMapper;
import org.ruikun.modules.coupon.mapper.UserCouponMapper;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.user.mapper.UserMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceImplTest {

    @BeforeAll
    static void initMybatisPlusLambdaCache() {
        Configuration configuration = new Configuration();

        MapperBuilderAssistant assistant1 = new MapperBuilderAssistant(configuration, "");
        assistant1.setCurrentNamespace("org.ruikun.modules.coupon.mapper.UserCouponMapper");
        TableInfoHelper.initTableInfo(assistant1, UserCoupon.class);

        MapperBuilderAssistant assistant2 = new MapperBuilderAssistant(configuration, "");
        assistant2.setCurrentNamespace("org.ruikun.modules.coupon.mapper.CouponTemplateMapper");
        TableInfoHelper.initTableInfo(assistant2, CouponTemplate.class);

        MapperBuilderAssistant assistant3 = new MapperBuilderAssistant(configuration, "");
        assistant3.setCurrentNamespace("org.ruikun.modules.coupon.mapper.CouponUsageLogMapper");
        TableInfoHelper.initTableInfo(assistant3, CouponUsageLog.class);
    }

    @Mock
    private CouponTemplateMapper couponTemplateMapper;

    @Mock
    private UserCouponMapper userCouponMapper;

    @Mock
    private CouponUsageLogMapper couponUsageLogMapper;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private CouponServiceImpl couponService;

    @Captor
    private ArgumentCaptor<CouponUsageLog> logCaptor;

    private UserCoupon createCoupon(Long id, Long userId, Integer status) {
        UserCoupon coupon = new UserCoupon();
        coupon.setId(id);
        coupon.setUserId(userId);
        coupon.setTemplateId(2001L);
        coupon.setCouponName("满100减10");
        coupon.setType(1);
        coupon.setDiscountAmount(new BigDecimal("10.00"));
        coupon.setMinAmount(new BigDecimal("100.00"));
        coupon.setMemberLevel(0);
        coupon.setStartTime(LocalDateTime.now().minusDays(1));
        coupon.setEndTime(LocalDateTime.now().plusDays(1));
        coupon.setStatus(status);
        return coupon;
    }

    private User createUser(Long id, Integer level) {
        User user = new User();
        user.setId(id);
        user.setLevel(level);
        return user;
    }

    @Nested
    @DisplayName("lockCoupon")
    class LockCoupon {

        @Test
        @DisplayName("成功锁定优惠券并写入锁定日志")
        void lockCouponSuccess() {
            UserCoupon coupon = createCoupon(3001L, 100L, CouponStatus.UNUSED.getCode());
            when(userCouponMapper.selectById(3001L)).thenReturn(coupon);
            when(userMapper.selectById(100L)).thenReturn(createUser(100L, 1));
            when(userCouponMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(1);

            BigDecimal discount = couponService.lockCoupon(100L, 3001L, 10L, "ORD123", new BigDecimal("120.00"));

            assertEquals(0, new BigDecimal("10.00").compareTo(discount));
            verify(userCouponMapper).update(isNull(), any(LambdaUpdateWrapper.class));
            verify(couponUsageLogMapper).insert(logCaptor.capture());
            CouponUsageLog log = logCaptor.getValue();
            assertEquals(CouponUsageAction.LOCK.getCode(), log.getAction());
            assertEquals(10L, log.getOrderId());
            assertEquals("ORD123", log.getOrderNo());
            assertEquals(0, new BigDecimal("120.00").compareTo(log.getOrderAmount()));
            assertEquals(0, new BigDecimal("10.00").compareTo(log.getDiscountAmount()));
        }

        @Test
        @DisplayName("拒绝锁定他人优惠券")
        void rejectOtherUserCoupon() {
            UserCoupon coupon = createCoupon(3001L, 200L, CouponStatus.UNUSED.getCode());
            when(userCouponMapper.selectById(3001L)).thenReturn(coupon);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> couponService.lockCoupon(100L, 3001L, 10L, "ORD123", new BigDecimal("120.00")));

            assertEquals(ResponseCode.COUPON_NOT_FOUND, ex.getResponseCode());
            verify(userCouponMapper, never()).update(isNull(), any(LambdaUpdateWrapper.class));
        }

        @Test
        @DisplayName("拒绝锁定非未使用优惠券")
        void rejectNotUnusedCoupon() {
            UserCoupon coupon = createCoupon(3001L, 100L, CouponStatus.LOCKED.getCode());
            when(userCouponMapper.selectById(3001L)).thenReturn(coupon);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> couponService.lockCoupon(100L, 3001L, 10L, "ORD123", new BigDecimal("120.00")));

            assertEquals(ResponseCode.COUPON_ALREADY_USED, ex.getResponseCode());
            verify(userCouponMapper, never()).update(isNull(), any(LambdaUpdateWrapper.class));
        }

        @Test
        @DisplayName("拒绝过期优惠券、未满足门槛和会员等级不足")
        void rejectExpiredThresholdAndMemberLevel() {
            UserCoupon expired = createCoupon(3001L, 100L, CouponStatus.UNUSED.getCode());
            expired.setEndTime(LocalDateTime.now().minusMinutes(1));
            when(userCouponMapper.selectById(3001L)).thenReturn(expired);
            assertEquals(ResponseCode.COUPON_EXPIRED, assertThrows(BusinessException.class,
                    () -> couponService.lockCoupon(100L, 3001L, 10L, "ORD123", new BigDecimal("120.00"))).getResponseCode());

            UserCoupon threshold = createCoupon(3002L, 100L, CouponStatus.UNUSED.getCode());
            when(userCouponMapper.selectById(3002L)).thenReturn(threshold);
            assertEquals(ResponseCode.COUPON_AMOUNT_THRESHOLD_NOT_MET, assertThrows(BusinessException.class,
                    () -> couponService.lockCoupon(100L, 3002L, 10L, "ORD123", new BigDecimal("80.00"))).getResponseCode());

            UserCoupon member = createCoupon(3003L, 100L, CouponStatus.UNUSED.getCode());
            member.setMemberLevel(3);
            when(userCouponMapper.selectById(3003L)).thenReturn(member);
            when(userMapper.selectById(100L)).thenReturn(createUser(100L, 1));
            assertEquals(ResponseCode.COUPON_MEMBER_LEVEL_NOT_MET, assertThrows(BusinessException.class,
                    () -> couponService.lockCoupon(100L, 3003L, 10L, "ORD123", new BigDecimal("120.00"))).getResponseCode());
        }
    }

    @Nested
    @DisplayName("confirmCouponUsed")
    class ConfirmCouponUsed {

        @Test
        @DisplayName("锁定优惠券支付成功后确认为已使用")
        void confirmLockedCoupon() {
            UserCoupon coupon = createCoupon(3001L, 100L, CouponStatus.LOCKED.getCode());
            coupon.setOrderId(10L);
            coupon.setOrderNo("ORD123");
            when(userCouponMapper.selectById(3001L)).thenReturn(coupon);
            when(userCouponMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(1);

            couponService.confirmCouponUsed(100L, 3001L, 10L);

            verify(couponTemplateMapper).update(isNull(), any(LambdaUpdateWrapper.class));
            verify(couponUsageLogMapper).insert(logCaptor.capture());
            assertEquals(CouponUsageAction.CONFIRM_USED.getCode(), logCaptor.getValue().getAction());
        }

        @Test
        @DisplayName("重复确认已使用优惠券不重复统计或写日志")
        void duplicateConfirmIsIdempotent() {
            UserCoupon coupon = createCoupon(3001L, 100L, CouponStatus.LOCKED.getCode());
            coupon.setOrderId(10L);
            UserCoupon used = createCoupon(3001L, 100L, CouponStatus.USED.getCode());
            used.setOrderId(10L);
            when(userCouponMapper.selectById(3001L)).thenReturn(coupon, used);
            when(userCouponMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(0);

            couponService.confirmCouponUsed(100L, 3001L, 10L);

            verify(couponTemplateMapper, never()).update(isNull(), any(LambdaUpdateWrapper.class));
            verify(couponUsageLogMapper, never()).insert(any(CouponUsageLog.class));
        }
    }

    @Nested
    @DisplayName("returnLockedCoupon")
    class ReturnLockedCoupon {

        @Test
        @DisplayName("取消待支付订单后返还锁定优惠券")
        void returnLockedCoupon() {
            UserCoupon coupon = createCoupon(3001L, 100L, CouponStatus.LOCKED.getCode());
            coupon.setOrderId(10L);
            coupon.setOrderNo("ORD123");
            when(userCouponMapper.selectById(3001L)).thenReturn(coupon);
            when(userCouponMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(1);

            couponService.returnLockedCoupon(100L, 3001L, 10L);

            verify(couponUsageLogMapper).insert(logCaptor.capture());
            assertEquals(CouponUsageAction.RETURN.getCode(), logCaptor.getValue().getAction());
        }

        @Test
        @DisplayName("过期的锁定优惠券返还时变为过期状态")
        void returnExpiredLockedCoupon() {
            UserCoupon coupon = createCoupon(3001L, 100L, CouponStatus.LOCKED.getCode());
            coupon.setOrderId(10L);
            coupon.setOrderNo("ORD123");
            coupon.setEndTime(LocalDateTime.now().minusMinutes(1));
            when(userCouponMapper.selectById(3001L)).thenReturn(coupon);
            when(userCouponMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(1);

            couponService.returnLockedCoupon(100L, 3001L, 10L);

            verify(couponUsageLogMapper).insert(logCaptor.capture());
            assertEquals(CouponUsageAction.EXPIRE.getCode(), logCaptor.getValue().getAction());
        }

        @Test
        @DisplayName("重复返还不重复写日志")
        void duplicateReturnIsIdempotent() {
            UserCoupon coupon = createCoupon(3001L, 100L, CouponStatus.UNUSED.getCode());
            coupon.setOrderId(null);
            when(userCouponMapper.selectById(3001L)).thenReturn(coupon);

            couponService.returnLockedCoupon(100L, 3001L, 10L);

            verify(userCouponMapper, never()).update(isNull(), any(LambdaUpdateWrapper.class));
            verify(couponUsageLogMapper, never()).insert(any(CouponUsageLog.class));
        }
    }
}
