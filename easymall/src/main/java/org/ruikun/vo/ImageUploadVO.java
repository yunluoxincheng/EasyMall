package org.ruikun.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 图片上传响应 VO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadVO {

    /**
     * 完整访问 URL
     */
    private String url;

    /**
     * 文件名
     */
    private String filename;

    /**
     * 文件大小(字节)
     */
    private Long size;

    /**
     * 相对路径
     */
    private String relativePath;
}
