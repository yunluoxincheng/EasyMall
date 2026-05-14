package org.ruikun.modules.points.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.enums.PointsBizType;
import org.ruikun.enums.PointsTypeEnum;
import org.ruikun.exception.BusinessException;
import org.ruikun.modules.points.entity.PointsRecord;
import org.ruikun.modules.points.mapper.PointsRecordMapper;
import org.ruikun.modules.points.vo.PointsRecordVO;
import org.ruikun.modules.user.entity.User;
import org.ruikun.modules.user.mapper.UserMapper;
import org.ruikun.modules.user.service.IMemberService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 积分服务实现类
 */
@Service
@RequiredArgsConstructor
public class PointsServiceImpl implements IPointsService {

    private final PointsRecordMapper pointsRecordMapper;
    private final UserMapper userMapper;
    private final IMemberService memberService;

    private static final int POINTS_PER_YUAN = 1;
    private static final int COMMENT_POINTS = 10;
    private static final int SIGN_BASE_POINTS = 5;
    private static final int[] SIGN_BONUS_POINTS = {0, 0, 5, 10, 15, 20};

    // ==================== 新幂等方法 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addPointsIdempotent(Long userId, Integer points, PointsBizType bizType, String bizId, String description) {
        if (points <= 0) {
            throw new BusinessException(ResponseCode.POINTS_VALUE_INVALID, "积分值必须大于0");
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        int beforePoints = user.getPoints();

        // 先 INSERT points_record（ledger guard），建立幂等约束
        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setPointsChange(points);
        record.setBeforePoints(beforePoints);
        record.setAfterPoints(beforePoints + points);
        record.setType(mapBizTypeToLegacyType(bizType));
        record.setDescription(description);
        record.setBizType(bizType.name());
        record.setBizId(bizId);
        pointsRecordMapper.insert(record);

        // 原子更新用户积分（防并发丢失更新）
        int affected = userMapper.atomicAddPoints(userId, points);
        if (affected == 0) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        memberService.checkAndUpgradeMember(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deductPointsIdempotent(Long userId, Integer points, PointsBizType bizType, String bizId, String description) {
        if (points <= 0) {
            throw new BusinessException(ResponseCode.POINTS_VALUE_INVALID, "积分值必须大于0");
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        int beforePoints = user.getPoints();
        if (beforePoints < points) {
            throw new BusinessException(ResponseCode.POINTS_INSUFFICIENT, "积分不足");
        }

        // 先 INSERT points_record（ledger guard），建立幂等约束
        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setPointsChange(-points);
        record.setBeforePoints(beforePoints);
        record.setAfterPoints(beforePoints - points);
        record.setType(mapBizTypeToLegacyType(bizType));
        record.setDescription(description);
        record.setBizType(bizType.name());
        record.setBizId(bizId);
        pointsRecordMapper.insert(record);

        // 原子扣减（WHERE points >= delta，防并发超扣）
        int affected = userMapper.atomicDeductPoints(userId, points);
        if (affected == 0) {
            throw new BusinessException(ResponseCode.POINTS_INSUFFICIENT, "积分不足");
        }

        memberService.checkAndUpgradeMember(userId);
    }

    // ==================== 旧方法（@Deprecated） ====================

    @Override
    @Deprecated
    @Transactional(rollbackFor = Exception.class)
    public void addPoints(Long userId, Integer points, Integer type, Long sourceId, String description) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }
        if (points <= 0) {
            throw new BusinessException(ResponseCode.POINTS_VALUE_INVALID, "积分值必须大于0");
        }

        Integer beforePoints = user.getPoints();
        user.setPoints(beforePoints + points);
        userMapper.updateById(user);

        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setPointsChange(points);
        record.setBeforePoints(beforePoints);
        record.setAfterPoints(beforePoints + points);
        record.setType(type);
        record.setSourceId(sourceId);
        record.setDescription(description);
        pointsRecordMapper.insert(record);

        memberService.checkAndUpgradeMember(userId);
    }

    @Override
    @Deprecated
    @Transactional(rollbackFor = Exception.class)
    public void deductPoints(Long userId, Integer points, Integer type, Long sourceId, String description) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }
        if (points <= 0) {
            throw new BusinessException(ResponseCode.POINTS_VALUE_INVALID, "积分值必须大于0");
        }
        if (user.getPoints() < points) {
            throw new BusinessException(ResponseCode.POINTS_INSUFFICIENT, "积分不足");
        }

        Integer beforePoints = user.getPoints();
        user.setPoints(beforePoints - points);
        userMapper.updateById(user);

        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setPointsChange(-points);
        record.setBeforePoints(beforePoints);
        record.setAfterPoints(beforePoints - points);
        record.setType(type);
        record.setSourceId(sourceId);
        record.setDescription(description);
        pointsRecordMapper.insert(record);

        memberService.checkAndUpgradeMember(userId);
    }

    @Override
    @Deprecated
    @Transactional(rollbackFor = Exception.class)
    public void addPoints(Long userId, Integer points, String description) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        Integer beforePoints = user.getPoints();

        if (points > 0) {
            user.setPoints(beforePoints + points);
            userMapper.updateById(user);

            PointsRecord record = new PointsRecord();
            record.setUserId(userId);
            record.setPointsChange(points);
            record.setBeforePoints(beforePoints);
            record.setAfterPoints(beforePoints + points);
            record.setType(4);
            record.setSourceId(0L);
            record.setDescription(description);
            pointsRecordMapper.insert(record);
        } else if (points < 0) {
            int deductAmount = -points;
            if (beforePoints < deductAmount) {
                throw new BusinessException(ResponseCode.POINTS_INSUFFICIENT, "积分不足");
            }
            user.setPoints(beforePoints - deductAmount);
            userMapper.updateById(user);

            PointsRecord record = new PointsRecord();
            record.setUserId(userId);
            record.setPointsChange(points);
            record.setBeforePoints(beforePoints);
            record.setAfterPoints(beforePoints - deductAmount);
            record.setType(6);
            record.setSourceId(0L);
            record.setDescription(description);
            pointsRecordMapper.insert(record);
        }

        memberService.checkAndUpgradeMember(userId);
    }

    // ==================== 业务方法 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addPointsForOrder(Long userId, Long orderId, Double amount) {
        int points = (int) (amount * POINTS_PER_YUAN);
        if (points > 0) {
            addPointsIdempotent(userId, points, PointsBizType.ORDER_COMPLETED,
                    String.valueOf(orderId),
                    "订单完成，消费" + amount + "元获得" + points + "积分");
        }
    }

    @Override
    public void addPointsForComment(Long userId, Long orderId, Long productId) {
        addPointsIdempotent(userId, COMMENT_POINTS, PointsBizType.COMMENT_CREATED,
                "comment:" + orderId + ":" + productId,
                "评价商品获得" + COMMENT_POINTS + "积分");
    }

    public static int calculateSignPoints(int continuousDays) {
        return SIGN_BASE_POINTS + (continuousDays < SIGN_BONUS_POINTS.length ?
               SIGN_BONUS_POINTS[continuousDays] : SIGN_BONUS_POINTS[SIGN_BONUS_POINTS.length - 1]);
    }

    private Integer mapBizTypeToLegacyType(PointsBizType bizType) {
        return switch (bizType) {
            case ORDER_COMPLETED -> PointsTypeEnum.ORDER.getCode();
            case COMMENT_CREATED -> PointsTypeEnum.COMMENT.getCode();
            case DAILY_SIGN_IN -> PointsTypeEnum.SIGN.getCode();
            case ADMIN_ADJUST -> PointsTypeEnum.SYSTEM.getCode();
            case POINTS_EXCHANGE -> PointsTypeEnum.EXCHANGE.getCode();
            case REFUND_DEDUCT -> PointsTypeEnum.REFUND.getCode();
        };
    }

    // ==================== 查询方法 ====================

    @Override
    public Page<PointsRecordVO> getPointsRecords(Long userId, Integer pageNum, Integer pageSize) {
        Page<PointsRecord> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<PointsRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PointsRecord::getUserId, userId)
               .orderByDesc(PointsRecord::getCreateTime);

        Page<PointsRecord> recordPage = pointsRecordMapper.selectPage(page, wrapper);

        Page<PointsRecordVO> voPage = new Page<>();
        BeanUtils.copyProperties(recordPage, voPage, "records");

        voPage.setRecords(recordPage.getRecords().stream().map(record -> {
            PointsRecordVO vo = new PointsRecordVO();
            BeanUtils.copyProperties(record, vo);
            PointsTypeEnum typeEnum = PointsTypeEnum.getByCode(record.getType());
            if (typeEnum != null) {
                vo.setTypeDesc(typeEnum.getDesc());
            }
            return vo;
        }).toList());

        return voPage;
    }
}
