package org.ruikun.modules.points.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.ruikun.enums.PointsBizType;
import org.ruikun.modules.points.entity.PointsRecord;
import org.ruikun.modules.points.vo.PointsRecordVO;

/**
 * 积分服务接口
 */
public interface IPointsService {

    /**
     * 幂等增加积分（先写 ledger guard 再改余额）
     * DuplicateKeyException 不在本方法内捕获，由调用方决定处理策略
     */
    void addPointsIdempotent(Long userId, Integer points, PointsBizType bizType, String bizId, String description);

    /**
     * 幂等扣减积分（先校验余额，再写 ledger guard，最后改余额）
     * DuplicateKeyException 不在本方法内捕获，由调用方决定处理策略
     */
    void deductPointsIdempotent(Long userId, Integer points, PointsBizType bizType, String bizId, String description);

    /**
     * 增加积分
     *
     * @deprecated 使用 {@link #addPointsIdempotent} 替代
     */
    @Deprecated
    void addPoints(Long userId, Integer points, Integer type, Long sourceId, String description);

    /**
     * 扣减积分
     *
     * @deprecated 使用 {@link #deductPointsIdempotent} 替代
     */
    @Deprecated
    void deductPoints(Long userId, Integer points, Integer type, Long sourceId, String description);

    /**
     * 分页查询积分记录
     */
    Page<PointsRecordVO> getPointsRecords(Long userId, Integer pageNum, Integer pageSize);

    /**
     * 增加或扣减积分（便捷方法，用于后台管理）
     *
     * @deprecated 使用 {@link #addPointsIdempotent} 或 {@link #deductPointsIdempotent} 替代
     */
    @Deprecated
    void addPoints(Long userId, Integer points, String description);

    /**
     * 订单完成后增加积分
     *
     * @param userId  用户ID
     * @param orderId 订单ID
     * @param amount  订单金额
     */
    void addPointsForOrder(Long userId, Long orderId, Double amount);

    /**
     * 评价商品后增加积分
     *
     * @param userId    用户ID
     * @param orderId   订单ID
     * @param productId 商品ID
     */
    void addPointsForComment(Long userId, Long orderId, Long productId);
}
