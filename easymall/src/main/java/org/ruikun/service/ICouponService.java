package org.ruikun.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.ruikun.dto.CouponCalculateDTO;
import org.ruikun.vo.CouponCalculateResultVO;
import org.ruikun.vo.CouponTemplateVO;
import org.ruikun.vo.UserCouponVO;

import java.math.BigDecimal;
import java.util.List;

/**
 * 优惠券服务接口
 */
public interface ICouponService {

    /**
     * 获取可领取的优惠券列表
     *
     * @param userId 用户ID
     * @return 优惠券模板列表
     */
    List<CouponTemplateVO> getAvailableTemplates(Long userId);

    /**
     * 领取优惠券
     *
     * @param userId     用户ID
     * @param templateId 优惠券模板ID
     * @return 用户优惠券ID
     */
    Long receiveCoupon(Long userId, Long templateId);

    /**
     * 查看我的优惠券列表
     *
     * @param userId 用户ID
     * @param status 状态（0-未使用，1-已使用，2-已过期，null-全部）
     * @param pageNum 页码
     * @param pageSize 页大小
     * @return 用户优惠券分页列表
     */
    Page<UserCouponVO> getUserCoupons(Long userId, Integer status, Integer pageNum, Integer pageSize);

    /**
     * 获取可用优惠券（下单时）
     *
     * @param userId      用户ID
     * @param orderAmount 订单金额
     * @return 可用优惠券列表
     */
    List<UserCouponVO> getAvailableCoupons(Long userId, BigDecimal orderAmount);

    /**
     * 计算优惠金额
     *
     * @param userId  用户ID
     * @param dto     计算参数
     * @return 计算结果
     */
    CouponCalculateResultVO calculateDiscount(Long userId, CouponCalculateDTO dto);

    /**
     * 使用优惠券
     *
     * @param userId       用户ID
     * @param userCouponId 用户优惠券ID
     * @param orderId      订单ID
     * @param orderNo      订单号
     * @param orderAmount  订单金额
     * @return 优惠金额
     */
    BigDecimal useCoupon(Long userId, Long userCouponId, Long orderId, String orderNo, BigDecimal orderAmount);

    /**
     * 返还优惠券（订单取消）
     *
     * @param userId       用户ID
     * @param userCouponId 用户优惠券ID
     * @param orderId      订单ID
     */
    void returnCoupon(Long userId, Long userCouponId, Long orderId);

    /**
     * 发放优惠券（系统自动发放）
     *
     * @param userId     用户ID
     * @param templateId 优惠券模板ID
     * @return 用户优惠券ID
     */
    Long issueCoupon(Long userId, Long templateId);

    /**
     * 检查并更新过期优惠券
     */
    void updateExpiredCoupons();
}
