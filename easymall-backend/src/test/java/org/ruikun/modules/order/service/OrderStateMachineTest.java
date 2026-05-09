package org.ruikun.modules.order.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.OrderStatus;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.order.entity.Order;

import static org.junit.jupiter.api.Assertions.*;

class OrderStateMachineTest {

    private final OrderStateMachine stateMachine = new OrderStateMachine();

    private Order createOrder(OrderStatus status) {
        Order order = new Order();
        order.setId(1L);
        order.setStatus(status.getCode());
        return order;
    }

    @Nested
    @DisplayName("canTransit - 合法转换")
    class CanTransitValid {

        @Test
        @DisplayName("PENDING_PAYMENT → PAID")
        void pendingToPaid() {
            assertTrue(stateMachine.canTransit(OrderStatus.PENDING_PAYMENT, OrderStatus.PAID));
        }

        @Test
        @DisplayName("PENDING_PAYMENT → CANCELLED")
        void pendingToCancelled() {
            assertTrue(stateMachine.canTransit(OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED));
        }

        @Test
        @DisplayName("PAID → WAITING_SHIPMENT")
        void paidToWaitingShipment() {
            assertTrue(stateMachine.canTransit(OrderStatus.PAID, OrderStatus.WAITING_SHIPMENT));
        }

        @Test
        @DisplayName("PAID → CANCELLED")
        void paidToCancelled() {
            assertTrue(stateMachine.canTransit(OrderStatus.PAID, OrderStatus.CANCELLED));
        }

        @Test
        @DisplayName("PAID → REFUNDING")
        void paidToRefunding() {
            assertTrue(stateMachine.canTransit(OrderStatus.PAID, OrderStatus.REFUNDING));
        }

        @Test
        @DisplayName("WAITING_SHIPMENT → SHIPPED")
        void waitingShipmentToShipped() {
            assertTrue(stateMachine.canTransit(OrderStatus.WAITING_SHIPMENT, OrderStatus.SHIPPED));
        }

        @Test
        @DisplayName("WAITING_SHIPMENT → CANCELLED")
        void waitingShipmentToCancelled() {
            assertTrue(stateMachine.canTransit(OrderStatus.WAITING_SHIPMENT, OrderStatus.CANCELLED));
        }

        @Test
        @DisplayName("WAITING_SHIPMENT → REFUNDING")
        void waitingShipmentToRefunding() {
            assertTrue(stateMachine.canTransit(OrderStatus.WAITING_SHIPMENT, OrderStatus.REFUNDING));
        }

        @Test
        @DisplayName("SHIPPED → COMPLETED")
        void shippedToCompleted() {
            assertTrue(stateMachine.canTransit(OrderStatus.SHIPPED, OrderStatus.COMPLETED));
        }

        @Test
        @DisplayName("SHIPPED → REFUNDING")
        void shippedToRefunding() {
            assertTrue(stateMachine.canTransit(OrderStatus.SHIPPED, OrderStatus.REFUNDING));
        }

        @Test
        @DisplayName("COMPLETED → REFUNDING")
        void completedToRefunding() {
            assertTrue(stateMachine.canTransit(OrderStatus.COMPLETED, OrderStatus.REFUNDING));
        }

        @Test
        @DisplayName("REFUNDING → REFUNDED")
        void refundingToRefunded() {
            assertTrue(stateMachine.canTransit(OrderStatus.REFUNDING, OrderStatus.REFUNDED));
        }

        @Test
        @DisplayName("REFUNDING → CANCELLED")
        void refundingToCancelled() {
            assertTrue(stateMachine.canTransit(OrderStatus.REFUNDING, OrderStatus.CANCELLED));
        }
    }

    @Nested
    @DisplayName("canTransit - 非法转换")
    class CanTransitInvalid {

        @Test
        @DisplayName("PENDING_PAYMENT → SHIPPED 跳过中间状态")
        void pendingToShipped() {
            assertFalse(stateMachine.canTransit(OrderStatus.PENDING_PAYMENT, OrderStatus.SHIPPED));
        }

        @Test
        @DisplayName("PAID → SHIPPED 必须经过 WAITING_SHIPMENT")
        void paidToShipped() {
            assertFalse(stateMachine.canTransit(OrderStatus.PAID, OrderStatus.SHIPPED));
        }

        @Test
        @DisplayName("PENDING_PAYMENT → COMPLETED 跳过中间状态")
        void pendingToCompleted() {
            assertFalse(stateMachine.canTransit(OrderStatus.PENDING_PAYMENT, OrderStatus.COMPLETED));
        }

        @Test
        @DisplayName("CANCELLED → PAID 终态不可转换")
        void cancelledToPaid() {
            assertFalse(stateMachine.canTransit(OrderStatus.CANCELLED, OrderStatus.PAID));
        }

        @Test
        @DisplayName("CANCELLED → 任意状态 终态不可转换")
        void cancelledToAny() {
            for (OrderStatus target : OrderStatus.values()) {
                assertFalse(stateMachine.canTransit(OrderStatus.CANCELLED, target));
            }
        }

        @Test
        @DisplayName("REFUNDED → 任意状态 终态不可转换")
        void refundedToAny() {
            for (OrderStatus target : OrderStatus.values()) {
                assertFalse(stateMachine.canTransit(OrderStatus.REFUNDED, target));
            }
        }

        @Test
        @DisplayName("相同状态转换不允许 - PAID → PAID")
        void sameStatus() {
            assertFalse(stateMachine.canTransit(OrderStatus.PAID, OrderStatus.PAID));
        }
    }

    @Nested
    @DisplayName("transit - 合法转换设置目标状态")
    class TransitValid {

        @Test
        @DisplayName("PENDING_PAYMENT → PAID 设置状态码为 1")
        void pendingToPaid() {
            Order order = createOrder(OrderStatus.PENDING_PAYMENT);
            stateMachine.transit(order, OrderStatus.PAID);
            assertEquals(OrderStatus.PAID.getCode(), order.getStatus());
        }

        @Test
        @DisplayName("PAID → WAITING_SHIPMENT 设置状态码为 5")
        void paidToWaitingShipment() {
            Order order = createOrder(OrderStatus.PAID);
            stateMachine.transit(order, OrderStatus.WAITING_SHIPMENT);
            assertEquals(OrderStatus.WAITING_SHIPMENT.getCode(), order.getStatus());
        }

        @Test
        @DisplayName("WAITING_SHIPMENT → SHIPPED 设置状态码为 2")
        void waitingShipmentToShipped() {
            Order order = createOrder(OrderStatus.WAITING_SHIPMENT);
            stateMachine.transit(order, OrderStatus.SHIPPED);
            assertEquals(OrderStatus.SHIPPED.getCode(), order.getStatus());
        }
    }

    @Nested
    @DisplayName("transit - 非法转换抛 BusinessException")
    class TransitInvalid {

        @Test
        @DisplayName("非法转换抛出异常，错误码为 ORDER_STATUS_TRANSITION_INVALID")
        void invalidTransition() {
            Order order = createOrder(OrderStatus.PAID);
            BusinessException ex = assertThrows(BusinessException.class,
                    () -> stateMachine.transit(order, OrderStatus.SHIPPED));
            assertEquals(ResponseCode.ORDER_STATUS_TRANSITION_INVALID, ex.getResponseCode());
        }

        @Test
        @DisplayName("错误信息包含当前状态和目标状态的中文描述")
        void errorMessageContainsDescriptions() {
            Order order = createOrder(OrderStatus.PAID);
            BusinessException ex = assertThrows(BusinessException.class,
                    () -> stateMachine.transit(order, OrderStatus.SHIPPED));
            assertTrue(ex.getMessage().contains("已支付"));
            assertTrue(ex.getMessage().contains("已发货"));
        }
    }

    @Nested
    @DisplayName("终态不可转换")
    class TerminalState {

        @Test
        @DisplayName("CANCELLED 不可转换到任何状态")
        void cancelledCannotTransit() {
            for (OrderStatus target : OrderStatus.values()) {
                Order order = createOrder(OrderStatus.CANCELLED);
                assertThrows(BusinessException.class,
                        () -> stateMachine.transit(order, target));
            }
        }

        @Test
        @DisplayName("REFUNDED 不可转换到任何状态")
        void refundedCannotTransit() {
            for (OrderStatus target : OrderStatus.values()) {
                Order order = createOrder(OrderStatus.REFUNDED);
                assertThrows(BusinessException.class,
                        () -> stateMachine.transit(order, target));
            }
        }
    }

    @Nested
    @DisplayName("相同状态转换被拒绝")
    class SameStatusTransit {

        @Test
        @DisplayName("PAID → PAID 被拒绝")
        void sameStatusRejected() {
            Order order = createOrder(OrderStatus.PAID);
            assertThrows(BusinessException.class,
                    () -> stateMachine.transit(order, OrderStatus.PAID));
        }
    }

    @Nested
    @DisplayName("OrderStatus 枚举扩展验证")
    class OrderStatusEnum {

        @Test
        @DisplayName("fromCode(5) 返回 WAITING_SHIPMENT")
        void fromCode5() {
            assertEquals(OrderStatus.WAITING_SHIPMENT, OrderStatus.fromCode(5));
        }

        @Test
        @DisplayName("fromCode(6) 返回 REFUNDING")
        void fromCode6() {
            assertEquals(OrderStatus.REFUNDING, OrderStatus.fromCode(6));
        }

        @Test
        @DisplayName("fromCode(7) 返回 REFUNDED")
        void fromCode7() {
            assertEquals(OrderStatus.REFUNDED, OrderStatus.fromCode(7));
        }

        @Test
        @DisplayName("fromCode(99) 返回 null")
        void fromCodeInvalid() {
            assertNull(OrderStatus.fromCode(99));
        }

        @Test
        @DisplayName("getDescriptionByCode(5) 返回 '待发货'")
        void description5() {
            assertEquals("待发货", OrderStatus.getDescriptionByCode(5));
        }

        @Test
        @DisplayName("getDescriptionByCode(6) 返回 '退款中'")
        void description6() {
            assertEquals("退款中", OrderStatus.getDescriptionByCode(6));
        }

        @Test
        @DisplayName("getDescriptionByCode(7) 返回 '已退款'")
        void description7() {
            assertEquals("已退款", OrderStatus.getDescriptionByCode(7));
        }
    }
}
