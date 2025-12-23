package org.ruikun.exception;

import org.ruikun.common.ErrorDetail;
import org.ruikun.common.ResponseCode;
import org.ruikun.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        logger.error("业务异常：{}", e.getMessage());

        Result<Void> result = Result.error(e.getResponseCode());

        // 如果异常包含错误详情，填充 errors 数组
        if (e.getErrors() != null && !e.getErrors().isEmpty()) {
            result.setErrors(e.getErrors());
        }

        return result;
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidException(MethodArgumentNotValidException e) {
        logger.error("参数校验异常：{}", e.getMessage());

        List<ErrorDetail> errors = e.getBindingResult().getFieldErrors().stream()
                .map(this::convertToErrorDetail)
                .collect(Collectors.toList());

        return Result.error(ResponseCode.VALIDATION_ERROR, errors);
    }

    /**
     * 处理系统异常
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        logger.error("系统异常：", e);
        return Result.error(ResponseCode.ERROR, "系统异常，请联系管理员");
    }

    /**
     * 将 FieldError 转换为 ErrorDetail
     */
    private ErrorDetail convertToErrorDetail(FieldError fieldError) {
        String code = determineErrorCode(fieldError);
        return new ErrorDetail(
                fieldError.getField(),
                code,
                fieldError.getDefaultMessage(),
                fieldError.getRejectedValue()
        );
    }

    /**
     * 根据 FieldError 确定错误代码
     */
    private String determineErrorCode(FieldError fieldError) {
        String code = fieldError.getCode();
        if (code == null) {
            return "VALIDATION_ERROR";
        }

        // 转换常见的 JSR-303 验证注解错误码
        switch (code) {
            case "NotNull":
            case "NotEmpty":
            case "NotBlank":
                return "REQUIRED";
            case "Min":
            case "DecimalMin":
                return "MIN_VALUE";
            case "Max":
            case "DecimalMax":
                return "MAX_VALUE";
            case "Size":
                return "INVALID_LENGTH";
            case "Email":
                return "INVALID_EMAIL";
            case "Pattern":
                return "INVALID_FORMAT";
            default:
                return code.toUpperCase();
        }
    }
}
