package org.ruikun.common;

import lombok.Getter;

/**
 * 统一响应状态码枚举
 */
@Getter
public enum ResponseCode {

    // ========== 通用 ==========
    SUCCESS(200, "SUCCESS", "操作成功"),
    ERROR(500, "ERROR", "操作失败"),
    VALIDATION_ERROR(400, "VALIDATION_ERROR", "参数校验失败"),
    NOT_FOUND(404, "NOT_FOUND", "资源不存在"),
    UNAUTHORIZED(401, "UNAUTHORIZED", "未授权，请先登录"),
    FORBIDDEN(403, "FORBIDDEN", "无权访问"),

    // ========== 用户相关 ==========
    USER_NOT_FOUND(404, "USER_NOT_FOUND", "用户不存在"),
    USER_DISABLED(403, "USER_DISABLED", "用户已被禁用"),
    USERNAME_EXISTS(400, "USERNAME_EXISTS", "用户名已存在"),
    PASSWORD_ERROR(400, "PASSWORD_ERROR", "密码错误"),
    OLD_PASSWORD_ERROR(400, "OLD_PASSWORD_ERROR", "原密码错误"),

    // ========== 商品相关 ==========
    PRODUCT_NOT_FOUND(404, "PRODUCT_NOT_FOUND", "商品不存在"),
    PRODUCT_OUT_OF_STOCK(400, "PRODUCT_OUT_OF_STOCK", "商品库存不足"),
    PRODUCT_SHELF_ERROR(400, "PRODUCT_SHELF_ERROR", "商品已下架"),

    // ========== 分类相关 ==========
    CATEGORY_NOT_FOUND(404, "CATEGORY_NOT_FOUND", "分类不存在"),
    CATEGORY_HAS_PRODUCTS(400, "CATEGORY_HAS_PRODUCTS", "分类下存在商品，无法删除"),
    CATEGORY_HAS_CHILDREN(400, "CATEGORY_HAS_CHILDREN", "分类下存在子分类，无法删除"),

    // ========== 订单相关 ==========
    ORDER_NOT_FOUND(404, "ORDER_NOT_FOUND", "订单不存在"),
    ORDER_STATUS_ERROR(400, "ORDER_STATUS_ERROR", "订单状态不允许此操作"),
    CART_EMPTY(400, "CART_EMPTY", "购物车为空"),
    CART_ITEM_NOT_FOUND(404, "CART_ITEM_NOT_FOUND", "购物车商品不存在"),

    // ========== 评论相关 ==========
    COMMENT_NOT_FOUND(404, "COMMENT_NOT_FOUND", "评论不存在"),
    COMMENT_ALREADY_APPROVED(400, "COMMENT_ALREADY_APPROVED", "评论已审核通过"),
    COMMENT_ALREADY_REJECTED(400, "COMMENT_ALREADY_REJECTED", "评论已审核拒绝"),

    // ========== 会员等级相关 ==========
    MEMBER_LEVEL_NOT_FOUND(404, "MEMBER_LEVEL_NOT_FOUND", "会员等级不存在"),
    MEMBER_LEVEL_CONFLICT(400, "MEMBER_LEVEL_CONFLICT", "积分范围与其他等级冲突"),

    // ========== 积分兑换相关 ==========
    POINTS_PRODUCT_NOT_FOUND(404, "POINTS_PRODUCT_NOT_FOUND", "积分兑换商品不存在"),
    POINTS_PRODUCT_OUT_OF_STOCK(400, "POINTS_PRODUCT_OUT_OF_STOCK", "积分兑换商品库存不足"),
    POINTS_INSUFFICIENT(400, "POINTS_INSUFFICIENT", "积分不足"),
    POINTS_EXCHANGE_LIMIT_EXCEEDED(400, "POINTS_EXCHANGE_LIMIT_EXCEEDED", "超过兑换限制");

    /**
     * HTTP 状态码
     */
    private final int httpStatus;

    /**
     * 业务状态码（字符串形式，便于扩展和识别）
     */
    private final String code;

    /**
     * 状态描述
     */
    private final String message;

    ResponseCode(int httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
