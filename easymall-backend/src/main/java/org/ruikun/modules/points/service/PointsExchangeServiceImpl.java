package org.ruikun.modules.points.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.PointsBizType;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.points.dto.PointsExchangeDTO;
import org.ruikun.modules.points.entity.PointsExchange;
import org.ruikun.modules.points.entity.PointsProduct;
import org.ruikun.modules.points.mapper.PointsExchangeMapper;
import org.ruikun.modules.points.mapper.PointsProductMapper;
import org.ruikun.modules.points.vo.PointsExchangeVO;
import org.ruikun.modules.points.vo.PointsProductVO;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.user.mapper.UserMapper;
import cn.hutool.core.util.IdUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 积分兑换服务实现类
 */
@Service
@RequiredArgsConstructor
public class PointsExchangeServiceImpl implements IPointsExchangeService {

    private final PointsProductMapper pointsProductMapper;
    private final PointsExchangeMapper pointsExchangeMapper;
    private final UserMapper userMapper;
    private final IPointsService pointsService;
    private final org.ruikun.modules.coupon.service.ICouponService couponService;

    @Override
    public List<PointsProductVO> getAvailableProducts(Long userId) {
        User user = userMapper.selectById(userId);
        Integer userPoints = (user != null) ? user.getPoints() : 0;

        LambdaQueryWrapper<PointsProduct> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PointsProduct::getStatus, 1)
               .orderByAsc(PointsProduct::getSortOrder)
               .orderByDesc(PointsProduct::getCreateTime);

        List<PointsProduct> products = pointsProductMapper.selectList(wrapper);

        return products.stream().map(product -> {
            PointsProductVO vo = new PointsProductVO();
            BeanUtils.copyProperties(product, vo);
            vo.setCanExchange(userPoints >= product.getPointsRequired() && product.getStock() > 0);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String exchangeProduct(Long userId, PointsExchangeDTO exchangeDTO) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        PointsProduct product = pointsProductMapper.selectById(exchangeDTO.getProductId());
        if (product == null) {
            throw new BusinessException(ResponseCode.PRODUCT_NOT_FOUND, "商品不存在");
        }
        if (product.getStatus() != 1) {
            throw new BusinessException(ResponseCode.PRODUCT_SHELF_ERROR, "商品已下架");
        }
        if (product.getStock() <= 0) {
            throw new BusinessException(ResponseCode.POINTS_PRODUCT_OUT_OF_STOCK, "商品库存不足");
        }
        if (user.getPoints() < product.getPointsRequired()) {
            throw new BusinessException(ResponseCode.POINTS_INSUFFICIENT,
                    "积分不足，当前积分：" + user.getPoints() + "，所需积分：" + product.getPointsRequired());
        }

        Integer productType = product.getProductType() != null ? product.getProductType() : 1;

        // 先生成稳定的 exchangeNo 并创建兑换记录
        String exchangeNo = generateExchangeNo();

        PointsExchange exchange = new PointsExchange();
        exchange.setUserId(userId);
        exchange.setProductId(product.getId());
        exchange.setProductName(product.getName());
        exchange.setPointsUsed(product.getPointsRequired());
        exchange.setExchangeNo(exchangeNo);
        exchange.setStatus(0);
        pointsExchangeMapper.insert(exchange);

        if (productType == 2) {
            // 优惠券兑换
            if (product.getRelationId() == null) {
                throw new BusinessException(ResponseCode.VALIDATION_ERROR, "优惠券配置错误");
            }

            // 扣除积分（幂等方法，兑换流水级幂等）
            pointsService.deductPointsIdempotent(userId, product.getPointsRequired(),
                    PointsBizType.POINTS_EXCHANGE, "exchange:" + exchangeNo,
                    "兑换优惠券：" + product.getName());

            // 扣减库存
            product.setStock(product.getStock() - 1);
            product.setExchangeCount(product.getExchangeCount() + 1);
            pointsProductMapper.updateById(product);

            // 发放优惠券
            Long userCouponId = couponService.issueCoupon(userId, product.getRelationId());

            // 更新兑换记录备注
            exchange.setRemark("优惠券ID：" + userCouponId);
            pointsExchangeMapper.updateById(exchange);
        } else {
            // 实物兑换
            pointsService.deductPointsIdempotent(userId, product.getPointsRequired(),
                    PointsBizType.POINTS_EXCHANGE, "exchange:" + exchangeNo,
                    "兑换商品：" + product.getName());

            // 扣减库存
            product.setStock(product.getStock() - 1);
            product.setExchangeCount(product.getExchangeCount() + 1);
            pointsProductMapper.updateById(product);

            // 更新收货信息
            exchange.setReceiverName(exchangeDTO.getReceiverName());
            exchange.setReceiverPhone(exchangeDTO.getReceiverPhone());
            exchange.setReceiverAddress(exchangeDTO.getReceiverAddress());
            exchange.setRemark(exchangeDTO.getRemark());
            pointsExchangeMapper.updateById(exchange);
        }

        return exchangeNo;
    }

    @Override
    public Page<PointsExchangeVO> getExchangeRecords(Long userId, Integer pageNum, Integer pageSize) {
        Page<PointsExchange> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<PointsExchange> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PointsExchange::getUserId, userId)
               .orderByDesc(PointsExchange::getCreateTime);

        Page<PointsExchange> exchangePage = pointsExchangeMapper.selectPage(page, wrapper);

        Page<PointsExchangeVO> voPage = new Page<>();
        BeanUtils.copyProperties(exchangePage, voPage, "records");

        List<PointsExchangeVO> voList = exchangePage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    @Override
    public PointsExchangeVO getExchangeDetail(Long userId, Long exchangeId) {
        PointsExchange exchange = pointsExchangeMapper.selectById(exchangeId);
        if (exchange == null || !exchange.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCode.POINTS_PRODUCT_NOT_FOUND, "兑换记录不存在");
        }
        return convertToVO(exchange);
    }

    private String generateExchangeNo() {
        return "EXG" + IdUtil.getSnowflakeNextIdStr();
    }

    private PointsExchangeVO convertToVO(PointsExchange exchange) {
        PointsExchangeVO vo = new PointsExchangeVO();
        BeanUtils.copyProperties(exchange, vo);
        vo.setStatusText(getStatusText(exchange.getStatus()));
        return vo;
    }

    private String getStatusText(Integer status) {
        switch (status) {
            case 0: return "待发货";
            case 1: return "已发货";
            case 2: return "已完成";
            default: return "未知状态";
        }
    }
}
