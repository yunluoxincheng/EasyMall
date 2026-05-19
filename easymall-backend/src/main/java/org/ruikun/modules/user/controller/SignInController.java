package org.ruikun.modules.user.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.common.ResponseCode;
import org.ruikun.modules.user.service.ISignInService;
import org.ruikun.modules.user.vo.SignInResultVO;
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
            return Result.error(ResponseCode.UNAUTHORIZED);
        }
        SignInResultVO result = signInService.signIn(userId);
        return Result.success(result);
    }

    /**
     * 获取签到状态（积分、连续天数、今日是否已签到）
     */
    @GetMapping("/status")
    public Result<SignInResultVO> getSignInStatus(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(ResponseCode.UNAUTHORIZED);
        }
        SignInResultVO result = signInService.getSignInStatus(userId);
        return Result.success(result);
    }

    /**
     * 获取连续签到天数
     */
    @GetMapping("/continuous")
    public Result<Integer> getContinuousDays(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(ResponseCode.UNAUTHORIZED);
        }
        Integer days = signInService.getContinuousDays(userId);
        return Result.success(days);
    }
}
