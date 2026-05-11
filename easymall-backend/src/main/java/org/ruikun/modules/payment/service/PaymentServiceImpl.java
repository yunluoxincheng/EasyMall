package org.ruikun.modules.payment.service;

import com.alibaba.fastjson2.JSON;
import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.OrderStatus;
import org.ruikun.enums.PaymentChannel;
import org.ruikun.enums.PaymentStatus;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.inventory.service.IInventoryService;
import org.ruikun.modules.coupon.service.ICouponService;
import org.ruikun.modules.order.entity.Order;
import org.ruikun.modules.order.entity.OrderItem;
import org.ruikun.modules.order.mapper.OrderItemMapper;
import org.ruikun.modules.order.mapper.OrderMapper;
import org.ruikun.modules.order.service.OrderStateMachine;
import org.ruikun.modules.payment.entity.PaymentOrder;
import org.ruikun.modules.payment.mapper.PaymentOrderMapper;
import org.ruikun.modules.payment.vo.PaymentVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PaymentServiceImpl implements IPaymentService {

    private final PaymentOrderMapper paymentOrderMapper;
    private final IPaymentCallbackLogService paymentCallbackLogService;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final OrderStateMachine orderStateMachine;
    private final IInventoryService inventoryService;
    private final ICouponService couponService;

    @Autowired
    @Lazy
    private IPaymentService self;

    public PaymentServiceImpl(PaymentOrderMapper paymentOrderMapper,
                              IPaymentCallbackLogService paymentCallbackLogService,
                              OrderMapper orderMapper,
                              OrderItemMapper orderItemMapper,
                              OrderStateMachine orderStateMachine,
                              IInventoryService inventoryService,
                              ICouponService couponService) {
        this.paymentOrderMapper = paymentOrderMapper;
        this.paymentCallbackLogService = paymentCallbackLogService;
        this.orderMapper = orderMapper;
        this.orderItemMapper = orderItemMapper;
        this.orderStateMachine = orderStateMachine;
        this.inventoryService = inventoryService;
        this.couponService = couponService;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentOrder createPayment(Long orderId, String orderNo, Long userId, BigDecimal amount) {
        // 检查是否已有活跃支付单
        Long activeCount = paymentOrderMapper.selectCount(
                new LambdaQueryWrapper<PaymentOrder>()
                        .eq(PaymentOrder::getOrderId, orderId)
                        .in(PaymentOrder::getStatus, PaymentStatus.WAITING_PAY.getCode(), PaymentStatus.PAYING.getCode())
        );
        if (activeCount > 0) {
            log.info("订单 {} 已有活跃支付单，跳过创建", orderNo);
            return paymentOrderMapper.selectOne(
                    new LambdaQueryWrapper<PaymentOrder>()
                            .eq(PaymentOrder::getOrderId, orderId)
                            .in(PaymentOrder::getStatus, PaymentStatus.WAITING_PAY.getCode(), PaymentStatus.PAYING.getCode())
                            .last("LIMIT 1")
            );
        }

        PaymentOrder paymentOrder = new PaymentOrder();
        paymentOrder.setPaymentNo(generatePaymentNo());
        paymentOrder.setOrderId(orderId);
        paymentOrder.setOrderNo(orderNo);
        paymentOrder.setUserId(userId);
        paymentOrder.setAmount(amount);
        paymentOrder.setChannel(PaymentChannel.MOCK.getCode());
        paymentOrder.setStatus(PaymentStatus.WAITING_PAY.getCode());
        paymentOrderMapper.insert(paymentOrder);

        return paymentOrder;
    }

    @Override
    public PaymentVO getByPaymentNo(String paymentNo, Long userId) {
        PaymentOrder paymentOrder = paymentOrderMapper.selectOne(
                new LambdaQueryWrapper<PaymentOrder>()
                        .eq(PaymentOrder::getPaymentNo, paymentNo)
        );
        if (paymentOrder == null || !paymentOrder.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.PAYMENT_NOT_FOUND, "支付单不存在");
        }
        return convertToVO(paymentOrder);
    }

    @Override
    public PaymentVO getByOrderId(Long orderId, Long userId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.ORDER_NOT_FOUND, "订单不存在");
        }

        PaymentOrder paymentOrder = paymentOrderMapper.selectOne(
                new LambdaQueryWrapper<PaymentOrder>()
                        .eq(PaymentOrder::getOrderId, orderId)
                        .orderByDesc(PaymentOrder::getCreateTime)
                        .last("LIMIT 1")
        );
        if (paymentOrder == null) {
            throw new BusinessException(ResponseCode.PAYMENT_NOT_FOUND, "支付单不存在");
        }
        return convertToVO(paymentOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentVO pay(String paymentNo, Long userId) {
        PaymentOrder paymentOrder = paymentOrderMapper.selectOne(
                new LambdaQueryWrapper<PaymentOrder>()
                        .eq(PaymentOrder::getPaymentNo, paymentNo)
        );
        if (paymentOrder == null || !paymentOrder.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.PAYMENT_NOT_FOUND, "支付单不存在");
        }

        PaymentStatus status = PaymentStatus.fromCode(paymentOrder.getStatus());
        if (status == PaymentStatus.PAID) {
            throw new BusinessException(ResponseCode.PAYMENT_ALREADY_PAID, "支付单已支付");
        }
        if (status != PaymentStatus.WAITING_PAY) {
            throw new BusinessException(ResponseCode.PAYMENT_STATUS_INVALID, "支付状态不允许此操作");
        }

        // CAS 更新为 PAYING，防止并发覆盖
        int updated = paymentOrderMapper.update(null,
                new LambdaUpdateWrapper<PaymentOrder>()
                        .eq(PaymentOrder::getPaymentNo, paymentNo)
                        .eq(PaymentOrder::getUserId, userId)
                        .eq(PaymentOrder::getStatus, PaymentStatus.WAITING_PAY.getCode())
                        .set(PaymentOrder::getStatus, PaymentStatus.PAYING.getCode())
        );
        if (updated == 0) {
            // CAS 失败，重新查询判断当前状态
            paymentOrder = paymentOrderMapper.selectById(paymentOrder.getId());
            PaymentStatus currentStatus = PaymentStatus.fromCode(paymentOrder.getStatus());
            if (currentStatus == PaymentStatus.PAID) {
                throw new BusinessException(ResponseCode.PAYMENT_ALREADY_PAID, "支付单已支付");
            }
            throw new BusinessException(ResponseCode.PAYMENT_STATUS_INVALID, "支付状态不允许此操作");
        }

        // 模拟支付：通过代理调用回调处理，确保 @Transactional 生效
        self.processCallback(paymentNo, paymentOrder.getAmount(), PaymentChannel.MOCK.getCode());

        // 重新查询返回最新状态
        paymentOrder = paymentOrderMapper.selectById(paymentOrder.getId());
        return convertToVO(paymentOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void processCallback(String paymentNo, BigDecimal amount, String channel) {
        String callbackRaw;
        try {
            Map<String, Object> raw = new LinkedHashMap<>();
            raw.put("paymentNo", paymentNo);
            raw.put("amount", amount);
            raw.put("channel", channel);
            callbackRaw = JSON.toJSONString(raw);
        } catch (Exception e) {
            callbackRaw = "{}";
        }

        // 1. 独立事务创建回调日志（降级：失败不影响主流程）
        Long logId = null;
        try {
            logId = paymentCallbackLogService.saveLog(paymentNo, channel, callbackRaw, "RECEIVED");
        } catch (Exception e) {
            log.warn("保存回调日志失败: {}", e.getMessage());
        }

        // 2. 校验支付单存在
        PaymentOrder paymentOrder = paymentOrderMapper.selectOne(
                new LambdaQueryWrapper<PaymentOrder>()
                        .eq(PaymentOrder::getPaymentNo, paymentNo)
        );
        if (paymentOrder == null) {
            safeUpdateLogResult(logId, "PAYMENT_NOT_FOUND");
            throw new BusinessException(ResponseCode.PAYMENT_NOT_FOUND, "支付单不存在");
        }

        // 3. 幂等校验：已支付则直接返回成功
        PaymentStatus status = PaymentStatus.fromCode(paymentOrder.getStatus());
        if (status == PaymentStatus.PAID) {
            safeUpdateLogResult(logId, "IDEMPOTENT_SUCCESS");
            return;
        }

        // 4. 校验状态为 PAYING
        if (status != PaymentStatus.PAYING) {
            safeUpdateLogResult(logId, "STATUS_INVALID");
            throw new BusinessException(ResponseCode.PAYMENT_STATUS_INVALID, "支付状态不允许此操作");
        }

        // 5. 校验金额一致
        if (paymentOrder.getAmount().compareTo(amount) != 0) {
            safeUpdateLogResult(logId, "AMOUNT_MISMATCH");
            throw new BusinessException(ResponseCode.PAYMENT_AMOUNT_MISMATCH, "支付金额不一致");
        }

        // 6. CAS 更新支付单状态为 PAID
        int updated = paymentOrderMapper.update(null,
                new LambdaUpdateWrapper<PaymentOrder>()
                        .eq(PaymentOrder::getPaymentNo, paymentNo)
                        .eq(PaymentOrder::getStatus, PaymentStatus.PAYING.getCode())
                        .set(PaymentOrder::getStatus, PaymentStatus.PAID.getCode())
                        .set(PaymentOrder::getPaidTime, LocalDateTime.now())
                        .set(PaymentOrder::getThirdTradeNo, "MOCK_" + System.currentTimeMillis())
        );
        if (updated == 0) {
            // CAS 失败，重查支付单状态判断原因
            paymentOrder = paymentOrderMapper.selectById(paymentOrder.getId());
            PaymentStatus finalStatus = PaymentStatus.fromCode(paymentOrder.getStatus());
            if (finalStatus == PaymentStatus.PAID) {
                safeUpdateLogResult(logId, "IDEMPOTENT_SUCCESS");
                return;
            }
            safeUpdateLogResult(logId, "STATUS_INVALID");
            throw new BusinessException(ResponseCode.PAYMENT_STATUS_INVALID,
                    "支付单状态已变更: " + (finalStatus != null ? finalStatus.getDescription() : "未知"));
        }

        // 7. CAS 订单状态 PENDING_PAYMENT → PAID，防止与超时取消竞争
        Order order = orderMapper.selectById(paymentOrder.getOrderId());
        if (order != null) {
            int orderRows = orderMapper.casUpdateStatus(
                    order.getId(),
                    OrderStatus.PENDING_PAYMENT.getCode(),
                    OrderStatus.PAID.getCode());
            if (orderRows == 0) {
                Order freshOrder = orderMapper.selectById(order.getId());
                OrderStatus currentStatus = OrderStatus.fromCode(freshOrder.getStatus());
                if (currentStatus == OrderStatus.PAID) {
                    safeUpdateLogResult(logId, "IDEMPOTENT_SUCCESS");
                    return;
                }
                safeUpdateLogResult(logId, "ORDER_STATUS_CHANGED");
                throw new BusinessException(ResponseCode.ORDER_STATUS_TRANSITION_INVALID,
                        "订单状态已变更: " + (currentStatus != null ? currentStatus.getDescription() : "未知"));
            }

            order.setPaymentMethod(channel);
            order.setPayTime(LocalDateTime.now());
            order.setStatus(OrderStatus.PAID.getCode());
            orderMapper.updateById(order);

            // 确认库存
            List<OrderItem> orderItems = orderItemMapper.getOrderItemsByOrderId(order.getId());
            for (OrderItem orderItem : orderItems) {
                inventoryService.confirmSoldStock(orderItem.getProductId(), orderItem.getQuantity(), order.getId());
            }

            if (order.getUserCouponId() != null) {
                couponService.confirmCouponUsed(order.getUserId(), order.getUserCouponId(), order.getId());
            }
        }

        // 8. 独立事务更新日志为成功
        safeUpdateLogResult(logId, "SUCCESS");
    }

    private void safeUpdateLogResult(Long logId, String result) {
        if (logId == null) return;
        try {
            paymentCallbackLogService.updateResult(logId, result);
        } catch (Exception e) {
            log.warn("更新回调日志结果失败, logId={}, result={}: {}", logId, result, e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void closeByOrderId(Long orderId) {
        int closed = paymentOrderMapper.update(null,
                new LambdaUpdateWrapper<PaymentOrder>()
                        .eq(PaymentOrder::getOrderId, orderId)
                        .in(PaymentOrder::getStatus, PaymentStatus.WAITING_PAY.getCode(), PaymentStatus.PAYING.getCode())
                        .set(PaymentOrder::getStatus, PaymentStatus.CLOSED.getCode())
        );
        log.info("关闭订单 {} 关联支付单，影响行数: {}", orderId, closed);
    }

    private String generatePaymentNo() {
        return "PAY" + IdUtil.getSnowflakeNextIdStr();
    }

    private PaymentVO convertToVO(PaymentOrder paymentOrder) {
        PaymentVO vo = new PaymentVO();
        vo.setId(paymentOrder.getId());
        vo.setPaymentNo(paymentOrder.getPaymentNo());
        vo.setOrderId(paymentOrder.getOrderId());
        vo.setOrderNo(paymentOrder.getOrderNo());
        vo.setAmount(paymentOrder.getAmount());
        vo.setChannel(paymentOrder.getChannel());
        vo.setStatus(paymentOrder.getStatus());
        PaymentStatus ps = PaymentStatus.fromCode(paymentOrder.getStatus());
        vo.setStatusText(ps != null ? ps.getDescription() : "未知状态");
        vo.setThirdTradeNo(paymentOrder.getThirdTradeNo());
        vo.setPaidTime(paymentOrder.getPaidTime());
        vo.setCreateTime(paymentOrder.getCreateTime());
        return vo;
    }
}
