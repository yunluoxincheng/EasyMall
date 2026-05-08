package org.ruikun.common;

import lombok.Data;
import org.ruikun.util.TraceIdUtil;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class Result<T> {
    private Boolean success;
    private String code;
    private String message;
    private LocalDateTime timestamp;
    private String traceId;
    private T data;
    private List<ErrorDetail> errors;

    public static <T> Result<T> success() {
        Result<T> result = new Result<>();
        result.setSuccess(true);
        result.setCode(ResponseCode.SUCCESS.getCode());
        result.setMessage(ResponseCode.SUCCESS.getMessage());
        result.setTimestamp(LocalDateTime.now());
        result.setTraceId(TraceIdUtil.getOrCreate());
        return result;
    }

    public static <T> Result<T> success(T data) {
        Result<T> result = success();
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success(String message, T data) {
        Result<T> result = success(data);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> success(ResponseCode responseCode, T data) {
        Result<T> result = new Result<>();
        result.setSuccess(true);
        result.setCode(responseCode.getCode());
        result.setMessage(responseCode.getMessage());
        result.setTimestamp(LocalDateTime.now());
        result.setTraceId(TraceIdUtil.getOrCreate());
        result.setData(data);
        return result;
    }

    public static <T> Result<T> error() {
        Result<T> result = new Result<>();
        result.setSuccess(false);
        result.setCode(ResponseCode.ERROR.getCode());
        result.setMessage(ResponseCode.ERROR.getMessage());
        result.setTimestamp(LocalDateTime.now());
        result.setTraceId(TraceIdUtil.getOrCreate());
        return result;
    }

    public static <T> Result<T> error(String message) {
        Result<T> result = error();
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> error(ResponseCode responseCode) {
        Result<T> result = new Result<>();
        result.setSuccess(false);
        result.setCode(responseCode.getCode());
        result.setMessage(responseCode.getMessage());
        result.setTimestamp(LocalDateTime.now());
        result.setTraceId(TraceIdUtil.getOrCreate());
        return result;
    }

    public static <T> Result<T> error(ResponseCode responseCode, String message) {
        Result<T> result = error(responseCode);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> error(ResponseCode responseCode, List<ErrorDetail> errors) {
        Result<T> result = error(responseCode);
        result.setErrors(errors);
        return result;
    }

    /**
     * 向后兼容方法
     * @deprecated 使用 error(ResponseCode) 代替
     */
    @Deprecated
    public static <T> Result<T> error(Integer code, String message) {
        Result<T> result = error();
        result.setCode(String.valueOf(code));
        result.setMessage(message);
        return result;
    }
}