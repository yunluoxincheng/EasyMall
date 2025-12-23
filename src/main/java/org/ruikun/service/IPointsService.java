package org.ruikun.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.ruikun.entity.PointsRecord;
import org.ruikun.vo.PointsRecordVO;

/**
 * 积分服务接口
 */
public interface IPointsService {

    /**
     * 增加积分
     *
     * @param userId       用户ID
     * @param points       积分值
     * @param type         类型 1-订单获得 2-评价获得 3-签到获得 4-系统赠送
     * @param sourceId     来源ID
     * @param description  描述
     */
    void addPoints(Long userId, Integer points, Integer type, Long sourceId, String description);

    /**
     * 扣减积分
     *
     * @param userId       用户ID
     * @param points       积分值
     * @param type         类型 5-兑换消耗 6-退款扣除
     * @param sourceId     来源ID
     * @param description  描述
     */
    void deductPoints(Long userId, Integer points, Integer type, Long sourceId, String description);

    /**
     * 分页查询积分记录
     */
    Page<PointsRecordVO> getPointsRecords(Long userId, Integer pageNum, Integer pageSize);

    /**
     * 增加或扣减积分（便捷方法，用于后台管理）
     *
     * @param userId       用户ID
     * @param points       积分值（正数为增加，负数为扣减）
     * @param description  描述
     */
    void addPoints(Long userId, Integer points, String description);

    /**
     * 订单完成后增加积分
     *
     * @param userId  用户ID
     * @param orderId 订单ID
     * @param amount  订单金额
     */
    void addPointsForOrder(Long userId, Long orderId, Double amount);
}
