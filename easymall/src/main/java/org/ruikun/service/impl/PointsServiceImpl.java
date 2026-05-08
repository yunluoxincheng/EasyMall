package org.ruikun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.ResponseCode;
import org.ruikun.entity.PointsRecord;
import org.ruikun.entity.User;
import org.ruikun.enums.PointsTypeEnum;
import org.ruikun.exception.BusinessException;
import org.ruikun.mapper.PointsRecordMapper;
import org.ruikun.mapper.UserMapper;
import org.ruikun.service.IPointsService;
import org.ruikun.service.IMemberService;
import org.ruikun.vo.PointsRecordVO;
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

    /**
     * 积分规则配置
     */
    private static final int POINTS_PER_YUAN = 1; // 每消费1元获得1积分
    private static final int COMMENT_POINTS = 10; // 评论获得10积分
    private static final int SIGN_BASE_POINTS = 5; // 签到基础积分
    private static final int[] SIGN_BONUS_POINTS = {0, 0, 5, 10, 15, 20}; // 连续签到额外奖励

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addPoints(Long userId, Integer points, Integer type, Long sourceId, String description) {
        // 获取用户信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        // 验证积分值
        if (points <= 0) {
            throw new BusinessException(ResponseCode.POINTS_VALUE_INVALID, "积分值必须大于0");
        }

        // 记录变动前积分
        Integer beforePoints = user.getPoints();

        // 更新用户积分
        user.setPoints(beforePoints + points);
        userMapper.updateById(user);

        // 记录积分变动
        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setPointsChange(points);
        record.setBeforePoints(beforePoints);
        record.setAfterPoints(beforePoints + points);
        record.setType(type);
        record.setSourceId(sourceId);
        record.setDescription(description);
        pointsRecordMapper.insert(record);

        // 检查并升级会员等级
        memberService.checkAndUpgradeMember(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deductPoints(Long userId, Integer points, Integer type, Long sourceId, String description) {
        // 获取用户信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        // 验证积分值
        if (points <= 0) {
            throw new BusinessException(ResponseCode.POINTS_VALUE_INVALID, "积分值必须大于0");
        }

        // 检查积分是否足够
        if (user.getPoints() < points) {
            throw new BusinessException(ResponseCode.POINTS_INSUFFICIENT, "积分不足");
        }

        // 记录变动前积分
        Integer beforePoints = user.getPoints();

        // 更新用户积分
        user.setPoints(beforePoints - points);
        userMapper.updateById(user);

        // 记录积分变动
        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setPointsChange(-points);
        record.setBeforePoints(beforePoints);
        record.setAfterPoints(beforePoints - points);
        record.setType(type);
        record.setSourceId(sourceId);
        record.setDescription(description);
        pointsRecordMapper.insert(record);

        // 检查并降级会员等级
        memberService.checkAndUpgradeMember(userId);
    }

    @Override
    public Page<PointsRecordVO> getPointsRecords(Long userId, Integer pageNum, Integer pageSize) {
        // 分页查询
        Page<PointsRecord> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<PointsRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PointsRecord::getUserId, userId)
               .orderByDesc(PointsRecord::getCreateTime);

        Page<PointsRecord> recordPage = pointsRecordMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<PointsRecordVO> voPage = new Page<>();
        BeanUtils.copyProperties(recordPage, voPage, "records");

        voPage.setRecords(recordPage.getRecords().stream().map(record -> {
            PointsRecordVO vo = new PointsRecordVO();
            BeanUtils.copyProperties(record, vo);
            // 设置类型描述
            PointsTypeEnum typeEnum = PointsTypeEnum.getByCode(record.getType());
            if (typeEnum != null) {
                vo.setTypeDesc(typeEnum.getDesc());
            }
            return vo;
        }).toList());

        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addPoints(Long userId, Integer points, String description) {
        // 获取用户信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResponseCode.USER_NOT_FOUND, "用户不存在");
        }

        // 记录变动前积分
        Integer beforePoints = user.getPoints();

        if (points > 0) {
            // 增加积分
            user.setPoints(beforePoints + points);
            userMapper.updateById(user);

            // 记录积分变动（类型 4-系统赠送）
            PointsRecord record = new PointsRecord();
            record.setUserId(userId);
            record.setPointsChange(points);
            record.setBeforePoints(beforePoints);
            record.setAfterPoints(beforePoints + points);
            record.setType(4); // 系统赠送
            record.setSourceId(0L);
            record.setDescription(description);
            pointsRecordMapper.insert(record);
        } else if (points < 0) {
            // 扣减积分
            int deductAmount = -points;
            if (beforePoints < deductAmount) {
                throw new BusinessException(ResponseCode.POINTS_INSUFFICIENT, "积分不足");
            }

            user.setPoints(beforePoints - deductAmount);
            userMapper.updateById(user);

            // 记录积分变动（类型 6-退款扣除）
            PointsRecord record = new PointsRecord();
            record.setUserId(userId);
            record.setPointsChange(points); // 负数
            record.setBeforePoints(beforePoints);
            record.setAfterPoints(beforePoints - deductAmount);
            record.setType(6); // 退款扣除
            record.setSourceId(0L);
            record.setDescription(description);
            pointsRecordMapper.insert(record);
        }

        // 检查并升级/降级会员等级
        memberService.checkAndUpgradeMember(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addPointsForOrder(Long userId, Long orderId, Double amount) {
        // 计算积分（每消费1元获得1积分）
        int points = (int) (amount * POINTS_PER_YUAN);

        if (points > 0) {
            addPoints(userId, points, PointsTypeEnum.ORDER.getCode(), orderId,
                     "订单完成，消费" + amount + "元获得" + points + "积分");
        }
    }

    /**
     * 评论获得积分
     */
    public void addPointsForComment(Long userId, Long productId) {
        addPoints(userId, COMMENT_POINTS, PointsTypeEnum.COMMENT.getCode(), productId,
                 "评价商品获得" + COMMENT_POINTS + "积分");
    }

    /**
     * 计算签到积分
     */
    public static int calculateSignPoints(int continuousDays) {
        return SIGN_BASE_POINTS + (continuousDays < SIGN_BONUS_POINTS.length ?
               SIGN_BONUS_POINTS[continuousDays] : SIGN_BONUS_POINTS[SIGN_BONUS_POINTS.length - 1]);
    }
}
