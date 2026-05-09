package org.ruikun.modules.order.service;

import org.ruikun.common.ResponseCode;
import org.ruikun.enums.OrderStatus;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.order.entity.Order;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

import static org.ruikun.enums.OrderStatus.*;

@Component
public class OrderStateMachine {

    private static final Map<OrderStatus, Set<OrderStatus>> TRANSITIONS;

    static {
        TRANSITIONS = new EnumMap<>(OrderStatus.class);
        TRANSITIONS.put(PENDING_PAYMENT, Set.of(PAID, CANCELLED));
        TRANSITIONS.put(PAID, Set.of(WAITING_SHIPMENT, CANCELLED, REFUNDING));
        TRANSITIONS.put(WAITING_SHIPMENT, Set.of(SHIPPED, CANCELLED, REFUNDING));
        TRANSITIONS.put(SHIPPED, Set.of(COMPLETED, REFUNDING));
        TRANSITIONS.put(COMPLETED, Set.of(REFUNDING));
        TRANSITIONS.put(REFUNDING, Set.of(REFUNDED, CANCELLED));
        // CANCELLED、REFUNDED 为终态，无后续转换
    }

    public boolean canTransit(OrderStatus from, OrderStatus to) {
        if (from == to) {
            return false;
        }
        Set<OrderStatus> allowed = TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    public void transit(Order order, OrderStatus target) {
        OrderStatus current = fromCode(order.getStatus());
        if (current == null) {
            throw new BusinessException(ResponseCode.ORDER_STATUS_TRANSITION_INVALID,
                    "订单当前状态异常");
        }
        if (current == target) {
            throw new BusinessException(ResponseCode.ORDER_STATUS_TRANSITION_INVALID,
                    "订单状态不允许从 " + current.getDescription() + " 转换为 " + target.getDescription());
        }
        if (!canTransit(current, target)) {
            throw new BusinessException(ResponseCode.ORDER_STATUS_TRANSITION_INVALID,
                    "订单状态不允许从 " + current.getDescription() + " 转换为 " + target.getDescription());
        }
        order.setStatus(target.getCode());
    }

    private static OrderStatus fromCode(Integer code) {
        return OrderStatus.fromCode(code);
    }
}
