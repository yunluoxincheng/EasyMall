package org.ruikun.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 多图上传响应 VO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultiImageUploadVO {

    /**
     * 图片 URL 列表
     */
    private List<String> urls;

    /**
     * 上传成功的图片数量
     */
    private Integer count;
}
