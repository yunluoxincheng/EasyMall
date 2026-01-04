package org.ruikun.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "file.upload")
public class FileUploadProperties {

    /**
     * 基础存储路径(服务器绝对路径)
     */
    private String basePath = "/data/easymall/uploads";

    /**
     * 访问基础 URL
     */
    private String baseUrl = "http://103.40.14.112/uploads";

    /**
     * 单个文件最大大小(字节)
     */
    private Long maxSize = 5242880L; // 5MB

    /**
     * 允许的文件类型(MIME 类型)
     */
    private List<String> allowedTypes;
}
