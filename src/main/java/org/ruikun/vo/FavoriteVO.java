package org.ruikun.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品收藏VO
 */
@Data
public class FavoriteVO {
    /**
     * 收藏ID
     */
    private Long id;

    /**
     * 商品ID
     */
    private Long productId;

    /**
     * 商品名称
     */
    private String productName;

    /**
     * 商品图片
     */
    private String productImage;

    /**
     * 商品价格
     */
    private BigDecimal productPrice;

    /**
     * 商品库存
     */
    private Integer productStock;

    /**
     * 收藏时间
     */
    private LocalDateTime createTime;

    /**
     * 是否收藏
     */
    private Boolean isFavorite;
}
