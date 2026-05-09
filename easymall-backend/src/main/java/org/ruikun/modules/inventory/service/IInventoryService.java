package org.ruikun.modules.inventory.service;

import org.ruikun.modules.inventory.entity.Inventory;

public interface IInventoryService {

    void lockStock(Long productId, Integer quantity, Long orderId);

    void releaseLockedStock(Long productId, Integer quantity, Long orderId);

    void confirmSoldStock(Long productId, Integer quantity, Long orderId);

    void adjustStock(Long productId, Integer quantity, String remark);

    void setStock(Long productId, Integer newTotalStock, String remark);

    Inventory getByProductId(Long productId);

    void initializeInventory(Long productId, Integer stock);
}
