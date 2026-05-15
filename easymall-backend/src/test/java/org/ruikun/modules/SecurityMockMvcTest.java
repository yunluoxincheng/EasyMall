package org.ruikun.modules;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ruikun.BaseSpringBootTest;
import org.ruikun.infrastructure.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Security MockMvc 集成测试")
class SecurityMockMvcTest extends BaseSpringBootTest {

    @Autowired
    private WebApplicationContext wac;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> valueOps = mock(ValueOperations.class);

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOps);
    }

    @Test
    @DisplayName("9.6.1 未认证访问受保护接口 -> 401 UNAUTHORIZED")
    void unauthenticatedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/cart/list"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("9.6.2 普通用户访问 /api/admin/** -> 403 FORBIDDEN")
    void userAccessingAdminEndpointReturns403() throws Exception {
        String token = jwtUtil.generateToken("testuser", 100L, 0);
        when(valueOps.get("login:100")).thenReturn(token);

        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }
}
