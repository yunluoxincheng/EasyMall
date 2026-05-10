package org.ruikun.modules.payment.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.infrastructure.security.JwtUtil;
import org.ruikun.modules.payment.dto.PaymentCallbackDTO;
import org.ruikun.modules.payment.service.IPaymentService;
import org.ruikun.modules.payment.vo.PaymentVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;
    private final JwtUtil jwtUtil;

    @Value("${payment.mock.signature:easymall-mock-signature-2024}")
    private String mockSignature;

    @PostMapping("/{paymentNo}/pay")
    public Result<PaymentVO> pay(@PathVariable String paymentNo,
                                  HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        PaymentVO paymentVO = paymentService.pay(paymentNo, userId);
        return Result.success(paymentVO);
    }

    @PostMapping("/callback")
    public Result<?> callback(@RequestBody @Validated PaymentCallbackDTO callbackDTO,
                               @RequestHeader(value = "X-Mock-Signature", required = false) String signature) {
        if (!mockSignature.equals(signature)) {
            return Result.error(org.ruikun.common.ResponseCode.FORBIDDEN, "签名校验失败");
        }
        paymentService.processCallback(callbackDTO.getPaymentNo(), callbackDTO.getAmount(), callbackDTO.getChannel());
        return Result.success("回调处理成功");
    }

    @GetMapping("/{paymentNo}")
    public Result<PaymentVO> getByPaymentNo(@PathVariable String paymentNo,
                                             HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        PaymentVO paymentVO = paymentService.getByPaymentNo(paymentNo, userId);
        return Result.success(paymentVO);
    }

    @GetMapping("/order/{orderId}")
    public Result<PaymentVO> getByOrderId(@PathVariable Long orderId,
                                           HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        PaymentVO paymentVO = paymentService.getByOrderId(orderId, userId);
        return Result.success(paymentVO);
    }

    private Long getUserIdFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.getUserIdFromToken(token);
    }
}
