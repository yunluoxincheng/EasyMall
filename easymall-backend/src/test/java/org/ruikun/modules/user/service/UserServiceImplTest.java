package org.ruikun.modules.user.service;

import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.common.ResponseCode;
import org.ruikun.exception.BusinessException;
import org.ruikun.infrastructure.security.JwtUtil;
import org.ruikun.modules.coupon.entity.CouponTemplate;
import org.ruikun.modules.coupon.mapper.CouponTemplateMapper;
import org.ruikun.modules.coupon.service.ICouponService;
import org.ruikun.modules.user.dto.UserLoginDTO;
import org.ruikun.modules.user.dto.UserRegisterDTO;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.user.mapper.UserMapper;
import org.ruikun.modules.user.vo.LoginVO;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl 单元测试")
class UserServiceImplTest {

    @BeforeAll
    static void initMybatisPlusLambdaCache() {
        Configuration configuration = new Configuration();

        MapperBuilderAssistant assistant1 = new MapperBuilderAssistant(configuration, "");
        assistant1.setCurrentNamespace("org.ruikun.modules.user.mapper.UserMapper");
        TableInfoHelper.initTableInfo(assistant1, User.class);

        MapperBuilderAssistant assistant2 = new MapperBuilderAssistant(configuration, "");
        assistant2.setCurrentNamespace("org.ruikun.modules.coupon.mapper.CouponTemplateMapper");
        TableInfoHelper.initTableInfo(assistant2, CouponTemplate.class);
    }

    @Mock
    private UserMapper userMapper;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ICouponService couponService;

    @Mock
    private CouponTemplateMapper couponTemplateMapper;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private UserServiceImpl userService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    private User createTestUser() {
        User user = new User();
        user.setId(100L);
        user.setUsername("testuser");
        user.setPassword("$2a$10$dummyhashedpasswordvaluehere");
        user.setNickname("测试用户");
        user.setPhone("13800000000");
        user.setEmail("test@example.com");
        user.setRole(0);
        user.setStatus(1);
        user.setPoints(100);
        user.setLevel(1);
        return user;
    }

    @Nested
    @DisplayName("login")
    class LoginTests {

        @Test
        @DisplayName("6.4 正确密码登录 -> 返回 LoginVO 含 JWT")
        void loginWithCorrectCredentials() {
            UserLoginDTO loginDTO = new UserLoginDTO();
            loginDTO.setUsername("testuser");
            loginDTO.setPassword("password123");
            User user = createTestUser();

            when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);

            try (MockedStatic<BCrypt> bcryptMock = mockStatic(BCrypt.class)) {
                bcryptMock.when(() -> BCrypt.checkpw(anyString(), anyString())).thenReturn(true);
                when(jwtUtil.generateToken(eq("testuser"), eq(100L), eq(0)))
                        .thenReturn("test-jwt-token-value");

                LoginVO result = userService.login(loginDTO);

                assertNotNull(result);
                assertEquals("test-jwt-token-value", result.getToken());
                assertEquals(100L, result.getUserId());
                assertEquals("testuser", result.getUsername());
                assertEquals("测试用户", result.getNickname());
                assertEquals(0, result.getRole());

                verify(jwtUtil).generateToken("testuser", 100L, 0);
                verify(valueOperations).set(eq("login:100"), eq("test-jwt-token-value"), eq(24L), eq(TimeUnit.HOURS));
            }
        }

        @Test
        @DisplayName("6.5 错误密码登录 -> 抛出 BusinessException(PASSWORD_ERROR)")
        void loginWithWrongPassword() {
            UserLoginDTO loginDTO = new UserLoginDTO();
            loginDTO.setUsername("testuser");
            loginDTO.setPassword("wrongpassword");
            User user = createTestUser();

            when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);

            try (MockedStatic<BCrypt> bcryptMock = mockStatic(BCrypt.class)) {
                bcryptMock.when(() -> BCrypt.checkpw(anyString(), anyString())).thenReturn(false);

                BusinessException ex = assertThrows(BusinessException.class,
                        () -> userService.login(loginDTO));

                assertEquals(ResponseCode.PASSWORD_ERROR, ex.getResponseCode());
                assertEquals("密码错误", ex.getMessage());
            }
        }
    }

    @Nested
    @DisplayName("register")
    class RegisterTests {

        @Test
        @DisplayName("6.2 有效注册数据 -> 用户创建成功，密码已哈希")
        void registerWithValidData() {
            UserRegisterDTO registerDTO = new UserRegisterDTO();
            registerDTO.setUsername("newuser");
            registerDTO.setPassword("password123");
            registerDTO.setConfirmPassword("password123");
            registerDTO.setNickname("新用户");
            registerDTO.setPhone("13900000000");
            registerDTO.setEmail("new@example.com");

            when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
            when(couponTemplateMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

            userService.register(registerDTO);

            verify(userMapper).insert(userCaptor.capture());
            User captured = userCaptor.getValue();
            assertEquals("newuser", captured.getUsername());
            assertNotEquals("password123", captured.getPassword());
            assertEquals("新用户", captured.getNickname());
            assertEquals(0, captured.getRole());
            assertEquals(1, captured.getStatus());
        }

        @Test
        @DisplayName("6.3 重复用户名 -> 抛出 BusinessException(USERNAME_EXISTS)")
        void registerWithDuplicateUsername() {
            UserRegisterDTO registerDTO = new UserRegisterDTO();
            registerDTO.setUsername("testuser");
            registerDTO.setPassword("password123");
            registerDTO.setConfirmPassword("password123");

            when(userMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> userService.register(registerDTO));

            assertEquals(ResponseCode.USERNAME_EXISTS, ex.getResponseCode());
            verify(userMapper, never()).insert(any(User.class));
        }
    }
}
