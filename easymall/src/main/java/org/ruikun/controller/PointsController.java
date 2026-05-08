package org.ruikun.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.common.ResponseCode;
import org.ruikun.service.IPointsService;
import org.ruikun.vo.PointsRecordVO;
import org.springframework.web.bind.annotation.*;

/**
 * 积分控制器
 */
@RestController
@RequestMapping("/api/points")
@RequiredArgsConstructor
public class PointsController {

    private final IPointsService pointsService;

    /**
     * 分页查询积分记录
     */
    @GetMapping("/records")
    public Result<Page<PointsRecordVO>> getPointsRecords(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(ResponseCode.UNAUTHORIZED);
        }
        Page<PointsRecordVO> records = pointsService.getPointsRecords(userId, pageNum, pageSize);
        return Result.success(records);
    }
}
