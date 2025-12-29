package org.ruikun.service.impl;

import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.dto.UserLoginDTO;
import org.ruikun.dto.UserRegisterDTO;
import org.ruikun.dto.UserUpdateDTO;
import org.ruikun.entity.User;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.UserMapper;
import org.ruikun.service.IUserService;
import org.ruikun.utils.JwtUtil;
import org.ruikun.vo.LoginVO;
import org.ruikun.vo.UserVO;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;
    private final org.ruikun.service.ICouponService couponService;
    private final org.ruikun.mapper.CouponTemplateMapper couponTemplateMapper;

    @Override
    public LoginVO login(UserLoginDTO loginDTO) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, loginDTO.getUsername());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(ResponseCode.USER_DISABLED, "账号已被禁用");
        }

        if (!BCrypt.checkpw(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ResponseCode.PASSWORD_ERROR, "密码错误");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());

        redisTemplate.opsForValue().set("login:" + user.getId(), token, 24, TimeUnit.HOURS);

        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setNickname(user.getNickname());
        loginVO.setAvatar(user.getAvatar());
        loginVO.setRole(user.getRole());

        return loginVO;
    }

    @Override
    public void register(UserRegisterDTO registerDTO) {
        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            throw new BusinessException(ResponseCode.PASSWORD_MISMATCH, "两次密码输入不一致");
        }

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, registerDTO.getUsername());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ResponseCode.USERNAME_EXISTS, "用户名已存在");
        }

        wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getPhone, registerDTO.getPhone());
        if (StringUtils.hasText(registerDTO.getPhone()) && userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ResponseCode.PHONE_EXISTS, "手机号已被注册");
        }

        wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getEmail, registerDTO.getEmail());
        if (StringUtils.hasText(registerDTO.getEmail()) && userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ResponseCode.EMAIL_EXISTS, "邮箱已被注册");
        }

        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(BCrypt.hashpw(registerDTO.getPassword(), BCrypt.gensalt()));
        user.setNickname(registerDTO.getNickname());
        user.setPhone(registerDTO.getPhone());
        user.setEmail(registerDTO.getEmail());
        user.setRole(0);
        user.setStatus(1);
        user.setPoints(0);
        user.setLevel(1);

        userMapper.insert(user);

        // 自动发放新人专享券
        try {
            LambdaQueryWrapper<org.ruikun.entity.CouponTemplate> couponWrapper = new LambdaQueryWrapper<>();
            couponWrapper.eq(org.ruikun.entity.CouponTemplate::getType, 3) // 3-新人专享券
                    .eq(org.ruikun.entity.CouponTemplate::getStatus, 1) // 上架中
                    .orderByAsc(org.ruikun.entity.CouponTemplate::getSortOrder)
                    .last("LIMIT 1");
            org.ruikun.entity.CouponTemplate newbieCoupon = couponTemplateMapper.selectOne(couponWrapper);
            if (newbieCoupon != null) {
                couponService.issueCoupon(user.getId(), newbieCoupon.getId());
            }
        } catch (Exception e) {
            // 发放优惠券失败不影响注册流程
            // 记录日志即可（实际项目中应使用日志框架）
        }
    }

    @Override
    public UserVO getUserInfo(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        UserVO userVO = new UserVO();
        BeanUtils.copyProperties(user, userVO);
        return userVO;
    }

    @Override
    public void updateUserInfo(Long userId, UserUpdateDTO updateDTO) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        if (StringUtils.hasText(updateDTO.getPhone())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getPhone, updateDTO.getPhone())
                   .ne(User::getId, userId);
            if (userMapper.selectCount(wrapper) > 0) {
                throw new BusinessException(ResponseCode.PHONE_EXISTS, "手机号已被使用");
            }
        }

        if (StringUtils.hasText(updateDTO.getEmail())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getEmail, updateDTO.getEmail())
                   .ne(User::getId, userId);
            if (userMapper.selectCount(wrapper) > 0) {
                throw new BusinessException(ResponseCode.EMAIL_EXISTS, "邮箱已被使用");
            }
        }

        BeanUtils.copyProperties(updateDTO, user, "id", "username", "password", "role", "status", "points", "level");
        userMapper.updateById(user);
    }

    @Override
    public void updatePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        if (!BCrypt.checkpw(oldPassword, user.getPassword())) {
            throw new BusinessException(ResponseCode.OLD_PASSWORD_ERROR, "原密码错误");
        }

        user.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        userMapper.updateById(user);

        redisTemplate.delete("login:" + userId);
    }

    @Override
    public void logout(Long userId) {
        // 删除Redis中的token，使token失效
        redisTemplate.delete("login:" + userId);
    }
}