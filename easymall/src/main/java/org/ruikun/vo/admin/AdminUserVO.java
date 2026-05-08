package org.ruikun.vo.admin;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户详情 VO（后台管理）
 */
@Data
public class AdminUserVO {
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
    private LocalDateTime updateTime;
}
