package org.ruikun.modules.user.service;

import org.ruikun.modules.user.dto.UserLoginDTO;
import org.ruikun.modules.user.dto.UserRegisterDTO;
import org.ruikun.modules.user.dto.UserUpdateDTO;
import org.ruikun.modules.user.vo.LoginVO;
import org.ruikun.modules.user.vo.UserVO;

public interface IUserService {
    LoginVO login(UserLoginDTO loginDTO);

    void register(UserRegisterDTO registerDTO);

    UserVO getUserInfo(Long userId);

    void updateUserInfo(Long userId, UserUpdateDTO updateDTO);

    void updatePassword(Long userId, String oldPassword, String newPassword);

    void logout(Long userId);
}