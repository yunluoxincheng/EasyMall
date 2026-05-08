package org.ruikun.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ruikun.common.Result;
import org.ruikun.enums.ImageType;
import org.ruikun.service.FileStorageService;
import org.ruikun.vo.ImageUploadVO;
import org.ruikun.vo.MultiImageUploadVO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件上传控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    /**
     * 单图上传
     *
     * @param file 上传的文件
     * @param type 图片类型 (product | avatar)
     * @return 上传结果，包含图片 URL
     */
    @PostMapping("/image")
    public Result<ImageUploadVO> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {

        log.info("接收到文件上传请求: 文件名={}, 类型={}, 大小={}KB",
                file.getOriginalFilename(), type, file.getSize() / 1024);

        // 转换图片类型
        ImageType imageType;
        try {
            imageType = ImageType.fromString(type);
        } catch (IllegalArgumentException e) {
            return Result.error("不支持的图片类型: " + type);
        }

        // 保存文件
        String url = fileStorageService.saveFile(file, imageType);

        // 构建响应
        ImageUploadVO vo = new ImageUploadVO(
                url,
                file.getOriginalFilename(),
                file.getSize(),
                extractRelativePath(url)
        );

        log.info("文件上传成功: {}", url);
        return Result.success("上传成功", vo);
    }

    /**
     * 多图上传
     *
     * @param files 上传的文件数组
     * @param type  图片类型 (product)
     * @return 上传结果，包含图片 URL 列表
     */
    @PostMapping("/images")
    public Result<MultiImageUploadVO> uploadImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("type") String type) {

        log.info("接收到多图上传请求: 文件数量={}, 类型={}", files.length, type);

        // 转换图片类型
        ImageType imageType;
        try {
            imageType = ImageType.fromString(type);
        } catch (IllegalArgumentException e) {
            return Result.error("不支持的图片类型: " + type);
        }

        // 保存文件
        var urls = fileStorageService.saveFiles(files, imageType);

        // 构建响应
        MultiImageUploadVO vo = new MultiImageUploadVO(urls, urls.size());

        log.info("多图上传成功: 上传了 {} 张图片", urls.size());
        return Result.success("成功上传 " + urls.size() + " 张图片", vo);
    }

    /**
     * 删除图片
     *
     * @param path 相对路径 (如: products/2024/01/uuid.jpg)
     * @return 删除结果
     */
    @DeleteMapping("/image")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> deleteImage(@RequestParam("path") String path) {
        log.info("接收到文件删除请求: 路径={}", path);

        fileStorageService.deleteFile(path);

        log.info("文件删除成功: {}", path);
        return Result.success("删除成功");
    }

    /**
     * 从完整 URL 中提取相对路径
     */
    private String extractRelativePath(String fullUrl) {
        String baseUrl = fileStorageService.getUrl("");
        if (fullUrl.startsWith(baseUrl)) {
            return fullUrl.substring(baseUrl.length() + 1);
        }
        return fullUrl;
    }
}
