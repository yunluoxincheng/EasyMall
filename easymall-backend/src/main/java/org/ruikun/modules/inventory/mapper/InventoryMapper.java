package org.ruikun.modules.inventory.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.ruikun.modules.inventory.entity.Inventory;

@Mapper
public interface InventoryMapper extends BaseMapper<Inventory> {

    int lockStock(@Param("productId") Long productId,
                  @Param("quantity") Integer quantity,
                  @Param("version") Integer version);

    int releaseLockedStock(@Param("productId") Long productId,
                           @Param("quantity") Integer quantity,
                           @Param("version") Integer version);

    int confirmSoldStock(@Param("productId") Long productId,
                         @Param("quantity") Integer quantity,
                         @Param("version") Integer version);

    int adjustStock(@Param("productId") Long productId,
                    @Param("quantity") Integer quantity,
                    @Param("version") Integer version);
}
