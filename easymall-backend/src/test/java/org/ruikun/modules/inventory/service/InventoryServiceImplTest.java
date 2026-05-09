package org.ruikun.modules.inventory.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.common.ResponseCode;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.inventory.entity.Inventory;
import org.ruikun.modules.inventory.entity.InventoryLog;
import org.ruikun.modules.inventory.mapper.InventoryLogMapper;
import org.ruikun.modules.inventory.mapper.InventoryMapper;
import org.ruikun.modules.product.entity.Product;
import org.ruikun.modules.product.mapper.ProductMapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private InventoryMapper inventoryMapper;

    @Mock
    private InventoryLogMapper inventoryLogMapper;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    @Captor
    private ArgumentCaptor<InventoryLog> logCaptor;

    @Captor
    private ArgumentCaptor<Inventory> inventoryCaptor;

    @Captor
    private ArgumentCaptor<Product> productCaptor;

    private Inventory createInventory(Long productId, int available, int locked, int sold, int total, int version) {
        Inventory inv = new Inventory();
        inv.setId(1L);
        inv.setProductId(productId);
        inv.setTotalStock(total);
        inv.setAvailableStock(available);
        inv.setLockedStock(locked);
        inv.setSoldStock(sold);
        inv.setVersion(version);
        return inv;
    }

    @Nested
    @DisplayName("lockStock - 锁定库存")
    class LockStock {

        @Test
        @DisplayName("库存充足时锁定成功")
        void lockStockSuccess() {
            Inventory inv = createInventory(1L, 100, 0, 0, 100, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.lockStock(1L, 3, 0)).thenReturn(1);
            when(inventoryLogMapper.insert(any(InventoryLog.class))).thenReturn(1);
            when(productMapper.updateById(any(Product.class))).thenReturn(1);

            inventoryService.lockStock(1L, 3, 100L);

            verify(inventoryMapper).lockStock(1L, 3, 0);

            verify(inventoryLogMapper).insert(logCaptor.capture());
            InventoryLog log = logCaptor.getValue();
            assertEquals(1L, log.getProductId());
            assertEquals("ORDER_LOCK", log.getChangeType());
            assertEquals(3, log.getChangeQuantity());
            assertEquals(100, log.getBeforeAvailable());
            assertEquals(97, log.getAfterAvailable());

            verify(productMapper).updateById(productCaptor.capture());
            assertEquals(97, productCaptor.getValue().getStock());
        }

        @Test
        @DisplayName("库存不足时锁定失败")
        void lockStockInsufficient() {
            Inventory inv = createInventory(1L, 2, 0, 0, 2, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.lockStock(1L, 5, 0)).thenReturn(0);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> inventoryService.lockStock(1L, 5, 100L));
            assertEquals(ResponseCode.PRODUCT_OUT_OF_STOCK, ex.getResponseCode());
        }

        @Test
        @DisplayName("库存记录不存在时抛出异常")
        void lockStockNotFound() {
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> inventoryService.lockStock(999L, 1, 100L));
            assertEquals(ResponseCode.PRODUCT_NOT_FOUND, ex.getResponseCode());
        }
    }

    @Nested
    @DisplayName("releaseLockedStock - 释放锁定库存")
    class ReleaseLockedStock {

        @Test
        @DisplayName("释放库存成功")
        void releaseSuccess() {
            Inventory inv = createInventory(1L, 97, 3, 0, 100, 1);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.releaseLockedStock(1L, 3, 1)).thenReturn(1);
            when(inventoryLogMapper.insert(any(InventoryLog.class))).thenReturn(1);
            when(productMapper.updateById(any(Product.class))).thenReturn(1);

            inventoryService.releaseLockedStock(1L, 3, 100L);

            verify(inventoryLogMapper).insert(logCaptor.capture());
            assertEquals("ORDER_RELEASE", logCaptor.getValue().getChangeType());
            assertEquals(97, logCaptor.getValue().getBeforeAvailable());
            assertEquals(100, logCaptor.getValue().getAfterAvailable());
        }

        @Test
        @DisplayName("重复释放失败 - 锁定库存已为0")
        void releaseDuplicateFails() {
            Inventory inv = createInventory(1L, 100, 0, 0, 100, 2);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.releaseLockedStock(1L, 3, 2)).thenReturn(0);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> inventoryService.releaseLockedStock(1L, 3, 100L));
            assertEquals(ResponseCode.ERROR, ex.getResponseCode());
        }

        @Test
        @DisplayName("释放数量超过锁定库存时失败")
        void releaseExceedsLocked() {
            Inventory inv = createInventory(1L, 98, 2, 0, 100, 1);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.releaseLockedStock(1L, 5, 1)).thenReturn(0);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> inventoryService.releaseLockedStock(1L, 5, 100L));
            assertEquals(ResponseCode.ERROR, ex.getResponseCode());
        }
    }

    @Nested
    @DisplayName("confirmSoldStock - 确认已售库存")
    class ConfirmSoldStock {

        @Test
        @DisplayName("支付确认已售成功")
        void confirmSuccess() {
            Inventory inv = createInventory(1L, 97, 3, 0, 100, 1);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.confirmSoldStock(1L, 3, 1)).thenReturn(1);
            when(inventoryLogMapper.insert(any(InventoryLog.class))).thenReturn(1);

            inventoryService.confirmSoldStock(1L, 3, 100L);

            verify(inventoryLogMapper).insert(logCaptor.capture());
            assertEquals("PAYMENT_CONFIRM", logCaptor.getValue().getChangeType());
            assertEquals(97, logCaptor.getValue().getBeforeAvailable());
            assertEquals(97, logCaptor.getValue().getAfterAvailable());
            verify(productMapper, never()).updateById(any(Product.class));
        }

        @Test
        @DisplayName("确认数量超过锁定库存时失败")
        void confirmExceedsLocked() {
            Inventory inv = createInventory(1L, 95, 2, 3, 100, 1);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.confirmSoldStock(1L, 5, 1)).thenReturn(0);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> inventoryService.confirmSoldStock(1L, 5, 100L));
            assertEquals(ResponseCode.ERROR, ex.getResponseCode());
        }
    }

    @Nested
    @DisplayName("adjustStock - 调整库存")
    class AdjustStock {

        @Test
        @DisplayName("增加库存成功")
        void increaseStock() {
            Inventory inv = createInventory(1L, 100, 0, 0, 100, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.adjustStock(1L, 50, 0)).thenReturn(1);
            when(inventoryLogMapper.insert(any(InventoryLog.class))).thenReturn(1);
            when(productMapper.updateById(any(Product.class))).thenReturn(1);

            inventoryService.adjustStock(1L, 50, "管理员增加库存");

            verify(inventoryLogMapper).insert(logCaptor.capture());
            assertEquals("ADMIN_ADJUST", logCaptor.getValue().getChangeType());
            assertEquals(100, logCaptor.getValue().getBeforeAvailable());
            assertEquals(150, logCaptor.getValue().getAfterAvailable());
        }

        @Test
        @DisplayName("减少库存不超过可售库存时成功")
        void decreaseStockSuccess() {
            Inventory inv = createInventory(1L, 50, 0, 0, 50, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.adjustStock(1L, -10, 0)).thenReturn(1);
            when(inventoryLogMapper.insert(any(InventoryLog.class))).thenReturn(1);
            when(productMapper.updateById(any(Product.class))).thenReturn(1);

            inventoryService.adjustStock(1L, -10, "管理员减少库存");

            verify(inventoryLogMapper).insert(logCaptor.capture());
            assertEquals(-10, logCaptor.getValue().getChangeQuantity());
            assertEquals(40, logCaptor.getValue().getAfterAvailable());
        }

        @Test
        @DisplayName("减少库存超过可售库存时失败")
        void decreaseStockInsufficient() {
            Inventory inv = createInventory(1L, 50, 0, 0, 50, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.adjustStock(1L, -60, 0)).thenReturn(0);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> inventoryService.adjustStock(1L, -60, "减少库存"));
            assertEquals(ResponseCode.ERROR, ex.getResponseCode());
        }
    }

    @Nested
    @DisplayName("setStock - 绝对值设置库存")
    class SetStock {

        @Test
        @DisplayName("设置更大的库存值")
        void setStockIncrease() {
            Inventory inv = createInventory(1L, 100, 0, 0, 100, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.adjustStock(1L, 50, 0)).thenReturn(1);
            when(inventoryLogMapper.insert(any(InventoryLog.class))).thenReturn(1);
            when(productMapper.updateById(any(Product.class))).thenReturn(1);

            inventoryService.setStock(1L, 150, "管理员设置库存");

            verify(inventoryMapper).adjustStock(1L, 50, 0);
        }

        @Test
        @DisplayName("设置更小的库存值且可售库存充足")
        void setStockDecrease() {
            Inventory inv = createInventory(1L, 80, 0, 0, 100, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.adjustStock(1L, -30, 0)).thenReturn(1);
            when(inventoryLogMapper.insert(any(InventoryLog.class))).thenReturn(1);
            when(productMapper.updateById(any(Product.class))).thenReturn(1);

            inventoryService.setStock(1L, 70, "管理员设置库存");

            verify(inventoryMapper).adjustStock(1L, -30, 0);
        }

        @Test
        @DisplayName("设置相同值时不执行任何操作")
        void setStockSameValue() {
            Inventory inv = createInventory(1L, 100, 0, 0, 100, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);

            inventoryService.setStock(1L, 100, "无变化");

            verify(inventoryMapper, never()).adjustStock(anyLong(), anyInt(), anyInt());
        }

        @Test
        @DisplayName("设置更小的值但可售库存不足（locked_stock占用）时失败")
        void setStockInsufficientAvailable() {
            // total=100, available=20, locked=80 → setStock(50) means delta=-50, available would be -30
            Inventory inv = createInventory(1L, 20, 80, 0, 100, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.adjustStock(1L, -50, 0)).thenReturn(0);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> inventoryService.setStock(1L, 50, "管理员设置库存"));
            assertEquals(ResponseCode.ERROR, ex.getResponseCode());
        }
    }

    @Nested
    @DisplayName("库存变动流水记录验证")
    class InventoryLogVerification {

        @Test
        @DisplayName("锁定库存时记录完整的流水信息")
        void lockStockLogFields() {
            Inventory inv = createInventory(5L, 50, 0, 0, 50, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);
            when(inventoryMapper.lockStock(5L, 2, 0)).thenReturn(1);
            when(inventoryLogMapper.insert(any(InventoryLog.class))).thenReturn(1);
            when(productMapper.updateById(any(Product.class))).thenReturn(1);

            inventoryService.lockStock(5L, 2, 1001L);

            verify(inventoryLogMapper).insert(logCaptor.capture());
            InventoryLog log = logCaptor.getValue();
            assertEquals(5L, log.getProductId());
            assertEquals(1001L, log.getOrderId());
            assertEquals("ORDER_LOCK", log.getChangeType());
            assertEquals(2, log.getChangeQuantity());
            assertEquals(50, log.getBeforeAvailable());
            assertEquals(48, log.getAfterAvailable());
            assertNotNull(log.getRemark());
        }
    }

    @Nested
    @DisplayName("getByProductId - 查询库存")
    class GetByProductId {

        @Test
        @DisplayName("查询存在的商品库存")
        void getExisting() {
            Inventory inv = createInventory(1L, 100, 0, 0, 100, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);

            Inventory result = inventoryService.getByProductId(1L);

            assertNotNull(result);
            assertEquals(100, result.getAvailableStock());
        }

        @Test
        @DisplayName("查询不存在的商品库存返回 null")
        void getNotExisting() {
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

            Inventory result = inventoryService.getByProductId(999L);

            assertNull(result);
        }
    }

    @Nested
    @DisplayName("initializeInventory - 初始化库存记录")
    class InitializeInventory {

        @Test
        @DisplayName("新商品初始化库存成功")
        void initializeNew() {
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);
            when(inventoryMapper.insert(any(Inventory.class))).thenReturn(1);
            when(inventoryLogMapper.insert(any(InventoryLog.class))).thenReturn(1);

            inventoryService.initializeInventory(1L, 100);

            verify(inventoryMapper).insert(inventoryCaptor.capture());
            Inventory inserted = inventoryCaptor.getValue();
            assertEquals(1L, inserted.getProductId());
            assertEquals(100, inserted.getTotalStock());
            assertEquals(100, inserted.getAvailableStock());
            assertEquals(0, inserted.getLockedStock());
            assertEquals(0, inserted.getSoldStock());
            assertEquals(0, inserted.getVersion());

            verify(inventoryLogMapper).insert(logCaptor.capture());
            assertEquals("INITIALIZE", logCaptor.getValue().getChangeType());
            assertEquals(100, logCaptor.getValue().getChangeQuantity());
        }

        @Test
        @DisplayName("已存在的商品不重复初始化")
        void initializeExisting() {
            Inventory inv = createInventory(1L, 100, 0, 0, 100, 0);
            when(inventoryMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(inv);

            inventoryService.initializeInventory(1L, 100);

            verify(inventoryMapper, never()).insert(any(Inventory.class));
        }
    }
}
