package org.ruikun.common;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PageRequest {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String keyword;
    private Long categoryId;
    private String brand;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer status;
    private String sortBy;
    private String sortOrder = "asc";

    public Integer getOffset() {
        return (pageNum - 1) * pageSize;
    }
}
