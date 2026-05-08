package org.ruikun.service;

import org.ruikun.enums.ImageType;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件存储服务接口
 */
public interface FileStorageService {

    /**
     * 保存单个文件
     *
     * @param file 上传的文件
     * @param type 图片类型
     * @return 完整访问 URL
     */
    String saveFile(MultipartFile file, ImageType type);

    /**
     * 保存多个文件
     *
     * @param files 上传的文件数组
     * @param type  图片类型
     * @return 完整访问 URL 列表
     */
    java.util.List<String> saveFiles(MultipartFile[] files, ImageType type);

    /**
     * 删除文件
     *
     * @param relativePath 相对路径 (如: products/2024/01/uuid.jpg)
     */
    void deleteFile(String relativePath);

    /**
     * 根据相对路径获取完整 URL
     *
     * @param relativePath 相对路径
     * @return 完整 URL
     */
    String getUrl(String relativePath);

    /**
     * 验证文件
     *
     * @param file 上传的文件
     * @throws org.ruikun.exception.BusinessException 验证失败时抛出
     */
    void validateFile(MultipartFile file);
}
