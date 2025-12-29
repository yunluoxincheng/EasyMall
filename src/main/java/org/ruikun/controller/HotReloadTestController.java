package org.ruikun.controller;

import org.ruikun.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * 热重载测试控制器（临时测试用）
 * 用于验证 Docker 卷挂载后的代码热重载功能
 */
@RestController
@RequestMapping("/api/test")
public class HotReloadTestController {

    /**
     * 热重载测试端点
     * 访问 GET /api/test/hot-reload
     * 修改此方法返回值后，观察容器是否自动检测到变更并重载
     */
    @GetMapping("/hot-reload")
    public Result<String> testHotReload() {
        return Result.success("Hot reload test - MODIFIED - " + LocalDateTime.now());
    }
}
