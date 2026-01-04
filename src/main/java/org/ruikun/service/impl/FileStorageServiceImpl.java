package org.ruikun.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.common.ResponseCode;
import org.ruikun.config.FileUploadProperties;
import org.ruikun.enums.ImageType;
import org.ruikun.exception.BusinessException;
import org.ruikun.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 文件存储服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private final FileUploadProperties fileUploadProperties;

    // 允许的文件扩展名
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");

    // 文件魔数(文件头)
    private static final List<String> IMAGE_MAGIC_NUMBERS = Arrays.asList(
            "FFD8FF", // JPEG
            "89504E470D0A1A0A", // PNG
            "47494638" // GIF
    );

    @Override
    public String saveFile(MultipartFile file, ImageType type) {
        // 验证文件
        validateFile(file);

        try {
            // 生成文件路径
            String relativePath = generateRelativePath(type);
            String filename = generateFilename(file.getOriginalFilename());
            String fullPath = fileUploadProperties.getBasePath() + "/" + relativePath;
            String completePath = fullPath + "/" + filename;

            // 确保目录存在
            File directory = new File(fullPath);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 保存文件
            Path targetPath = Paths.get(completePath);
            file.transferTo(targetPath.toFile());

            log.info("文件保存成功: {}", completePath);

            // 返回完整 URL
            return buildUrl(relativePath, filename);

        } catch (IOException e) {
            log.error("文件保存失败", e);
            throw new BusinessException(ResponseCode.FILE_UPLOAD_FAILED, "文件保存失败: " + e.getMessage());
        }
    }

    @Override
    public List<String> saveFiles(MultipartFile[] files, ImageType type) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            String url = saveFile(file, type);
            urls.add(url);
        }
        return urls;
    }

    @Override
    public void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) {
            throw new BusinessException(ResponseCode.FILE_NOT_FOUND, "文件路径不能为空");
        }

        String fullPath = fileUploadProperties.getBasePath() + "/" + relativePath;
        File file = new File(fullPath);

        if (!file.exists()) {
            throw new BusinessException(ResponseCode.FILE_NOT_FOUND, "文件不存在: " + relativePath);
        }

        if (file.delete()) {
            log.info("文件删除成功: {}", fullPath);
        } else {
            throw new BusinessException(ResponseCode.FILE_DELETE_FAILED, "文件删除失败: " + relativePath);
        }
    }

    @Override
    public String getUrl(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) {
            return null;
        }
        // 如果已经是完整 URL，直接返回
        if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
            return relativePath;
        }
        // 否则拼接完整 URL
        return fileUploadProperties.getBaseUrl() + "/" + relativePath;
    }

    @Override
    public void validateFile(MultipartFile file) {
        // 检查文件是否为空
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ResponseCode.FILE_EMPTY, "文件不能为空");
        }

        // 检查文件大小
        if (file.getSize() > fileUploadProperties.getMaxSize()) {
            throw new BusinessException(ResponseCode.FILE_TOO_LARGE,
                    "文件大小不能超过 " + (fileUploadProperties.getMaxSize() / 1024 / 1024) + "MB");
        }

        // 检查文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException(ResponseCode.INVALID_FILE_TYPE, "只支持图片文件");
        }

        // 检查文件扩展名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessException(ResponseCode.INVALID_FILE_TYPE, "文件名不能为空");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException(ResponseCode.INVALID_FILE_TYPE,
                    "只支持 " + String.join(", ", ALLOWED_EXTENSIONS) + " 格式");
        }

        // 检查文件内容(魔数)
        try {
            validateFileContent(file);
        } catch (IOException e) {
            throw new BusinessException(ResponseCode.INVALID_FILE_CONTENT, "文件内容验证失败");
        }
    }

    /**
     * 生成相对路径
     * 格式: {type}/{year}/{month}/
     */
    private String generateRelativePath(ImageType type) {
        YearMonth now = YearMonth.now();
        String year = String.valueOf(now.getYear());
        String month = String.format("%02d", now.getMonthValue());
        return type.getDirectory() + "/" + year + "/" + month;
    }

    /**
     * 生成文件名 (UUID + 扩展名)
     */
    private String generateFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString().replace("-", "") + "." + extension;
    }

    /**
     * 构建完整 URL
     */
    private String buildUrl(String relativePath, String filename) {
        return fileUploadProperties.getBaseUrl() + "/" + relativePath + "/" + filename;
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    /**
     * 验证文件内容(检查魔数)
     */
    private void validateFileContent(MultipartFile file) throws IOException {
        byte[] fileBytes = file.getBytes();

        // 读取文件头(前 8 字节)
        int headerLength = Math.min(fileBytes.length, 8);
        StringBuilder header = new StringBuilder();
        for (int i = 0; i < headerLength; i++) {
            header.append(String.format("%02X", fileBytes[i]));
        }

        String fileHeader = header.toString();

        // 检查是否匹配图片魔数
        boolean isValid = IMAGE_MAGIC_NUMBERS.stream()
                .anyMatch(magic -> fileHeader.startsWith(magic));

        if (!isValid) {
            throw new BusinessException(ResponseCode.INVALID_FILE_CONTENT, "文件内容不是有效的图片");
        }
    }
}
