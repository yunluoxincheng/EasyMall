package org.ruikun.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.dto.PointsExchangeDTO;
import org.ruikun.entity.PointsExchange;
import org.ruikun.entity.PointsProduct;
import org.ruikun.entity.User;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.PointsExchangeMapper;
import org.ruikun.mapper.PointsProductMapper;
import org.ruikun.mapper.UserMapper;
import org.ruikun.service.IPointsExchangeService;
import org.ruikun.service.IPointsService;
import org.ruikun.vo.PointsExchangeVO;
import org.ruikun.vo.PointsProductVO;
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
    private final org.ruikun.service.ICouponService couponService;

    @Override
    public List<PointsProductVO> getAvailableProducts(Long userId) {
        // 获取用户积分
        User user = userMapper.selectById(userId);
        Integer userPoints = (user != null) ? user.getPoints() : 0;

        // 查询所有上架的积分商品
        LambdaQueryWrapper<PointsProduct> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PointsProduct::getStatus, 1)
               .orderByAsc(PointsProduct::getSortOrder)
               .orderByDesc(PointsProduct::getCreateTime);

        List<PointsProduct> products = pointsProductMapper.selectList(wrapper);

        // 转换为VO并设置是否可兑换
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
        // 获取用户信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        // 获取兑换商品信息
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

        // 检查用户积分是否足够
        if (user.getPoints() < product.getPointsRequired()) {
            throw new BusinessException(ResponseCode.POINTS_INSUFFICIENT, "积分不足，当前积分：" + user.getPoints() + "，所需积分：" + product.getPointsRequired());
        }

        // 判断商品类型：1-实物商品，2-优惠券
        Integer productType = product.getProductType() != null ? product.getProductType() : 1;

        if (productType == 2) {
            // 兑换优惠券
            if (product.getRelationId() == null) {
                throw new BusinessException(ResponseCode.VALIDATION_ERROR, "优惠券配置错误");
            }

            // 扣除积分
            pointsService.deductPoints(userId, product.getPointsRequired(),
                    org.ruikun.enums.PointsTypeEnum.EXCHANGE.getCode(),
                    product.getId(), "兑换优惠券：" + product.getName());

            // 扣减库存
            product.setStock(product.getStock() - 1);
            product.setExchangeCount(product.getExchangeCount() + 1);
            pointsProductMapper.updateById(product);

            // 发放优惠券
            Long userCouponId = couponService.issueCoupon(userId, product.getRelationId());

            // 返回优惠券ID作为兑换编号
            return "CPN" + userCouponId;
        } else {
            // 兑换实物商品（原有逻辑）
            // 扣除积分
            pointsService.deductPoints(userId, product.getPointsRequired(),
                    org.ruikun.enums.PointsTypeEnum.EXCHANGE.getCode(),
                    product.getId(), "兑换商品：" + product.getName());

            // 扣减库存
            product.setStock(product.getStock() - 1);
            product.setExchangeCount(product.getExchangeCount() + 1);
            pointsProductMapper.updateById(product);

            // 创建兑换记录
            PointsExchange exchange = new PointsExchange();
            exchange.setUserId(userId);
            exchange.setProductId(product.getId());
            exchange.setProductName(product.getName());
            exchange.setPointsUsed(product.getPointsRequired());
            exchange.setExchangeNo(generateExchangeNo());
            exchange.setStatus(0);
            exchange.setReceiverName(exchangeDTO.getReceiverName());
            exchange.setReceiverPhone(exchangeDTO.getReceiverPhone());
            exchange.setReceiverAddress(exchangeDTO.getReceiverAddress());
            exchange.setRemark(exchangeDTO.getRemark());
            pointsExchangeMapper.insert(exchange);

            return exchange.getExchangeNo();
        }
    }

    @Override
    public Page<PointsExchangeVO> getExchangeRecords(Long userId, Integer pageNum, Integer pageSize) {
        Page<PointsExchange> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<PointsExchange> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PointsExchange::getUserId, userId)
               .orderByDesc(PointsExchange::getCreateTime);

        Page<PointsExchange> exchangePage = pointsExchangeMapper.selectPage(page, wrapper);

        // 转换为VO
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

    /**
     * 生成兑换单号
     */
    private String generateExchangeNo() {
        return "EXG" + System.currentTimeMillis();
    }

    /**
     * 转换为VO
     */
    private PointsExchangeVO convertToVO(PointsExchange exchange) {
        PointsExchangeVO vo = new PointsExchangeVO();
        BeanUtils.copyProperties(exchange, vo);
        vo.setStatusText(getStatusText(exchange.getStatus()));
        return vo;
    }

    /**
     * 获取状态描述
     */
    private String getStatusText(Integer status) {
        switch (status) {
            case 0: return "待发货";
            case 1: return "已发货";
            case 2: return "已完成";
            default: return "未知状态";
        }
    }
}
