package org.ruikun.modules.inventory.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.inventory.entity.Inventory;
import org.ruikun.modules.inventory.entity.InventoryLog;
import org.ruikun.modules.inventory.mapper.InventoryLogMapper;
import org.ruikun.modules.inventory.mapper.InventoryMapper;
import org.ruikun.modules.product.entity.Product;
import org.ruikun.modules.product.mapper.ProductMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements IInventoryService {

    private final InventoryMapper inventoryMapper;
    private final InventoryLogMapper inventoryLogMapper;
    private final ProductMapper productMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long productId, Integer quantity, Long orderId) {
        Inventory inventory = getByProductId(productId);
        if (inventory == null) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品库存记录不存在");
        }

        int beforeAvailable = inventory.getAvailableStock();
        int rows = inventoryMapper.lockStock(productId, quantity, inventory.getVersion());
        if (rows == 0) {
            throw new BusinessException(ResponseCode.PRODUCT_OUT_OF_STOCK, "商品库存不足");
        }

        logInventoryChange(productId, orderId, "ORDER_LOCK", quantity, beforeAvailable, beforeAvailable - quantity, "订单锁定库存");
        syncProductStock(productId, beforeAvailable - quantity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseLockedStock(Long productId, Integer quantity, Long orderId) {
        Inventory inventory = getByProductId(productId);
        if (inventory == null) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品库存记录不存在");
        }

        int beforeAvailable = inventory.getAvailableStock();
        int rows = inventoryMapper.releaseLockedStock(productId, quantity, inventory.getVersion());
        if (rows == 0) {
            throw new BusinessException(ResponseCode.ERROR, "释放库存失败，锁定库存不足");
        }

        logInventoryChange(productId, orderId, "ORDER_RELEASE", quantity, beforeAvailable, beforeAvailable + quantity, "订单释放库存");
        syncProductStock(productId, beforeAvailable + quantity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmSoldStock(Long productId, Integer quantity, Long orderId) {
        Inventory inventory = getByProductId(productId);
        if (inventory == null) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品库存记录不存在");
        }

        int beforeAvailable = inventory.getAvailableStock();
        int rows = inventoryMapper.confirmSoldStock(productId, quantity, inventory.getVersion());
        if (rows == 0) {
            throw new BusinessException(ResponseCode.ERROR, "确认已售库存失败，锁定库存不足");
        }

        logInventoryChange(productId, orderId, "PAYMENT_CONFIRM", quantity, beforeAvailable, beforeAvailable, "支付确认已售");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void adjustStock(Long productId, Integer quantity, String remark) {
        Inventory inventory = getByProductId(productId);
        if (inventory == null) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品库存记录不存在");
        }

        int beforeAvailable = inventory.getAvailableStock();
        int rows = inventoryMapper.adjustStock(productId, quantity, inventory.getVersion());
        if (rows == 0) {
            throw new BusinessException(ResponseCode.ERROR, "库存调整失败，可售库存不足");
        }

        logInventoryChange(productId, null, "ADMIN_ADJUST", quantity, beforeAvailable, beforeAvailable + quantity, remark);
        syncProductStock(productId, beforeAvailable + quantity);
    }

    @Override
    public void setStock(Long productId, Integer newTotalStock, String remark) {
        Inventory inventory = getByProductId(productId);
        if (inventory == null) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品库存记录不存在");
        }

        int delta = newTotalStock - inventory.getTotalStock();
        if (delta == 0) {
            return;
        }
        adjustStock(productId, delta, remark);
    }

    @Override
    public Inventory getByProductId(Long productId) {
        return inventoryMapper.selectOne(
                new LambdaQueryWrapper<Inventory>().eq(Inventory::getProductId, productId)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void initializeInventory(Long productId, Integer stock) {
        Inventory existing = getByProductId(productId);
        if (existing != null) {
            return;
        }

        Inventory inventory = new Inventory();
        inventory.setProductId(productId);
        inventory.setTotalStock(stock);
        inventory.setAvailableStock(stock);
        inventory.setLockedStock(0);
        inventory.setSoldStock(0);
        inventory.setVersion(0);
        inventoryMapper.insert(inventory);

        logInventoryChange(productId, null, "INITIALIZE", stock, 0, stock, "初始化库存记录");
    }

    private void logInventoryChange(Long productId, Long orderId, String changeType,
                                    Integer quantity, Integer beforeAvailable,
                                    Integer afterAvailable, String remark) {
        InventoryLog log = new InventoryLog();
        log.setProductId(productId);
        log.setOrderId(orderId);
        log.setChangeType(changeType);
        log.setChangeQuantity(quantity);
        log.setBeforeAvailable(beforeAvailable);
        log.setAfterAvailable(afterAvailable);
        log.setRemark(remark);
        inventoryLogMapper.insert(log);
    }

    private void syncProductStock(Long productId, Integer availableStock) {
        Product update = new Product();
        update.setId(productId);
        update.setStock(availableStock);
        productMapper.updateById(update);
    }
}
