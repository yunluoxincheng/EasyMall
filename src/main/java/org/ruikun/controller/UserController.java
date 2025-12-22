package org.ruikun.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.dto.UserLoginDTO;
import org.ruikun.dto.UserRegisterDTO;
import org.ruikun.dto.UserUpdateDTO;
import org.ruikun.service.IUserService;
import org.ruikun.utils.JwtUtil;
import org.ruikun.vo.LoginVO;
import org.ruikun.vo.UserVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody @Validated UserLoginDTO loginDTO) {
        LoginVO loginVO = userService.login(loginDTO);
        return Result.success(loginVO);
    }

    @PostMapping("/register")
    public Result<?> register(@RequestBody @Validated UserRegisterDTO registerDTO) {
        userService.register(registerDTO);
        return Result.success("注册成功");
    }

    @GetMapping("/info")
    public Result<UserVO> getUserInfo(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Long userId = jwtUtil.getUserIdFromToken(token);
        UserVO userVO = userService.getUserInfo(userId);
        return Result.success(userVO);
    }

    @PutMapping("/info")
    public Result<?> updateUserInfo(@RequestBody @Validated UserUpdateDTO updateDTO,
                                    HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Long userId = jwtUtil.getUserIdFromToken(token);
        userService.updateUserInfo(userId, updateDTO);
        return Result.success("更新成功");
    }

    @PutMapping("/password")
    public Result<?> updatePassword(@RequestParam String oldPassword,
                                   @RequestParam String newPassword,
                                   HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        Long userId = jwtUtil.getUserIdFromToken(token);
        userService.updatePassword(userId, oldPassword, newPassword);
        return Result.success("密码修改成功");
    }

    @PostMapping("/logout")
    public Result<?> logout(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Long userId = jwtUtil.getUserIdFromToken(token);
        }
        return Result.success("退出成功");
    }
}