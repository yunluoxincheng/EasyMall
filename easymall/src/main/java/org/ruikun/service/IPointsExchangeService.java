package org.ruikun.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.ruikun.dto.PointsExchangeDTO;
import org.ruikun.vo.PointsExchangeVO;
import org.ruikun.vo.PointsProductVO;

import java.util.List;

/**
 * 积分兑换服务接口
 */
public interface IPointsExchangeService {

    /**
     * 获取所有可兑换的商品列表
     *
     * @param userId 用户ID（用于判断是否可兑换）
     * @return 可兑换商品列表
     */
    List<PointsProductVO> getAvailableProducts(Long userId);

    /**
     * 兑换商品
     *
     * @param userId 用户ID
     * @param exchangeDTO 兑换信息
     * @return 兑换单号
     */
    String exchangeProduct(Long userId, PointsExchangeDTO exchangeDTO);

    /**
     * 分页查询用户的兑换记录
     *
     * @param userId 用户ID
     * @param pageNum 页码
     * @param pageSize 页大小
     * @return 兑换记录分页数据
     */
    Page<PointsExchangeVO> getExchangeRecords(Long userId, Integer pageNum, Integer pageSize);

    /**
     * 获取兑换详情
     *
     * @param userId 用户ID
     * @param exchangeId 兑换记录ID
     * @return 兑换详情
     */
    PointsExchangeVO getExchangeDetail(Long userId, Long exchangeId);
}
