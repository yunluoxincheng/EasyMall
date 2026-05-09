package org.ruikun.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 错误详情类
 * 用于结构化地描述单个字段或单个错误的详细信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorDetail {

    /**
     * 出错的字段名（可选，用于参数校验错误）
     */
    private String field;

    /**
     * 错误代码（如 "NOT_NULL", "MIN", "EMAIL" 等）
     */
    private String code;

    /**
     * 错误消息描述
     */
    private String message;

    /**
     * 被拒绝的值（用户输入的实际值，便于调试）
     */
    private Object rejectedValue;

    /**
     * 简化构造函数：仅错误代码和消息
     */
    public ErrorDetail(String code, String message) {
        this.code = code;
        this.message = message;
    }

    /**
     * 简化构造函数：字段名、错误代码和消息
     */
    public ErrorDetail(String field, String code, String message) {
        this.field = field;
        this.code = code;
        this.message = message;
    }
}
