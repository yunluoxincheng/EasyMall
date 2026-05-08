package org.ruikun.enums;

import lombok.Getter;

/**
 * 图片类型枚举
 */
@Getter
public enum ImageType {

    /**
     * 商品图片
     */
    PRODUCT("products", "商品图片"),

    /**
     * 用户头像
     */
    AVATAR("avatars", "用户头像");

    /**
     * 目录名称
     */
    private final String directory;

    /**
     * 描述
     */
    private final String description;

    ImageType(String directory, String description) {
        this.directory = directory;
        this.description = description;
    }

    /**
     * 根据字符串获取图片类型
     */
    public static ImageType fromString(String type) {
        for (ImageType imageType : values()) {
            if (imageType.directory.equalsIgnoreCase(type)) {
                return imageType;
            }
        }
        throw new IllegalArgumentException("未知的图片类型: " + type);
    }
}
