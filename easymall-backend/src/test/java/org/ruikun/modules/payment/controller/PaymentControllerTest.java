package org.ruikun.modules.payment.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.ruikun.common.ResponseCode;
import org.ruikun.common.Result;
import org.ruikun.infrastructure.security.JwtUtil;
import org.ruikun.modules.payment.dto.PaymentCallbackDTO;
import org.ruikun.modules.payment.service.IPaymentService;
import org.ruikun.modules.payment.vo.PaymentVO;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PaymentControllerTest {

    private PaymentController controller;
    private IPaymentService paymentService;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        paymentService = mock(IPaymentService.class);
        jwtUtil = mock(JwtUtil.class);
        controller = new PaymentController(paymentService, jwtUtil);
        // 通过反射设置 mockSignature 字段
        try {
            var field = PaymentController.class.getDeclaredField("mockSignature");
            field.setAccessible(true);
            field.set(controller, "easymall-mock-signature-2024");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private PaymentVO createPaymentVO() {
        PaymentVO vo = new PaymentVO();
        vo.setPaymentNo("PAY123");
        vo.setOrderId(10L);
        vo.setAmount(new BigDecimal("199.00"));
        vo.setStatus("PAID");
        return vo;
    }

    @Nested
    @DisplayName("POST /api/payment/callback - 回调端点")
    class CallbackEndpoint {

        @Test
        @DisplayName("6.11 携带正确签名正常处理")
        void callbackWithValidSignature() {
            PaymentCallbackDTO dto = new PaymentCallbackDTO();
            dto.setPaymentNo("PAY123");
            dto.setAmount(new BigDecimal("199.00"));
            dto.setChannel("MOCK");

            doNothing().when(paymentService).processCallback(anyString(), any(BigDecimal.class), anyString());

            Result<?> result = controller.callback(dto, "easymall-mock-signature-2024");

            assertTrue(result.getSuccess());
            verify(paymentService).processCallback("PAY123", new BigDecimal("199.00"), "MOCK");
        }

        @Test
        @DisplayName("6.10 缺少签名返回 FORBIDDEN")
        void callbackWithoutSignature() {
            PaymentCallbackDTO dto = new PaymentCallbackDTO();
            dto.setPaymentNo("PAY123");
            dto.setAmount(new BigDecimal("199.00"));
            dto.setChannel("MOCK");

            Result<?> result = controller.callback(dto, null);

            assertFalse(result.getSuccess());
            assertEquals(ResponseCode.FORBIDDEN.getCode(), result.getCode());
            verify(paymentService, never()).processCallback(anyString(), any(BigDecimal.class), anyString());
        }

        @Test
        @DisplayName("错误签名返回 FORBIDDEN")
        void callbackWithWrongSignature() {
            PaymentCallbackDTO dto = new PaymentCallbackDTO();
            dto.setPaymentNo("PAY123");
            dto.setAmount(new BigDecimal("199.00"));
            dto.setChannel("MOCK");

            Result<?> result = controller.callback(dto, "wrong-signature");

            assertFalse(result.getSuccess());
            assertEquals(ResponseCode.FORBIDDEN.getCode(), result.getCode());
            verify(paymentService, never()).processCallback(anyString(), any(BigDecimal.class), anyString());
        }
    }

    @Nested
    @DisplayName("MockMvc endpoints")
    class MockMvcEndpoints {

        private MockMvc mockMvc;

        @BeforeEach
        void setUp() {
            mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        }

        @Test
        @DisplayName("POST /{paymentNo}/pay returns PaymentVO")
        void payReturnsPaymentVO() throws Exception {
            when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(100L);
            PaymentVO vo = createPaymentVO();
            when(paymentService.pay("PAY123", 100L)).thenReturn(vo);

            mockMvc.perform(post("/api/payment/PAY123/pay")
                            .header("Authorization", "Bearer test-token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.paymentNo").value("PAY123"));
        }

        @Test
        @DisplayName("POST /callback with valid signature")
        void callbackWithValidSignature() throws Exception {
            doNothing().when(paymentService).processCallback(eq("PAY123"), any(BigDecimal.class), anyString());

            mockMvc.perform(post("/api/payment/callback")
                            .header("X-Mock-Signature", "easymall-mock-signature-2024")
                            .contentType("application/json")
                            .content("{\"paymentNo\":\"PAY123\",\"amount\":199.00,\"channel\":\"MOCK\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("POST /callback without signature returns FORBIDDEN")
        void callbackWithoutSignature() throws Exception {
            mockMvc.perform(post("/api/payment/callback")
                            .contentType("application/json")
                            .content("{\"paymentNo\":\"PAY123\",\"amount\":199.00,\"channel\":\"MOCK\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        }

        @Test
        @DisplayName("GET /{paymentNo} returns PaymentVO")
        void getByPaymentNoReturnsPaymentVO() throws Exception {
            when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(100L);
            PaymentVO vo = createPaymentVO();
            when(paymentService.getByPaymentNo("PAY123", 100L)).thenReturn(vo);

            mockMvc.perform(get("/api/payment/PAY123")
                            .header("Authorization", "Bearer test-token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.paymentNo").value("PAY123"));
        }
    }
}
