package org.ruikun.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageRequest;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.dto.OrderCreateDTO;
import org.ruikun.service.IOrderService;
import org.ruikun.utils.JwtUtil;
import org.ruikun.vo.OrderVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private final IOrderService orderService;
    private final JwtUtil jwtUtil;

    @PostMapping("/create")
    public Result<String> createOrder(@RequestBody @Validated OrderCreateDTO orderCreateDTO,
                                      HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        String orderNo = orderService.createOrder(userId, orderCreateDTO);
        return Result.success(orderNo);
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

    @PutMapping("/{orderId}/pay")
    public Result<?> payOrder(@PathVariable Long orderId,
                              @RequestParam String paymentMethod,
                              HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        orderService.payOrder(userId, orderId, paymentMethod);
        return Result.success("支付成功");
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