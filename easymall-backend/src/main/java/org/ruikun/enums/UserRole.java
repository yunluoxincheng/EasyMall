package org.ruikun.enums;

import lombok.Getter;

@Getter
public enum UserRole {

    USER(0, "普通用户", "ROLE_USER"),
    ADMIN(1, "管理员", "ROLE_ADMIN");

    private final Integer code;
    private final String description;
    private final String authority;

    UserRole(Integer code, String description, String authority) {
        this.code = code;
        this.description = description;
        this.authority = authority;
    }

    public static UserRole fromCode(Integer code) {
        if (code == null) {
            return USER;
        }
        for (UserRole role : values()) {
            if (role.getCode().equals(code)) {
                return role;
            }
        }
        return USER;
    }

    public static boolean isAdmin(Integer code) {
        return ADMIN.getCode().equals(code);
    }
}