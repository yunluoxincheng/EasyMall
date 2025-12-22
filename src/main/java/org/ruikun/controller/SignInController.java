package org.ruikun.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.service.ISignInService;
import org.ruikun.vo.SignInResultVO;
import org.springframework.web.bind.annotation.*;

/**
 * 签到控制器
 */
@RestController
@RequestMapping("/api/signin")
@RequiredArgsConstructor
public class SignInController {

    private final ISignInService signInService;

    /**
     * 用户签到
     */
    @PostMapping("/do")
    public Result<SignInResultVO> signIn(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        SignInResultVO result = signInService.signIn(userId);
        return Result.success(result);
    }

    /**
     * 检查今日是否已签到
     */
    @GetMapping("/status")
    public Result<Boolean> hasSignedToday(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        boolean hasSigned = signInService.hasSignedToday(userId);
        return Result.success(hasSigned);
    }

    /**
     * 获取连续签到天数
     */
    @GetMapping("/continuous")
    public Result<Integer> getContinuousDays(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        Integer days = signInService.getContinuousDays(userId);
        return Result.success(days);
    }
}
