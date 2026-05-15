package org.ruikun.modules.user.controller;

import com.alibaba.fastjson2.JSON;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.common.ResponseCode;
import org.ruikun.infrastructure.TraceIdUtil;
import org.ruikun.infrastructure.security.JwtUtil;
import org.ruikun.modules.user.dto.UserLoginDTO;
import org.ruikun.modules.user.dto.UserRegisterDTO;
import org.ruikun.modules.user.service.IUserService;
import org.ruikun.modules.user.vo.LoginVO;
import org.ruikun.modules.user.vo.UserVO;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController 单元测试")
class UserControllerTest {

    private MockMvc mockMvc;
    private IUserService userService;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        userService = mock(IUserService.class);
        jwtUtil = mock(JwtUtil.class);
        UserController controller = new UserController(userService, jwtUtil);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @AfterEach
    void tearDown() {
        TraceIdUtil.clear();
    }

    private LoginVO createLoginVO() {
        LoginVO vo = new LoginVO();
        vo.setUserId(100L);
        vo.setUsername("testuser");
        vo.setNickname("测试用户");
        vo.setToken("mock-jwt-token-abc123");
        vo.setAvatar("https://example.com/avatar.png");
        vo.setRole(0);
        return vo;
    }

    private UserVO createUserVO() {
        UserVO vo = new UserVO();
        vo.setId(100L);
        vo.setUsername("testuser");
        vo.setNickname("测试用户");
        vo.setPhone("13800138000");
        vo.setEmail("test@example.com");
        vo.setRole(0);
        vo.setStatus(1);
        vo.setPoints(500);
        vo.setLevel(1);
        vo.setCreateTime(LocalDateTime.of(2024, 1, 1, 10, 0, 0));
        return vo;
    }

    private UserLoginDTO createLoginDTO() {
        UserLoginDTO dto = new UserLoginDTO();
        dto.setUsername("testuser");
        dto.setPassword("password123");
        return dto;
    }

    private UserRegisterDTO createRegisterDTO() {
        UserRegisterDTO dto = new UserRegisterDTO();
        dto.setUsername("newuser");
        dto.setPassword("password123");
        dto.setConfirmPassword("password123");
        dto.setNickname("新用户");
        dto.setPhone("13900139000");
        dto.setEmail("newuser@example.com");
        return dto;
    }

    @Nested
    @DisplayName("POST /api/user/login")
    class LoginEndpoint {

        @Test
        @DisplayName("9.2.1 使用有效凭据登录，返回 LoginVO")
        void loginWithValidCredentials() throws Exception {
            LoginVO loginVO = createLoginVO();
            when(userService.login(any(UserLoginDTO.class))).thenReturn(loginVO);

            mockMvc.perform(post("/api/user/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(JSON.toJSONString(createLoginDTO())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.code").value(ResponseCode.LOGIN_SUCCESS.getCode()))
                    .andExpect(jsonPath("$.data.token").value("mock-jwt-token-abc123"))
                    .andExpect(jsonPath("$.data.userId").value(100))
                    .andExpect(jsonPath("$.data.username").value("testuser"));
        }
    }

    @Nested
    @DisplayName("POST /api/user/register")
    class RegisterEndpoint {

        @Test
        @DisplayName("9.2.2 使用有效数据注册，返回成功")
        void registerWithValidData() throws Exception {
            doNothing().when(userService).register(any(UserRegisterDTO.class));

            mockMvc.perform(post("/api/user/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(JSON.toJSONString(createRegisterDTO())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.code").value(ResponseCode.REGISTER_SUCCESS.getCode()));
        }
    }

    @Nested
    @DisplayName("GET /api/user/info")
    class GetUserInfoEndpoint {

        @Test
        @DisplayName("9.2.3 携带 userId 属性，返回 UserVO")
        void getUserInfoWithUserIdAttribute() throws Exception {
            UserVO userVO = createUserVO();
            when(userService.getUserInfo(100L)).thenReturn(userVO);

            mockMvc.perform(get("/api/user/info")
                            .requestAttr("userId", 100L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(100))
                    .andExpect(jsonPath("$.data.username").value("testuser"))
                    .andExpect(jsonPath("$.data.points").value(500));
        }

        @Test
        @DisplayName("9.2.4 未携带 userId 属性，返回未授权错误")
        void getUserInfoWithoutUserIdAttribute() throws Exception {
            mockMvc.perform(get("/api/user/info"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.code").value(ResponseCode.UNAUTHORIZED.getCode()));
        }
    }
}
