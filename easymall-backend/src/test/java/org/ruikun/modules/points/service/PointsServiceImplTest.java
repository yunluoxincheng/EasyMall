package org.ruikun.modules.points.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.PointsBizType;
import org.ruikun.enums.PointsTypeEnum;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.points.entity.PointsRecord;
import org.ruikun.modules.points.mapper.PointsRecordMapper;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.user.mapper.UserMapper;
import org.ruikun.modules.user.service.IMemberService;
import org.springframework.dao.DuplicateKeyException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PointsServiceImplTest {

    @Mock private PointsRecordMapper pointsRecordMapper;
    @Mock private UserMapper userMapper;
    @Mock private IMemberService memberService;
    @Captor private ArgumentCaptor<PointsRecord> recordCaptor;

    private PointsServiceImpl pointsService;

    @BeforeEach
    void setUp() {
        pointsService = new PointsServiceImpl(pointsRecordMapper, userMapper, memberService);
    }

    private User buildUser(Long id, int points) {
        User user = new User();
        user.setId(id);
        user.setPoints(points);
        return user;
    }

    @Nested
    @DisplayName("addPointsIdempotent")
    class AddPointsIdempotent {

        @Test
        @DisplayName("6.1 首次调用成功增加积分并写入 biz_type + biz_id")
        void firstCallSucceeds() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class))).thenReturn(1);
            when(userMapper.atomicAddPoints(1L, 50)).thenReturn(1);

            pointsService.addPointsIdempotent(1L, 50, PointsBizType.ORDER_COMPLETED, "1001", "订单完成积分");

            verify(pointsRecordMapper).insert(recordCaptor.capture());
            PointsRecord record = recordCaptor.getValue();
            assertEquals("ORDER_COMPLETED", record.getBizType());
            assertEquals("1001", record.getBizId());
            assertEquals(50, record.getPointsChange());
            assertEquals(100, record.getBeforePoints());
            assertEquals(150, record.getAfterPoints());

            verify(userMapper).atomicAddPoints(1L, 50);
            verify(memberService).checkAndUpgradeMember(1L);
        }

        @Test
        @DisplayName("6.2 重复调用抛出 DuplicateKeyException，用户积分不变")
        void duplicateCallThrowsDuplicateKey() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class)))
                    .thenThrow(new DuplicateKeyException("uk_biz"));

            assertThrows(DuplicateKeyException.class,
                    () -> pointsService.addPointsIdempotent(1L, 50, PointsBizType.ORDER_COMPLETED, "1001", "订单完成积分"));

            verify(userMapper, never()).atomicAddPoints(anyLong(), anyInt());
            verify(memberService, never()).checkAndUpgradeMember(anyLong());
        }

        @Test
        @DisplayName("原子加分返回 0 行时抛出用户不存在")
        void atomicAddZeroRowsThrowsException() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class))).thenReturn(1);
            when(userMapper.atomicAddPoints(1L, 50)).thenReturn(0);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> pointsService.addPointsIdempotent(1L, 50, PointsBizType.ORDER_COMPLETED, "1002", "测试"));

            assertEquals(ResponseCode.USER_NOT_FOUND, ex.getResponseCode());
            verify(memberService, never()).checkAndUpgradeMember(anyLong());
        }
    }

    @Nested
    @DisplayName("deductPointsIdempotent")
    class DeductPointsIdempotent {

        @Test
        @DisplayName("6.3 首次调用成功扣减积分")
        void firstCallSucceeds() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class))).thenReturn(1);
            when(userMapper.atomicDeductPoints(1L, 30)).thenReturn(1);

            pointsService.deductPointsIdempotent(1L, 30, PointsBizType.POINTS_EXCHANGE, "exchange:EXG123", "兑换商品");

            verify(pointsRecordMapper).insert(recordCaptor.capture());
            PointsRecord record = recordCaptor.getValue();
            assertEquals("POINTS_EXCHANGE", record.getBizType());
            assertEquals("exchange:EXG123", record.getBizId());
            assertEquals(-30, record.getPointsChange());
            assertEquals(100, record.getBeforePoints());
            assertEquals(70, record.getAfterPoints());

            verify(userMapper).atomicDeductPoints(1L, 30);
        }

        @Test
        @DisplayName("6.4 重复调用抛出 DuplicateKeyException，用户积分不变")
        void duplicateCallThrowsDuplicateKey() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class)))
                    .thenThrow(new DuplicateKeyException("uk_biz"));

            assertThrows(DuplicateKeyException.class,
                    () -> pointsService.deductPointsIdempotent(1L, 30, PointsBizType.POINTS_EXCHANGE, "exchange:EXG123", "兑换商品"));

            verify(userMapper, never()).atomicDeductPoints(anyLong(), anyInt());
        }

        @Test
        @DisplayName("6.5 积分不足时抛出 BusinessException")
        void insufficientPointsThrowsBusinessException() {
            User user = buildUser(1L, 20);
            when(userMapper.selectById(1L)).thenReturn(user);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> pointsService.deductPointsIdempotent(1L, 50, PointsBizType.POINTS_EXCHANGE, "exchange:EXG123", "兑换商品"));

            assertEquals(ResponseCode.POINTS_INSUFFICIENT, ex.getResponseCode());
            verify(pointsRecordMapper, never()).insert(any(PointsRecord.class));
            verify(userMapper, never()).atomicDeductPoints(anyLong(), anyInt());
        }

        @Test
        @DisplayName("原子扣减返回 0 行时抛出积分不足")
        void atomicDeductZeroRowsThrowsBusinessException() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class))).thenReturn(1);
            when(userMapper.atomicDeductPoints(1L, 80)).thenReturn(0);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> pointsService.deductPointsIdempotent(1L, 80, PointsBizType.POINTS_EXCHANGE, "exchange:EXG456", "兑换商品"));

            assertEquals(ResponseCode.POINTS_INSUFFICIENT, ex.getResponseCode());
        }
    }

    @Nested
    @DisplayName("addPointsForOrder")
    class AddPointsForOrder {

        @Test
        @DisplayName("使用 ORDER_COMPLETED bizType 调用幂等方法")
        void usesIdempotentMethod() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class))).thenReturn(1);
            when(userMapper.atomicAddPoints(1L, 100)).thenReturn(1);

            pointsService.addPointsForOrder(1L, 2001L, 100.0);

            verify(pointsRecordMapper).insert(recordCaptor.capture());
            assertEquals("ORDER_COMPLETED", recordCaptor.getValue().getBizType());
            assertEquals("2001", recordCaptor.getValue().getBizId());
        }
    }

    @Nested
    @DisplayName("addPointsForComment")
    class AddPointsForComment {

        @Test
        @DisplayName("使用 COMMENT_CREATED bizType 和正确的 bizId 格式")
        void usesCorrectBizIdFormat() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class))).thenReturn(1);
            when(userMapper.atomicAddPoints(1L, 10)).thenReturn(1);

            pointsService.addPointsForComment(1L, 300L, 400L);

            verify(pointsRecordMapper).insert(recordCaptor.capture());
            assertEquals("COMMENT_CREATED", recordCaptor.getValue().getBizType());
            assertEquals("comment:300:400", recordCaptor.getValue().getBizId());
        }
    }

    @Nested
    @DisplayName("legacy type mapping")
    class LegacyTypeMapping {

        @Test
        @DisplayName("ORDER_COMPLETED 映射到旧 type code 1")
        void mapsOrderCompleted() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class))).thenReturn(1);
            when(userMapper.atomicAddPoints(1L, 10)).thenReturn(1);

            pointsService.addPointsIdempotent(1L, 10, PointsBizType.ORDER_COMPLETED, "test", "test");

            verify(pointsRecordMapper).insert(recordCaptor.capture());
            assertEquals(PointsTypeEnum.ORDER.getCode(), recordCaptor.getValue().getType());
        }

        @Test
        @DisplayName("COMMENT_CREATED 映射到旧 type code 2")
        void mapsCommentCreated() {
            User user = buildUser(1L, 100);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsRecordMapper.insert(any(PointsRecord.class))).thenReturn(1);
            when(userMapper.atomicAddPoints(1L, 10)).thenReturn(1);

            pointsService.addPointsIdempotent(1L, 10, PointsBizType.COMMENT_CREATED, "test2", "test");

            verify(pointsRecordMapper).insert(recordCaptor.capture());
            assertEquals(PointsTypeEnum.COMMENT.getCode(), recordCaptor.getValue().getType());
        }
    }
}
