package org.ruikun.modules.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;
import org.ruikun.modules.order.entity.Order;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {

    @Update("UPDATE orders SET status = #{targetStatus}, update_time = NOW() " +
            "WHERE id = #{orderId} AND status = #{expectedStatus} AND deleted = 0")
    int casUpdateStatus(@Param("orderId") Long orderId,
                        @Param("expectedStatus") Integer expectedStatus,
                        @Param("targetStatus") Integer targetStatus);
}