package org.ruikun.controller;

import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 临时工具接口（仅用于开发测试）
 */
@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
public class DevToolsController {

    /**
     * 生成 BCrypt 密码哈希
     * 访问 GET /api/dev/hash?password=admin123
     */
    @GetMapping("/hash")
    public Result<Map<String, String>> generateHash(@RequestParam String password) {
        // 生成 BCrypt 哈希
        String hash = cn.hutool.crypto.digest.BCrypt.hashpw(password, cn.hutool.crypto.digest.BCrypt.gensalt());

        Map<String, String> result = new HashMap<>();
        result.put("password", password);
        result.put("hash", hash);
        result.put("sql", "INSERT INTO user (username, password, nickname, role, status, points, level, create_time, update_time, deleted) VALUES ('admin', '" + hash + "', '管理员', 1, 1, 0, 1, NOW(), NOW(), 0);");

        return Result.success(result);
    }
}
