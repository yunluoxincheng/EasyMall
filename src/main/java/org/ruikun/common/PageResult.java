package org.ruikun.common;

import lombok.Data;

import java.util.List;

@Data
public class PageResult<T> {
    private Long total;
    private List<T> records;
    private Integer pageNum;
    private Integer pageSize;
    private Integer pages;

    public PageResult(Long total, List<T> records, Integer pageNum, Integer pageSize) {
        this.total = total;
        this.records = records;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.pages = (int) Math.ceil((double) total / pageSize);
    }
}