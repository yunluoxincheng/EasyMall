package org.ruikun.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.service.IMemberService;
import org.ruikun.vo.MemberLevelVO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 会员控制器
 */
@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final IMemberService memberService;

    /**
     * 获取所有会员等级配置
     */
    @GetMapping("/levels")
    public Result<List<MemberLevelVO>> getAllMemberLevels() {
        List<MemberLevelVO> levels = memberService.getAllMemberLevels();
        return Result.success(levels);
    }

    /**
     * 获取当前用户的会员等级信息
     */
    @GetMapping("/level")
    public Result<MemberLevelVO> getMemberLevel(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        MemberLevelVO memberLevel = memberService.getMemberLevelByUserId(userId);
        return Result.success(memberLevel);
    }

    /**
     * 获取会员折扣率
     */
    @GetMapping("/discount")
    public Result<Double> getMemberDiscount(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error("用户未登录");
        }
        Double discount = memberService.getMemberDiscount(userId);
        return Result.success(discount);
    }
}
