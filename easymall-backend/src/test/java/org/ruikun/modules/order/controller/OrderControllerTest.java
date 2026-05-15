package org.ruikun.modules.order.controller;

import com.alibaba.fastjson2.JSON;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.infrastructure.security.JwtUtil;
import org.ruikun.modules.order.dto.OrderCreateDTO;
import org.ruikun.modules.order.service.IOrderService;
import org.ruikun.modules.order.vo.OrderCreateVO;
import org.ruikun.modules.order.vo.OrderVO;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("OrderController MockMvc 测试")
class OrderControllerTest {

    private MockMvc mockMvc;
    private IOrderService orderService;
    private JwtUtil jwtUtil;

    private static final Long USER_ID = 100L;
    private static final Long ORDER_ID = 5L;
    private static final String AUTH_HEADER = "Bearer test-token";

    @BeforeEach
    void setUp() {
        orderService = mock(IOrderService.class);
        jwtUtil = mock(JwtUtil.class);
        OrderController controller = new OrderController(orderService, jwtUtil);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(USER_ID);
    }

    private OrderCreateDTO createOrderCreateDTO() {
        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setCartIds(List.of(1L, 2L));
        dto.setReceiverName("测试用户");
        dto.setReceiverPhone("13800138000");
        dto.setReceiverAddress("测试地址");
        return dto;
    }

    private OrderCreateVO createOrderCreateVO() {
        OrderCreateVO vo = new OrderCreateVO();
        vo.setOrderNo("ORD20240101001");
        vo.setPaymentNo("PAY20240101001");
        return vo;
    }

    private OrderVO createOrderVO() {
        OrderVO vo = new OrderVO();
        vo.setId(ORDER_ID);
        vo.setOrderNo("ORD20240101001");
        vo.setUserId(USER_ID);
        vo.setTotalAmount(new BigDecimal("299.00"));
        vo.setPayAmount(new BigDecimal("269.00"));
        vo.setStatus(1);
        vo.setStatusText("待支付");
        vo.setReceiverName("测试用户");
        vo.setReceiverPhone("13800138000");
        vo.setReceiverAddress("测试地址");
        vo.setCreateTime(LocalDateTime.of(2024, 1, 1, 10, 0, 0));
        return vo;
    }

    @Nested
    @DisplayName("POST /api/order/create")
    class CreateOrderTest {

        @Test
        @DisplayName("9.1.1 返回 OrderCreateVO，含订单号和支付号")
        void createOrderSuccessfully() throws Exception {
            OrderCreateVO responseVO = createOrderCreateVO();
            when(orderService.createOrder(eq(USER_ID), any(OrderCreateDTO.class))).thenReturn(responseVO);

            mockMvc.perform(post("/api/order/create")
                            .header("Authorization", AUTH_HEADER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(JSON.toJSONString(createOrderCreateDTO())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.orderNo").value("ORD20240101001"))
                    .andExpect(jsonPath("$.data.paymentNo").value("PAY20240101001"));
        }
    }

    @Nested
    @DisplayName("GET /api/order/page")
    class GetOrderPageTest {

        @Test
        @DisplayName("9.1.2 返回分页订单列表")
        void getOrderPageSuccessfully() throws Exception {
            PageResult<OrderVO> pageResult = new PageResult<>(1L, List.of(createOrderVO()), 1, 10);
            when(orderService.getOrderPage(eq(USER_ID), any(PageRequest.class))).thenReturn(pageResult);

            mockMvc.perform(get("/api/order/page")
                            .header("Authorization", AUTH_HEADER)
                            .param("pageNum", "1").param("pageSize", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.total").value(1))
                    .andExpect(jsonPath("$.data.records[0].id").value(ORDER_ID.intValue()));
        }
    }

    @Nested
    @DisplayName("GET /api/order/{orderId}")
    class GetOrderDetailTest {

        @Test
        @DisplayName("9.1.3 返回订单详情")
        void getOrderDetailSuccessfully() throws Exception {
            when(orderService.getOrderDetail(USER_ID, ORDER_ID)).thenReturn(createOrderVO());

            mockMvc.perform(get("/api/order/{orderId}", ORDER_ID)
                            .header("Authorization", AUTH_HEADER))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(ORDER_ID.intValue()))
                    .andExpect(jsonPath("$.data.status").value(1));
        }
    }

    @Nested
    @DisplayName("PUT /api/order/{orderId}/cancel")
    class CancelOrderTest {

        @Test
        @DisplayName("9.1.4 成功取消订单")
        void cancelOrderSuccessfully() throws Exception {
            doNothing().when(orderService).cancelOrder(USER_ID, ORDER_ID);

            mockMvc.perform(put("/api/order/{orderId}/cancel", ORDER_ID)
                            .header("Authorization", AUTH_HEADER))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").value("订单已取消"));
        }
    }

    @Nested
    @DisplayName("PUT /api/order/{orderId}/confirm")
    class ConfirmOrderTest {

        @Test
        @DisplayName("9.1.5 成功确认收货")
        void confirmOrderSuccessfully() throws Exception {
            doNothing().when(orderService).confirmOrder(USER_ID, ORDER_ID);

            mockMvc.perform(put("/api/order/{orderId}/confirm", ORDER_ID)
                            .header("Authorization", AUTH_HEADER))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").value("确认收货成功"));
        }
    }
}
