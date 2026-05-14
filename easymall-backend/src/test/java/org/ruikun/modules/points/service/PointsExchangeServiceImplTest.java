package org.ruikun.modules.points.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.PointsBizType;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.points.dto.PointsExchangeDTO;
import org.ruikun.modules.points.entity.PointsExchange;
import org.ruikun.modules.points.entity.PointsProduct;
import org.ruikun.modules.points.mapper.PointsExchangeMapper;
import org.ruikun.modules.points.mapper.PointsProductMapper;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.user.mapper.UserMapper;
import org.ruikun.modules.coupon.service.ICouponService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PointsExchangeServiceImplTest {

    @Mock private PointsProductMapper pointsProductMapper;
    @Mock private PointsExchangeMapper pointsExchangeMapper;
    @Mock private UserMapper userMapper;
    @Mock private IPointsService pointsService;
    @Mock private ICouponService couponService;
    @Captor private ArgumentCaptor<PointsExchange> exchangeCaptor;

    private PointsExchangeServiceImpl exchangeService;

    @BeforeEach
    void setUp() {
        exchangeService = new PointsExchangeServiceImpl(
                pointsProductMapper, pointsExchangeMapper, userMapper, pointsService, couponService);
    }

    private User buildUser(Long id, int points) {
        User user = new User();
        user.setId(id);
        user.setPoints(points);
        return user;
    }

    private PointsProduct buildProduct(Long id, int pointsRequired, int stock) {
        PointsProduct product = new PointsProduct();
        product.setId(id);
        product.setName("测试商品");
        product.setPointsRequired(pointsRequired);
        product.setStock(stock);
        product.setStatus(1);
        product.setProductType(1);
        product.setExchangeCount(0);
        return product;
    }

    @Nested
    @DisplayName("exchangeProduct idempotency")
    class ExchangeProductIdempotency {

        @Test
        @DisplayName("6.7 兑换使用稳定 exchangeNo 的幂等行为 — 正常兑换成功")
        void exchangeSucceeds() {
            User user = buildUser(1L, 200);
            PointsProduct product = buildProduct(10L, 100, 5);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsProductMapper.selectById(10L)).thenReturn(product);
            when(pointsExchangeMapper.insert(any(PointsExchange.class))).thenReturn(1);
            when(pointsProductMapper.updateById(any(PointsProduct.class))).thenReturn(1);

            PointsExchangeDTO dto = new PointsExchangeDTO();
            dto.setProductId(10L);
            dto.setReceiverName("张三");
            dto.setReceiverPhone("13800000000");
            dto.setReceiverAddress("北京市");

            String exchangeNo = exchangeService.exchangeProduct(1L, dto);

            assertNotNull(exchangeNo);
            assertTrue(exchangeNo.startsWith("EXG"));

            verify(pointsExchangeMapper).insert(exchangeCaptor.capture());
            assertEquals(exchangeNo, exchangeCaptor.getValue().getExchangeNo());

            verify(pointsService).deductPointsIdempotent(
                    eq(1L), eq(100), eq(PointsBizType.POINTS_EXCHANGE),
                    eq("exchange:" + exchangeNo), anyString());
        }

        @Test
        @DisplayName("积分不足时抛出 BusinessException")
        void insufficientPointsThrowsException() {
            User user = buildUser(1L, 50);
            PointsProduct product = buildProduct(10L, 100, 5);
            when(userMapper.selectById(1L)).thenReturn(user);
            when(pointsProductMapper.selectById(10L)).thenReturn(product);

            PointsExchangeDTO dto = new PointsExchangeDTO();
            dto.setProductId(10L);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> exchangeService.exchangeProduct(1L, dto));

            assertEquals(ResponseCode.POINTS_INSUFFICIENT, ex.getResponseCode());
        }
    }
}
