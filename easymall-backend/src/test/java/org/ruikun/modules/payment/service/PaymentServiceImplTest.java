package org.ruikun.modules.payment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.builder.MapperBuilderAssistant;
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
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.OrderStatus;
import org.ruikun.enums.PaymentStatus;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.inventory.service.IInventoryService;
import org.ruikun.modules.order.entity.Order;
import org.ruikun.modules.order.entity.OrderItem;
import org.ruikun.modules.order.mapper.OrderItemMapper;
import org.ruikun.modules.order.mapper.OrderMapper;
import org.ruikun.modules.order.service.OrderStateMachine;
import org.ruikun.modules.payment.entity.PaymentCallbackLog;
import org.ruikun.modules.payment.entity.PaymentOrder;
import org.ruikun.modules.payment.mapper.PaymentOrderMapper;
import org.ruikun.modules.payment.vo.PaymentVO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @BeforeAll
    static void initMybatisPlusLambdaCache() {
        Configuration configuration = new Configuration();

        MapperBuilderAssistant assistant1 = new MapperBuilderAssistant(configuration, "");
        assistant1.setCurrentNamespace("org.ruikun.modules.payment.mapper.PaymentOrderMapper");
        TableInfoHelper.initTableInfo(assistant1, PaymentOrder.class);

        MapperBuilderAssistant assistant2 = new MapperBuilderAssistant(configuration, "");
        assistant2.setCurrentNamespace("org.ruikun.modules.payment.mapper.PaymentCallbackLogMapper");
        TableInfoHelper.initTableInfo(assistant2, PaymentCallbackLog.class);
    }

    @Mock
    private IPaymentService self;

    @Mock
    private PaymentOrderMapper paymentOrderMapper;

    @Mock
    private IPaymentCallbackLogService paymentCallbackLogService;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderItemMapper orderItemMapper;

    @Mock
    private OrderStateMachine orderStateMachine;

    @Mock
    private IInventoryService inventoryService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Captor
    private ArgumentCaptor<PaymentOrder> paymentOrderCaptor;

    @BeforeEach
    void injectSelf() throws Exception {
        var field = PaymentServiceImpl.class.getDeclaredField("self");
        field.setAccessible(true);
        field.set(paymentService, self);
    }

    private PaymentOrder createPaymentOrder(Long id, String paymentNo, Long orderId, String orderNo,
                                             Long userId, BigDecimal amount, String status) {
        PaymentOrder po = new PaymentOrder();
        po.setId(id);
        po.setPaymentNo(paymentNo);
        po.setOrderId(orderId);
        po.setOrderNo(orderNo);
        po.setUserId(userId);
        po.setAmount(amount);
        po.setChannel("MOCK");
        po.setStatus(status);
        return po;
    }

    private Order createOrder(Long id, String orderNo, Long userId, Integer status, BigDecimal payAmount) {
        Order order = new Order();
        order.setId(id);
        order.setOrderNo(orderNo);
        order.setUserId(userId);
        order.setStatus(status);
        order.setPayAmount(payAmount);
        return order;
    }

    private OrderItem createOrderItem(Long productId, Integer quantity) {
        OrderItem item = new OrderItem();
        item.setProductId(productId);
        item.setQuantity(quantity);
        return item;
    }

    // ========== 6.1 订单创建后自动生成支付单 ==========

    @Nested
    @DisplayName("createPayment - 创建支付单")
    class CreatePayment {

        @Test
        @DisplayName("6.1 订单创建后自动生成支付单")
        void createPaymentSuccess() {
            when(paymentOrderMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);
            when(paymentOrderMapper.insert(any(PaymentOrder.class))).thenReturn(1);

            PaymentOrder result = paymentService.createPayment(1L, "ORD123", 100L, new BigDecimal("199.00"));

            verify(paymentOrderMapper).insert(paymentOrderCaptor.capture());
            PaymentOrder captured = paymentOrderCaptor.getValue();
            assertEquals(1L, captured.getOrderId());
            assertEquals("ORD123", captured.getOrderNo());
            assertEquals(100L, captured.getUserId());
            assertEquals(0, new BigDecimal("199.00").compareTo(captured.getAmount()));
            assertEquals(PaymentStatus.WAITING_PAY.getCode(), captured.getStatus());
            assertEquals("MOCK", captured.getChannel());
            assertTrue(captured.getPaymentNo().startsWith("PAY"));
            assertNotNull(result);
        }

        @Test
        @DisplayName("已有活跃支付单时不创建新支付单")
        void createPaymentAlreadyActive() {
            PaymentOrder existing = createPaymentOrder(1L, "PAY123", 1L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.WAITING_PAY.getCode());
            when(paymentOrderMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(1L);
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(existing);

            PaymentOrder result = paymentService.createPayment(1L, "ORD123", 100L, new BigDecimal("199.00"));

            verify(paymentOrderMapper, never()).insert(any(PaymentOrder.class));
            assertEquals("PAY123", result.getPaymentNo());
        }
    }

    // ========== 6.2 正常模拟支付流程 ==========

    @Nested
    @DisplayName("pay - 模拟支付发起")
    class Pay {

        @Test
        @DisplayName("6.2 正常模拟支付流程（CAS 更新为 PAYING → 通过代理调用回调处理）")
        void paySuccess() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.WAITING_PAY.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);
            // CAS WAITING_PAY → PAYING 成功
            when(paymentOrderMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(1);
            doNothing().when(self).processCallback("PAY123", new BigDecimal("199.00"), "MOCK");

            // 重新查询返回 PAYING 状态
            PaymentOrder payingPO = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.PAYING.getCode());
            when(paymentOrderMapper.selectById(1L)).thenReturn(payingPO);

            PaymentVO result = paymentService.pay("PAY123", 100L);

            // 验证 CAS 更新
            verify(paymentOrderMapper).update(isNull(), any(LambdaUpdateWrapper.class));
            // 验证通过代理调用 processCallback
            verify(self).processCallback("PAY123", new BigDecimal("199.00"), "MOCK");
            assertNotNull(result);
        }

        @Test
        @DisplayName("pay CAS 失败且已支付时抛出 PAYMENT_ALREADY_PAID")
        void payCasFailAlreadyPaid() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.WAITING_PAY.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);
            // CAS 失败
            when(paymentOrderMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(0);
            // 重查返回 PAID
            PaymentOrder paidPO = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.PAID.getCode());
            when(paymentOrderMapper.selectById(1L)).thenReturn(paidPO);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.pay("PAY123", 100L));
            assertEquals(ResponseCode.PAYMENT_ALREADY_PAID, ex.getResponseCode());
        }

        @Test
        @DisplayName("pay CAS 失败且状态非 PAID 时抛出 PAYMENT_STATUS_INVALID")
        void payCasFailStatusInvalid() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.WAITING_PAY.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);
            when(paymentOrderMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(0);
            // 重查返回 CLOSED
            PaymentOrder closedPO = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.CLOSED.getCode());
            when(paymentOrderMapper.selectById(1L)).thenReturn(closedPO);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.pay("PAY123", 100L));
            assertEquals(ResponseCode.PAYMENT_STATUS_INVALID, ex.getResponseCode());
        }

        @Test
        @DisplayName("支付单不存在时抛出异常")
        void payNotFound() {
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.pay("NONEXIST", 100L));
            assertEquals(ResponseCode.PAYMENT_NOT_FOUND, ex.getResponseCode());
        }

        @Test
        @DisplayName("支付单不属于当前用户时抛出异常")
        void payNotOwner() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 200L, new BigDecimal("199.00"), PaymentStatus.WAITING_PAY.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.pay("PAY123", 100L));
            assertEquals(ResponseCode.PAYMENT_NOT_FOUND, ex.getResponseCode());
        }

        @Test
        @DisplayName("6.7 已支付支付单不能再次发起支付")
        void payAlreadyPaid() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.PAID.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.pay("PAY123", 100L));
            assertEquals(ResponseCode.PAYMENT_ALREADY_PAID, ex.getResponseCode());
        }
    }

    // ========== 6.3 重复支付回调幂等 ==========

    @Nested
    @DisplayName("processCallback - 回调处理")
    class ProcessCallback {

        @Test
        @DisplayName("6.3 重复支付回调幂等（第二次回调直接返回成功，不重复确认库存）")
        void idempotentCallback() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.PAID.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);
            when(paymentCallbackLogService.saveLog(anyString(), anyString(), anyString(), eq("RECEIVED"))).thenReturn(1L);

            paymentService.processCallback("PAY123", new BigDecimal("199.00"), "MOCK");

            // 幂等返回，不更新支付单，不触发订单状态变更，不确认库存
            verify(paymentOrderMapper, never()).update(isNull(), any(LambdaUpdateWrapper.class));
            verify(orderStateMachine, never()).transit(any(), any());
            verify(inventoryService, never()).confirmSoldStock(anyLong(), anyInt(), anyLong());
            verify(paymentCallbackLogService).updateResult(1L, "IDEMPOTENT_SUCCESS");
        }

        @Test
        @DisplayName("6.4 金额不一致回调被拒绝")
        void amountMismatch() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.PAYING.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);
            when(paymentCallbackLogService.saveLog(anyString(), anyString(), anyString(), eq("RECEIVED"))).thenReturn(1L);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.processCallback("PAY123", new BigDecimal("100.00"), "MOCK"));
            assertEquals(ResponseCode.PAYMENT_AMOUNT_MISMATCH, ex.getResponseCode());
            verify(paymentCallbackLogService).updateResult(1L, "AMOUNT_MISMATCH");
        }

        @Test
        @DisplayName("6.5 不存在的支付单号回调被拒绝")
        void paymentNotFound() {
            when(paymentCallbackLogService.saveLog(anyString(), anyString(), anyString(), eq("RECEIVED"))).thenReturn(1L);
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.processCallback("NONEXIST", new BigDecimal("199.00"), "MOCK"));
            assertEquals(ResponseCode.PAYMENT_NOT_FOUND, ex.getResponseCode());
            verify(paymentCallbackLogService).updateResult(1L, "PAYMENT_NOT_FOUND");
        }

        @Test
        @DisplayName("回调时支付单状态不是 PAYING 被拒绝")
        void statusInvalid() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.WAITING_PAY.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);
            when(paymentCallbackLogService.saveLog(anyString(), anyString(), anyString(), eq("RECEIVED"))).thenReturn(1L);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.processCallback("PAY123", new BigDecimal("199.00"), "MOCK"));
            assertEquals(ResponseCode.PAYMENT_STATUS_INVALID, ex.getResponseCode());
            verify(paymentCallbackLogService).updateResult(1L, "STATUS_INVALID");
        }

        @Test
        @DisplayName("正常回调处理流程")
        void normalCallbackSuccess() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.PAYING.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);
            when(paymentCallbackLogService.saveLog(anyString(), anyString(), anyString(), eq("RECEIVED"))).thenReturn(1L);

            // CAS 更新成功
            when(paymentOrderMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(1);

            Order order = createOrder(10L, "ORD123", 100L, OrderStatus.PENDING_PAYMENT.getCode(), new BigDecimal("199.00"));
            when(orderMapper.selectById(10L)).thenReturn(order);
            when(orderMapper.updateById(any(Order.class))).thenReturn(1);

            OrderItem item = createOrderItem(5L, 2);
            when(orderItemMapper.getOrderItemsByOrderId(10L)).thenReturn(List.of(item));

            paymentService.processCallback("PAY123", new BigDecimal("199.00"), "MOCK");

            verify(orderStateMachine).transit(order, OrderStatus.PAID);
            verify(inventoryService).confirmSoldStock(5L, 2, 10L);
            verify(paymentCallbackLogService).updateResult(1L, "SUCCESS");
        }

        @Test
        @DisplayName("CAS 失败且重查为 PAID 时走幂等路径")
        void casFailureIdempotent() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.PAYING.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);
            when(paymentCallbackLogService.saveLog(anyString(), anyString(), anyString(), eq("RECEIVED"))).thenReturn(1L);

            // CAS 更新失败（返回 0）
            when(paymentOrderMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(0);

            // 重查返回 PAID
            PaymentOrder paidPO = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.PAID.getCode());
            when(paymentOrderMapper.selectById(1L)).thenReturn(paidPO);

            paymentService.processCallback("PAY123", new BigDecimal("199.00"), "MOCK");

            verify(orderStateMachine, never()).transit(any(), any());
            verify(inventoryService, never()).confirmSoldStock(anyLong(), anyInt(), anyLong());
            verify(paymentCallbackLogService).updateResult(1L, "IDEMPOTENT_SUCCESS");
        }

        @Test
        @DisplayName("CAS 失败且重查为 CLOSED 时抛出 STATUS_INVALID")
        void casFailureStatusInvalid() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.PAYING.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);
            when(paymentCallbackLogService.saveLog(anyString(), anyString(), anyString(), eq("RECEIVED"))).thenReturn(1L);

            // CAS 更新失败
            when(paymentOrderMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(0);

            // 重查返回 CLOSED
            PaymentOrder closedPO = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.CLOSED.getCode());
            when(paymentOrderMapper.selectById(1L)).thenReturn(closedPO);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.processCallback("PAY123", new BigDecimal("199.00"), "MOCK"));
            assertEquals(ResponseCode.PAYMENT_STATUS_INVALID, ex.getResponseCode());
            verify(paymentCallbackLogService).updateResult(1L, "STATUS_INVALID");
        }
    }

    // ========== 6.6 取消订单时支付单关闭 ==========

    @Nested
    @DisplayName("closeByOrderId - 关闭支付单")
    class CloseByOrderId {

        @Test
        @DisplayName("6.6 取消订单时支付单关闭")
        void closeByOrderId() {
            when(paymentOrderMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(1);

            paymentService.closeByOrderId(10L);

            verify(paymentOrderMapper).update(isNull(), any(LambdaUpdateWrapper.class));
        }
    }

    // ========== 6.8 查询订单支付信息接口 ==========

    @Nested
    @DisplayName("getByOrderId - 根据订单ID查询支付信息")
    class GetByOrderId {

        @Test
        @DisplayName("6.8 查询订单支付信息接口")
        void getByOrderIdSuccess() {
            Order order = createOrder(10L, "ORD123", 100L, OrderStatus.PENDING_PAYMENT.getCode(), new BigDecimal("199.00"));
            when(orderMapper.selectById(10L)).thenReturn(order);

            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.WAITING_PAY.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);

            PaymentVO result = paymentService.getByOrderId(10L, 100L);

            assertNotNull(result);
            assertEquals("PAY123", result.getPaymentNo());
            assertEquals(0, new BigDecimal("199.00").compareTo(result.getAmount()));
            assertEquals(PaymentStatus.WAITING_PAY.getCode(), result.getStatus());
        }

        @Test
        @DisplayName("订单不存在时抛出异常")
        void orderNotFound() {
            when(orderMapper.selectById(999L)).thenReturn(null);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.getByOrderId(999L, 100L));
            assertEquals(ResponseCode.ORDER_NOT_FOUND, ex.getResponseCode());
        }

        @Test
        @DisplayName("订单无支付信息时抛出异常")
        void noPaymentFound() {
            Order order = createOrder(10L, "ORD123", 100L, OrderStatus.PENDING_PAYMENT.getCode(), new BigDecimal("199.00"));
            when(orderMapper.selectById(10L)).thenReturn(order);
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.getByOrderId(10L, 100L));
            assertEquals(ResponseCode.PAYMENT_NOT_FOUND, ex.getResponseCode());
        }
    }

    @Nested
    @DisplayName("getByPaymentNo - 根据支付单号查询")
    class GetByPaymentNo {

        @Test
        @DisplayName("查询存在的支付单")
        void getByPaymentNoSuccess() {
            PaymentOrder po = createPaymentOrder(1L, "PAY123", 10L, "ORD123", 100L, new BigDecimal("199.00"), PaymentStatus.WAITING_PAY.getCode());
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);

            PaymentVO result = paymentService.getByPaymentNo("PAY123", 100L);

            assertNotNull(result);
            assertEquals("PAY123", result.getPaymentNo());
        }

        @Test
        @DisplayName("支付单不存在时抛出异常")
        void getByPaymentNoNotFound() {
            when(paymentOrderMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> paymentService.getByPaymentNo("NONEXIST", 100L));
            assertEquals(ResponseCode.PAYMENT_NOT_FOUND, ex.getResponseCode());
        }
    }
}
