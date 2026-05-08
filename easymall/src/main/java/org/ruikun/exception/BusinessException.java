package org.ruikun.exception;

import lombok.Getter;
import org.ruikun.common.ErrorDetail;
import org.ruikun.common.ResponseCode;

import java.util.List;

/**
 * 业务异常类
 */
@Getter
public class BusinessException extends RuntimeException {

    /**
     * 响应状态码
     */
    private final ResponseCode responseCode;

    /**
     * 错误详情列表（可选）
     */
    private final List<ErrorDetail> errors;

    /**
     * 默认构造：使用通用错误状态码
     *
     * @param message 错误消息
     */
    public BusinessException(String message) {
        super(message);
        this.responseCode = ResponseCode.ERROR;
        this.errors = null;
    }

    /**
     * 指定状态码的构造
     *
     * @param responseCode 响应状态码
     */
    public BusinessException(ResponseCode responseCode) {
        super(responseCode.getMessage());
        this.responseCode = responseCode;
        this.errors = null;
    }

    /**
     * 指定状态码和自定义消息的构造
     *
     * @param responseCode 响应状态码
     * @param message      自定义错误消息
     */
    public BusinessException(ResponseCode responseCode, String message) {
        super(message);
        this.responseCode = responseCode;
        this.errors = null;
    }

    /**
     * 指定状态码、消息和错误详情的构造
     *
     * @param responseCode 响应状态码
     * @param message      自定义错误消息
     * @param errors       错误详情列表
     */
    public BusinessException(ResponseCode responseCode, String message, List<ErrorDetail> errors) {
        super(message);
        this.responseCode = responseCode;
        this.errors = errors;
    }

    /**
     * 指定状态码、消息、错误详情和原因的构造
     *
     * @param responseCode 响应状态码
     * @param message      自定义错误消息
     * @param errors       错误详情列表
     * @param cause        异常原因
     */
    public BusinessException(ResponseCode responseCode, String message, List<ErrorDetail> errors, Throwable cause) {
        super(message, cause);
        this.responseCode = responseCode;
        this.errors = errors;
    }

    /**
     * 指定状态码和原因的构造
     *
     * @param responseCode 响应状态码
     * @param cause        异常原因
     */
    public BusinessException(ResponseCode responseCode, Throwable cause) {
        super(responseCode.getMessage(), cause);
        this.responseCode = responseCode;
        this.errors = null;
    }

    /**
     * 指定状态码、消息和原因的构造
     *
     * @param responseCode 响应状态码
     * @param message      自定义错误消息
     * @param cause        异常原因
     */
    public BusinessException(ResponseCode responseCode, String message, Throwable cause) {
        super(message, cause);
        this.responseCode = responseCode;
        this.errors = null;
    }

    // ========== 向后兼容方法（已废弃） ==========

    /**
     * 向后兼容：使用 Integer code
     *
     * @deprecated 使用 {@link #BusinessException(ResponseCode)} 代替
     */
    @Deprecated
    public BusinessException(Integer code, String message) {
        super(message);
        // 根据 code 推断对应的 ResponseCode
        this.responseCode = inferResponseCode(code);
        this.errors = null;
    }

    /**
     * 向后兼容：使用 String message 和 Throwable cause
     *
     * @deprecated 使用 {@link #BusinessException(ResponseCode, Throwable)} 代替
     */
    @Deprecated
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.responseCode = ResponseCode.ERROR;
        this.errors = null;
    }

    /**
     * 根据旧的 Integer code 推断对应的 ResponseCode
     */
    private ResponseCode inferResponseCode(Integer code) {
        if (code == null) {
            return ResponseCode.ERROR;
        }
        switch (code) {
            case 400:
                return ResponseCode.VALIDATION_ERROR;
            case 404:
                return ResponseCode.NOT_FOUND;
            case 401:
                return ResponseCode.UNAUTHORIZED;
            case 403:
                return ResponseCode.FORBIDDEN;
            default:
                return ResponseCode.ERROR;
        }
    }
}
