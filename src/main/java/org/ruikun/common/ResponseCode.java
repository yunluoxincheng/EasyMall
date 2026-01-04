package org.ruikun.common;

import lombok.Getter;

/**
 * 统一响应状态码枚举
 */
@Getter
public enum ResponseCode {

    // ========== 通用 ==========
    SUCCESS(200, "SUCCESS", "操作成功"),
    LOGIN_SUCCESS(200, "LOGIN_SUCCESS", "登录成功"),
    REGISTER_SUCCESS(200, "REGISTER_SUCCESS", "注册成功"),
    LOGOUT_SUCCESS(200, "LOGOUT_SUCCESS", "退出成功"),
    SAVE_SUCCESS(200, "SAVE_SUCCESS", "保存成功"),
    UPDATE_SUCCESS(200, "UPDATE_SUCCESS", "更新成功"),
    DELETE_SUCCESS(200, "DELETE_SUCCESS", "删除成功"),
    OPERATION_SUCCESS(200, "OPERATION_SUCCESS", "操作成功"),
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
    PHONE_EXISTS(400, "PHONE_EXISTS", "手机号已被注册"),
    EMAIL_EXISTS(400, "EMAIL_EXISTS", "邮箱已被注册"),
    PASSWORD_MISMATCH(400, "PASSWORD_MISMATCH", "两次密码输入不一致"),

    // ========== 商品相关 ==========
    PRODUCT_NOT_FOUND(404, "PRODUCT_NOT_FOUND", "商品不存在"),
    PRODUCT_OUT_OF_STOCK(400, "PRODUCT_OUT_OF_STOCK", "商品库存不足"),
    PRODUCT_SHELF_ERROR(400, "PRODUCT_SHELF_ERROR", "商品已下架"),
    PRODUCT_SHELF_EMPTY(400, "PRODUCT_SHELF_EMPTY", "商品不存在或已下架"),
    PRODUCT_CREATE_FAILED(500, "PRODUCT_CREATE_FAILED", "商品添加失败"),
    PRODUCT_UPDATE_FAILED(500, "PRODUCT_UPDATE_FAILED", "商品更新失败"),
    PRODUCT_ALREADY_FAVORITED(400, "PRODUCT_ALREADY_FAVORITED", "已收藏该商品"),

    // ========== 分类相关 ==========
    CATEGORY_NOT_FOUND(404, "CATEGORY_NOT_FOUND", "分类不存在"),
    CATEGORY_HAS_PRODUCTS(400, "CATEGORY_HAS_PRODUCTS", "分类下存在商品，无法删除"),
    CATEGORY_HAS_CHILDREN(400, "CATEGORY_HAS_CHILDREN", "分类下存在子分类，无法删除"),
    CATEGORY_NAME_EXISTS(400, "CATEGORY_NAME_EXISTS", "同级分类名称已存在"),
    CATEGORY_PARENT_NOT_FOUND(404, "CATEGORY_PARENT_NOT_FOUND", "父分类不存在"),
    CATEGORY_INVALID_PARENT(400, "CATEGORY_INVALID_PARENT", "父分类不能是自己"),
    CATEGORY_PARENT_IS_CHILD(400, "CATEGORY_PARENT_IS_CHILD", "父分类不能是自己的子分类"),

    // ========== 订单相关 ==========
    ORDER_NOT_FOUND(404, "ORDER_NOT_FOUND", "订单不存在"),
    ORDER_STATUS_ERROR(400, "ORDER_STATUS_ERROR", "订单状态不允许此操作"),
    CART_EMPTY(400, "CART_EMPTY", "购物车为空"),
    CART_ITEM_NOT_FOUND(404, "CART_ITEM_NOT_FOUND", "购物车商品不存在"),
    CART_ITEM_EMPTY(400, "CART_ITEM_EMPTY", "请选择要购买的商品"),
    ORDER_CANNOT_CANCEL(400, "ORDER_CANNOT_CANCEL", "订单状态不允许取消"),
    ORDER_CANNOT_PAY(400, "ORDER_CANNOT_PAY", "订单状态不允许支付"),
    ORDER_CANNOT_CONFIRM(400, "ORDER_CANNOT_CONFIRM", "订单状态不允许确认收货"),

    // ========== 评论相关 ==========
    COMMENT_NOT_FOUND(404, "COMMENT_NOT_FOUND", "评论不存在"),
    COMMENT_ALREADY_APPROVED(400, "COMMENT_ALREADY_APPROVED", "评论已审核通过"),
    COMMENT_ALREADY_REJECTED(400, "COMMENT_ALREADY_REJECTED", "评论已审核拒绝"),
    COMMENT_RATING_INVALID(400, "COMMENT_RATING_INVALID", "评分必须在1-5星之间"),
    ORDER_NOT_COMPLETED(400, "ORDER_NOT_COMPLETED", "只能评论已完成的订单"),
    PRODUCT_NOT_IN_ORDER(400, "PRODUCT_NOT_IN_ORDER", "订单中不包含该商品"),
    COMMENT_ALREADY_EXISTS(400, "COMMENT_ALREADY_EXISTS", "您已评论过该商品"),
    COMMENT_DELETE_FORBIDDEN(403, "COMMENT_DELETE_FORBIDDEN", "无权删除该评论"),

    // ========== 会员等级相关 ==========
    MEMBER_LEVEL_NOT_FOUND(404, "MEMBER_LEVEL_NOT_FOUND", "会员等级不存在"),
    MEMBER_LEVEL_CONFLICT(400, "MEMBER_LEVEL_CONFLICT", "积分范围与其他等级冲突"),

    // ========== 积分兑换相关 ==========
    POINTS_PRODUCT_NOT_FOUND(404, "POINTS_PRODUCT_NOT_FOUND", "积分兑换商品不存在"),
    POINTS_PRODUCT_OUT_OF_STOCK(400, "POINTS_PRODUCT_OUT_OF_STOCK", "积分兑换商品库存不足"),
    POINTS_INSUFFICIENT(400, "POINTS_INSUFFICIENT", "积分不足"),
    POINTS_EXCHANGE_LIMIT_EXCEEDED(400, "POINTS_EXCHANGE_LIMIT_EXCEEDED", "超过兑换限制"),
    POINTS_VALUE_INVALID(400, "POINTS_VALUE_INVALID", "积分值必须大于0"),

    // ========== 优惠券相关 ==========
    COUPON_NOT_FOUND(404, "COUPON_NOT_FOUND", "优惠券不存在"),
    COUPON_ALREADY_RECEIVED(400, "COUPON_ALREADY_RECEIVED", "已领取过该优惠券"),
    COUPON_OUT_OF_STOCK(400, "COUPON_OUT_OF_STOCK", "优惠券已领完"),
    COUPON_EXPIRED(400, "COUPON_EXPIRED", "优惠券已过期"),
    COUPON_ALREADY_USED(400, "COUPON_ALREADY_USED", "优惠券已使用"),
    COUPON_USAGE_LIMIT_EXCEEDED(400, "COUPON_USAGE_LIMIT_EXCEEDED", "超过使用次数限制"),
    COUPON_AMOUNT_THRESHOLD_NOT_MET(400, "COUPON_AMOUNT_THRESHOLD_NOT_MET", "不满足使用门槛"),
    COUPON_MEMBER_LEVEL_NOT_MET(403, "COUPON_MEMBER_LEVEL_NOT_MET", "会员等级不足"),
    COUPON_TEMPLATE_NOT_FOUND(404, "COUPON_TEMPLATE_NOT_FOUND", "优惠券模板不存在"),
    COUPON_TEMPLATE_HAS_RECEIVED(400, "COUPON_TEMPLATE_HAS_RECEIVED", "优惠券模板已被领取，无法删除"),
    COUPON_CANNOT_RETURN(400, "COUPON_CANNOT_RETURN", "优惠券不能返还"),

    // ========== 签到相关 ==========
    SIGN_IN_ALREADY_DONE(400, "SIGN_IN_ALREADY_DONE", "今日已签到"),

    // ========== 收藏相关 ==========
    FAVORITE_NOT_FOUND(404, "FAVORITE_NOT_FOUND", "收藏记录不存在"),

    // ========== 订单相关（补充） ==========
    ORDER_ALREADY_PAID(400, "ORDER_ALREADY_PAID", "订单已支付"),
    ORDER_ALREADY_CANCELLED(400, "ORDER_ALREADY_CANCELLED", "订单已取消"),
    ORDER_ALREADY_SHIPPED(400, "ORDER_ALREADY_SHIPPED", "订单已发货，无法取消"),

    // ========== 管理操作相关 ==========
    OPERATION_FAILED(500, "OPERATION_FAILED", "操作失败"),
    CATEGORY_CREATE_FAILED(500, "CATEGORY_CREATE_FAILED", "分类创建失败"),
    MEMBER_LEVEL_CREATE_FAILED(500, "MEMBER_LEVEL_CREATE_FAILED", "会员等级创建失败"),
    MEMBER_LEVEL_UPDATE_FAILED(500, "MEMBER_LEVEL_UPDATE_FAILED", "会员等级更新失败"),
    POINTS_PRODUCT_CREATE_FAILED(500, "POINTS_PRODUCT_CREATE_FAILED", "积分兑换商品创建失败"),
    POINTS_PRODUCT_UPDATE_FAILED(500, "POINTS_PRODUCT_UPDATE_FAILED", "积分兑换商品更新失败"),
    STOCK_INVALID(400, "STOCK_INVALID", "库存不能为负数"),

    // ========== 文件上传相关 ==========
    FILE_EMPTY(400, "FILE_EMPTY", "文件为空"),
    FILE_TOO_LARGE(400, "FILE_TOO_LARGE", "文件大小超过限制"),
    INVALID_FILE_TYPE(400, "INVALID_FILE_TYPE", "不支持的文件类型"),
    INVALID_FILE_CONTENT(400, "INVALID_FILE_CONTENT", "文件内容不合法"),
    FILE_UPLOAD_FAILED(500, "FILE_UPLOAD_FAILED", "文件上传失败"),
    FILE_NOT_FOUND(404, "FILE_NOT_FOUND", "文件不存在"),
    FILE_DELETE_FAILED(500, "FILE_DELETE_FAILED", "文件删除失败");

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
