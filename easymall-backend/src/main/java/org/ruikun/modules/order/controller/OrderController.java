package org.ruikun.modules.order.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.modules.order.dto.OrderCreateDTO;
import org.ruikun.modules.order.service.IOrderService;
import org.ruikun.infrastructure.security.JwtUtil;
import org.ruikun.modules.order.vo.OrderCreateVO;
import org.ruikun.modules.order.vo.OrderVO;
import org.ruikun.modules.payment.vo.PaymentVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private final IOrderService orderService;
    private final JwtUtil jwtUtil;

    @PostMapping("/create")
    public Result<OrderCreateVO> createOrder(@RequestBody @Validated OrderCreateDTO orderCreateDTO,
                                              HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        OrderCreateVO createVO = orderService.createOrder(userId, orderCreateDTO);
        return Result.success(createVO);
    }

    @GetMapping("/page")
    public Result<PageResult<OrderVO>> getOrderPage(PageRequest pageRequest,
                                                    HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        PageResult<OrderVO> pageResult = orderService.getOrderPage(userId, pageRequest);
        return Result.success(pageResult);
    }

    @GetMapping("/{orderId}")
    public Result<OrderVO> getOrderDetail(@PathVariable Long orderId,
                                          HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        OrderVO order = orderService.getOrderDetail(userId, orderId);
        return Result.success(order);
    }

    @PutMapping("/{orderId}/cancel")
    public Result<?> cancelOrder(@PathVariable Long orderId,
                                 HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        orderService.cancelOrder(userId, orderId);
        return Result.success("订单已取消");
    }

    @GetMapping("/{orderId}/payment")
    public Result<PaymentVO> getPaymentInfo(@PathVariable Long orderId,
                                             HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        PaymentVO paymentVO = orderService.getPaymentInfo(userId, orderId);
        return Result.success(paymentVO);
    }

    @PutMapping("/{orderId}/confirm")
    public Result<?> confirmOrder(@PathVariable Long orderId,
                                  HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        orderService.confirmOrder(userId, orderId);
        return Result.success("确认收货成功");
    }

    private Long getUserIdFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.getUserIdFromToken(token);
    }
}