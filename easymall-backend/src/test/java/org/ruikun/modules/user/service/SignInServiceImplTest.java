package org.ruikun.modules.user.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.PointsBizType;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.user.entity.UserSign;
import org.ruikun.modules.user.mapper.UserMapper;
import org.ruikun.modules.user.mapper.UserSignMapper;
import org.ruikun.modules.user.vo.SignInResultVO;
import org.ruikun.modules.points.service.IPointsService;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SignInServiceImplTest {

    @BeforeAll
    static void initMybatisPlusLambdaCache() {
        Configuration configuration = new Configuration();
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(configuration, "");
        assistant.setCurrentNamespace("org.ruikun.modules.user.mapper.UserSignMapper");
        TableInfoHelper.initTableInfo(assistant, UserSign.class);
    }

    @Mock
    private UserSignMapper userSignMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private IPointsService pointsService;

    @InjectMocks
    private SignInServiceImpl signInService;

    private User buildUser(Long id, int points) {
        User user = new User();
        user.setId(id);
        user.setUsername("testuser");
        user.setPoints(points);
        user.setStatus(1);
        return user;
    }

    @Nested
    @DisplayName("signIn")
    class SignIn {

        @Test
        @DisplayName("5.2 首次签到成功，返回 SignInResultVO: success=true, continuousDays=1")
        void firstTimeSignInSuccess() {
            Long userId = 1L;
            User userBefore = buildUser(userId, 100);
            User userAfter = buildUser(userId, 105);

            when(userMapper.selectById(userId)).thenReturn(userBefore, userAfter);
            when(userSignMapper.selectOne(any(LambdaQueryWrapper.class)))
                    .thenReturn(null).thenReturn(null);
            when(userSignMapper.insert(any(UserSign.class))).thenReturn(1);

            SignInResultVO result = signInService.signIn(userId);

            assertNotNull(result);
            assertTrue(result.getSuccess());
            assertEquals(1, result.getContinuousDays());
            assertEquals(5, result.getPointsEarned());
            assertEquals(105, result.getCurrentPoints());
            assertFalse(result.getHasSignedToday());

            verify(pointsService).addPointsIdempotent(
                    eq(userId), eq(5), eq(PointsBizType.DAILY_SIGN_IN),
                    startsWith("sign:" + userId + ":"), eq("连续签到1天"));
        }

        @Test
        @DisplayName("5.4 同日重复签到，返回 SignInResultVO: success=false（不抛异常）")
        void duplicateSignInSameDayReturnsFailureResult() {
            Long userId = 1L;
            User user = buildUser(userId, 100);
            when(userMapper.selectById(userId)).thenReturn(user);

            UserSign todaySign = new UserSign();
            todaySign.setId(1L);
            todaySign.setUserId(userId);
            todaySign.setSignDate(LocalDate.now());
            todaySign.setContinuousDays(3);
            todaySign.setPointsEarned(10);

            when(userSignMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(todaySign);

            SignInResultVO result = signInService.signIn(userId);

            assertNotNull(result);
            assertFalse(result.getSuccess());
            assertEquals("今日已签到，请明天再来", result.getMessage());
            assertTrue(result.getHasSignedToday());
            assertEquals(3, result.getContinuousDays());
            assertEquals(100, result.getCurrentPoints());

            verify(userSignMapper, never()).insert(any(UserSign.class));
            verify(pointsService, never()).addPointsIdempotent(anyLong(), anyInt(), any(), anyString(), anyString());
        }
    }

    @Nested
    @DisplayName("hasSignedToday")
    class HasSignedToday {

        @Test
        @DisplayName("5.3 已有今日签到记录时返回 true")
        void returnsTrueWhenRecordExists() {
            when(userSignMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);
            assertTrue(signInService.hasSignedToday(1L));
        }

        @Test
        @DisplayName("没有今日签到记录时返回 false")
        void returnsFalseWhenNoRecord() {
            when(userSignMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
            assertFalse(signInService.hasSignedToday(1L));
        }
    }

    @Nested
    @DisplayName("getContinuousDays")
    class GetContinuousDays {

        @Test
        @DisplayName("从未签到时返回 0")
        void returnsZeroWhenNeverSigned() {
            when(userSignMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);
            assertEquals(0, signInService.getContinuousDays(1L));
        }

        @Test
        @DisplayName("今日签到过时返回当前连续天数")
        void returnsContinuousDaysWhenSignedToday() {
            UserSign todaySign = new UserSign();
            todaySign.setId(1L);
            todaySign.setUserId(1L);
            todaySign.setSignDate(LocalDate.now());
            todaySign.setContinuousDays(5);
            todaySign.setPointsEarned(10);
            when(userSignMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(todaySign);
            assertEquals(5, signInService.getContinuousDays(1L));
        }
    }
}
