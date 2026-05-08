package org.ruikun.util;

import org.slf4j.MDC;

import java.util.UUID;

/**
 * TraceId 工具类
 * 用于生成和管理请求追踪 ID
 */
public class TraceIdUtil {

    private static final String TRACE_ID_KEY = "traceId";

    /**
     * 获取或创建 TraceId
     * 如果当前线程已有 TraceId 则返回，否则创建新的
     *
     * @return 16 位 TraceId
     */
    public static String getOrCreate() {
        String traceId = MDC.get(TRACE_ID_KEY);
        if (traceId == null) {
            traceId = generate();
            MDC.put(TRACE_ID_KEY, traceId);
        }
        return traceId;
    }

    /**
     * 生成新的 TraceId
     *
     * @return 16 位 TraceId（UUID 去掉横线后取前16位）
     */
    public static String generate() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    /**
     * 设置 TraceId
     *
     * @param traceId 要设置的 TraceId
     */
    public static void set(String traceId) {
        MDC.put(TRACE_ID_KEY, traceId);
    }

    /**
     * 清除当前线程的 TraceId
     */
    public static void clear() {
        MDC.remove(TRACE_ID_KEY);
    }

    /**
     * 获取当前线程的 TraceId（不创建新的）
     *
     * @return 当前 TraceId，如果不存在则返回 null
     */
    public static String get() {
        return MDC.get(TRACE_ID_KEY);
    }
}
