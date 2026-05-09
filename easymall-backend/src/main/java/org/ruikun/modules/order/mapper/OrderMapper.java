package org.ruikun.modules.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.modules.order.entity.Order;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {
}