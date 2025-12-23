package org.ruikun.dto.admin;

import lombok.Data;

/**
 * 用户查询条件 DTO（后台管理）
 */
@Data
public class UserQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String username;        // 用户名（模糊搜索）
    private String phone;           // 手机号（精确搜索）
    private Integer status;         // 用户状态
    private Integer role;           // 角色
}
