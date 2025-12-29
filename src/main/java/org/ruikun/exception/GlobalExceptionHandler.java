package org.ruikun.exception;

import jakarta.servlet.http.HttpServletResponse;
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
    public void handleBusinessException(BusinessException e, HttpServletResponse response) throws IOException {
        logger.error("业务异常：{}", e.getMessage());

        response.setStatus(e.getResponseCode().getHttpStatus());
        response.setContentType("application/json;charset=UTF-8");

        Result<Void> result = Result.error(e.getResponseCode());

        // 如果异常包含错误详情，填充 errors 数组
        if (e.getErrors() != null && !e.getErrors().isEmpty()) {
            result.setErrors(e.getErrors());
        }

        response.getWriter().write(convertToJson(result));
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public void handleValidException(MethodArgumentNotValidException e, HttpServletResponse response) throws IOException {
        logger.error("参数校验异常：{}", e.getMessage());

        List<ErrorDetail> errors = e.getBindingResult().getFieldErrors().stream()
                .map(this::convertToErrorDetail)
                .collect(Collectors.toList());

        response.setStatus(ResponseCode.VALIDATION_ERROR.getHttpStatus());
        response.setContentType("application/json;charset=UTF-8");

        Result<?> result = Result.error(ResponseCode.VALIDATION_ERROR, errors);
        response.getWriter().write(convertToJson(result));
    }

    /**
     * 处理系统异常
     */
    @ExceptionHandler(Exception.class)
    public void handleException(Exception e, HttpServletResponse response) throws IOException {
        logger.error("系统异常：", e);

        response.setStatus(ResponseCode.ERROR.getHttpStatus());
        response.setContentType("application/json;charset=UTF-8");

        Result<?> result = Result.error(ResponseCode.ERROR, "系统异常，请联系管理员");
        response.getWriter().write(convertToJson(result));
    }

    /**
     * 将 Result 对象转换为 JSON 字符串
     */
    private String convertToJson(Result<?> result) {
        StringBuilder json = new StringBuilder("{");
        json.append("\"success\":").append(result.getSuccess()).append(",");
        json.append("\"code\":\"").append(result.getCode()).append("\",");
        json.append("\"message\":\"").append(escapeJson(result.getMessage())).append("\",");
        json.append("\"timestamp\":\"").append(result.getTimestamp()).append("\",");
        json.append("\"traceId\":\"").append(result.getTraceId()).append("\"");

        if (result.getData() != null) {
            json.append(",\"data\":").append(result.getData());
        }

        if (result.getErrors() != null && !result.getErrors().isEmpty()) {
            json.append(",\"errors\":[");
            List<ErrorDetail> errors = result.getErrors();
            for (int i = 0; i < errors.size(); i++) {
                if (i > 0) json.append(",");
                ErrorDetail error = errors.get(i);
                json.append("{");
                json.append("\"field\":\"").append(error.getField()).append("\",");
                json.append("\"code\":\"").append(error.getCode()).append("\",");
                json.append("\"message\":\"").append(escapeJson(error.getMessage())).append("\",");
                json.append("\"rejectedValue\":\"").append(error.getRejectedValue()).append("\"");
                json.append("}");
            }
            json.append("]");
        }

        json.append("}");
        return json.toString();
    }

    /**
     * 转义 JSON 字符串中的特殊字符
     */
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
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
