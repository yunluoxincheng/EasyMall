package org.ruikun.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.entity.Order;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {
}