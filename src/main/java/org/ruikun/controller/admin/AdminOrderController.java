package org.ruikun.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.dto.admin.OrderQueryDTO;
import org.ruikun.entity.Order;
import org.ruikun.entity.OrderItem;
import org.ruikun.entity.User;
import org.ruikun.mapper.OrderItemMapper;
import org.ruikun.mapper.OrderMapper;
import org.ruikun.mapper.UserMapper;
import org.ruikun.vo.admin.AdminOrderPageVO;
import org.ruikun.vo.admin.AdminOrderVO;
import org.springframework.beans.BeanUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 订单管理控制器（后台管理）
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final UserMapper userMapper;

    /**
     * 分页查询订单列表
     */
    @GetMapping
    public Result<PageResult<AdminOrderPageVO>> getOrderPage(OrderQueryDTO queryDTO) {
        Page<Order> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        // 构建查询条件
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(queryDTO.getOrderNo())) {
            wrapper.like(Order::getOrderNo, queryDTO.getOrderNo());
        }
        if (queryDTO.getUserId() != null) {
            wrapper.eq(Order::getUserId, queryDTO.getUserId());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Order::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getStartTime() != null) {
            wrapper.ge(Order::getCreateTime, queryDTO.getStartTime());
        }
        if (queryDTO.getEndTime() != null) {
            wrapper.le(Order::getCreateTime, queryDTO.getEndTime());
        }
        wrapper.orderByDesc(Order::getCreateTime);

        IPage<Order> orderPage = orderMapper.selectPage(page, wrapper);

        // 获取用户信息
        List<Long> userIds = orderPage.getRecords().stream()
                .map(Order::getUserId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, User> userMap = userIds.isEmpty() ? Map.of() :
                userMapper.selectBatchIds(userIds).stream()
                        .collect(Collectors.toMap(User::getId, u -> u));

        // 转换为 VO
        List<AdminOrderPageVO> vos = orderPage.getRecords().stream()
                .map(order -> {
                    AdminOrderPageVO vo = new AdminOrderPageVO();
                    BeanUtils.copyProperties(order, vo);
                    User user = userMap.get(order.getUserId());
                    if (user != null) {
                        vo.setUsername(user.getUsername());
                        vo.setNickname(user.getNickname());
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        PageResult<AdminOrderPageVO> pageResult = new PageResult<>(
                orderPage.getTotal(),
                vos,
                (int) orderPage.getCurrent(),
                (int) orderPage.getSize()
        );

        return Result.success(pageResult);
    }

    /**
     * 查询订单详情
     */
    @GetMapping("/{id}")
    public Result<AdminOrderVO> getOrderById(@PathVariable Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null || order.getDeleted() == 1) {
            return Result.error("订单不存在");
        }

        // 获取用户信息
        User user = userMapper.selectById(order.getUserId());

        // 获取订单明细
        LambdaQueryWrapper<OrderItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderItem::getOrderId, id);
        List<OrderItem> items = orderItemMapper.selectList(wrapper);

        // 组装 VO
        AdminOrderVO vo = new AdminOrderVO();
        BeanUtils.copyProperties(order, vo);
        if (user != null) {
            vo.setUsername(user.getUsername());
            vo.setNickname(user.getNickname());
            vo.setPhone(user.getPhone());
        }

        List<AdminOrderVO.OrderItemVO> itemVOs = items.stream()
                .map(item -> {
                    AdminOrderVO.OrderItemVO itemVO = new AdminOrderVO.OrderItemVO();
                    itemVO.setId(item.getId());
                    itemVO.setProductId(item.getProductId());
                    itemVO.setProductName(item.getProductName());
                    itemVO.setProductImage(item.getProductImage());
                    itemVO.setPrice(item.getProductPrice());
                    itemVO.setQuantity(item.getQuantity());
                    itemVO.setSubtotal(item.getTotalPrice());
                    return itemVO;
                })
                .collect(Collectors.toList());
        vo.setItems(itemVOs);

        return Result.success(vo);
    }

    /**
     * 修改订单状态
     */
    @PutMapping("/{id}/status")
    public Result<?> updateOrderStatus(@PathVariable Long id, @RequestParam Integer status) {
        Order order = orderMapper.selectById(id);
        if (order == null || order.getDeleted() == 1) {
            return Result.error("订单不存在");
        }

        // 订单状态流转校验
        int currentStatus = order.getStatus();
        if (currentStatus == 4) {
            return Result.error("已取消的订单不能修改状态");
        }
        if (currentStatus == 3) {
            return Result.error("已完成的订单不能修改状态");
        }
        if (currentStatus == 0 && status == 3) {
            return Result.error("待支付订单不能直接完成");
        }

        Order update = new Order();
        update.setId(id);
        update.setStatus(status);
        orderMapper.updateById(update);

        return Result.success("修改订单状态成功");
    }

    /**
     * 取消订单
     */
    @PutMapping("/{id}/cancel")
    public Result<?> cancelOrder(@PathVariable Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null || order.getDeleted() == 1) {
            return Result.error("订单不存在");
        }

        if (order.getStatus() == 4) {
            return Result.error("订单已取消");
        }
        if (order.getStatus() == 3) {
            return Result.error("已完成的订单不能取消");
        }

        Order update = new Order();
        update.setId(id);
        update.setStatus(4); // 已取消
        orderMapper.updateById(update);

        // TODO: 如果订单已支付，需要退款处理

        return Result.success("取消订单成功");
    }
}
