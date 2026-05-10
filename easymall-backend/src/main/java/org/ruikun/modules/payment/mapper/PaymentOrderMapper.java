package org.ruikun.modules.payment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.ruikun.modules.payment.entity.PaymentOrder;

@Mapper
public interface PaymentOrderMapper extends BaseMapper<PaymentOrder> {
}
