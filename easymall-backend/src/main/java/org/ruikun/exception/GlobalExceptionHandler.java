package org.ruikun.exception;

import com.alibaba.fastjson2.JSON;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ErrorDetail;
import org.ruikun.common.ResponseCode;
import org.ruikun.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public void handleBusinessException(BusinessException e, HttpServletResponse response) throws IOException {
        logger.error("业务异常：{}", e.getMessage());

        response.setStatus(e.getResponseCode().getHttpStatus());
        response.setContentType("application/json;charset=UTF-8");

        Result<Void> result = Result.error(e.getResponseCode());

        if (e.getErrors() != null && !e.getErrors().isEmpty()) {
            result.setErrors(e.getErrors());
        }

        response.getWriter().write(JSON.toJSONString(result));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public void handleValidException(MethodArgumentNotValidException e, HttpServletResponse response) throws IOException {
        logger.error("参数校验异常：{}", e.getMessage());

        List<ErrorDetail> errors = e.getBindingResult().getFieldErrors().stream()
                .map(this::convertToErrorDetail)
                .collect(Collectors.toList());

        response.setStatus(ResponseCode.VALIDATION_ERROR.getHttpStatus());
        response.setContentType("application/json;charset=UTF-8");

        Result<?> result = Result.error(ResponseCode.VALIDATION_ERROR, errors);
        response.getWriter().write(JSON.toJSONString(result));
    }

    @ExceptionHandler(Exception.class)
    public void handleException(Exception e, HttpServletResponse response) throws IOException {
        logger.error("系统异常：", e);

        response.setStatus(ResponseCode.ERROR.getHttpStatus());
        response.setContentType("application/json;charset=UTF-8");

        Result<?> result = Result.error(ResponseCode.ERROR, "系统异常，请联系管理员");
        response.getWriter().write(JSON.toJSONString(result));
    }

    private ErrorDetail convertToErrorDetail(FieldError fieldError) {
        String code = determineErrorCode(fieldError);
        return new ErrorDetail(
                fieldError.getField(),
                code,
                fieldError.getDefaultMessage(),
                fieldError.getRejectedValue()
        );
    }

    private String determineErrorCode(FieldError fieldError) {
        String code = fieldError.getCode();
        if (code == null) {
            return "VALIDATION_ERROR";
        }

        return switch (code) {
            case "NotNull", "NotEmpty", "NotBlank" -> "REQUIRED";
            case "Min", "DecimalMin" -> "MIN_VALUE";
            case "Max", "DecimalMax" -> "MAX_VALUE";
            case "Size" -> "INVALID_LENGTH";
            case "Email" -> "INVALID_EMAIL";
            case "Pattern" -> "INVALID_FORMAT";
            default -> code.toUpperCase();
        };
    }
}