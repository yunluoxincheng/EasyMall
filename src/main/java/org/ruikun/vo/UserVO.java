package org.ruikun.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserVO {
    private Long id;
    private String username;
    private String nickname;
    private String phone;
    private String email;
    private String avatar;
    private Integer gender;
    private Integer role;
    private Integer status;
    private Integer points;
    private Integer level;
    private LocalDateTime createTime;
}