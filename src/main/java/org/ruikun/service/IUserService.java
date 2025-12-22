package org.ruikun.service;

import org.ruikun.dto.UserLoginDTO;
import org.ruikun.dto.UserRegisterDTO;
import org.ruikun.dto.UserUpdateDTO;
import org.ruikun.vo.LoginVO;
import org.ruikun.vo.UserVO;

public interface IUserService {
    LoginVO login(UserLoginDTO loginDTO);

    void register(UserRegisterDTO registerDTO);

    UserVO getUserInfo(Long userId);

    void updateUserInfo(Long userId, UserUpdateDTO updateDTO);

    void updatePassword(Long userId, String oldPassword, String newPassword);
}