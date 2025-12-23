package org.ruikun.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.PageResult;
import org.ruikun.common.Result;
import org.ruikun.dto.admin.UserQueryDTO;
import org.ruikun.entity.User;
import org.ruikun.mapper.UserMapper;
import org.ruikun.service.IPointsService;
import org.ruikun.vo.admin.AdminUserPageVO;
import org.ruikun.vo.admin.AdminUserVO;
import org.springframework.beans.BeanUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户管理控制器（后台管理）
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserMapper userMapper;
    private final IPointsService pointsService;

    /**
     * 分页查询用户列表
     */
    @GetMapping
    public Result<PageResult<AdminUserPageVO>> getUserPage(UserQueryDTO queryDTO) {
        Page<User> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        // 构建查询条件
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(queryDTO.getUsername())) {
            wrapper.like(User::getUsername, queryDTO.getUsername());
        }
        if (StringUtils.hasText(queryDTO.getPhone())) {
            wrapper.eq(User::getPhone, queryDTO.getPhone());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(User::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getRole() != null) {
            wrapper.eq(User::getRole, queryDTO.getRole());
        }
        wrapper.orderByDesc(User::getCreateTime);

        IPage<User> userPage = userMapper.selectPage(page, wrapper);

        // 转换为 VO
        List<AdminUserPageVO> vos = userPage.getRecords().stream()
                .map(user -> {
                    AdminUserPageVO vo = new AdminUserPageVO();
                    BeanUtils.copyProperties(user, vo);
                    return vo;
                })
                .collect(Collectors.toList());

        PageResult<AdminUserPageVO> pageResult = new PageResult<>(
                userPage.getTotal(),
                vos,
                (int) userPage.getCurrent(),
                (int) userPage.getSize()
        );

        return Result.success(pageResult);
    }

    /**
     * 查询用户详情
     */
    @GetMapping("/{id}")
    public Result<AdminUserVO> getUserById(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null || user.getDeleted() == 1) {
            return Result.error("用户不存在");
        }

        AdminUserVO vo = new AdminUserVO();
        BeanUtils.copyProperties(user, vo);

        return Result.success(vo);
    }

    /**
     * 修改用户状态
     */
    @PutMapping("/{id}/status")
    public Result<?> updateUserStatus(@PathVariable Long id, @RequestParam Integer status) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }

        User update = new User();
        update.setId(id);
        update.setStatus(status);
        userMapper.updateById(update);

        return Result.success("修改用户状态成功");
    }

    /**
     * 修改用户角色
     */
    @PutMapping("/{id}/role")
    public Result<?> updateUserRole(@PathVariable Long id, @RequestParam Integer role) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }

        User update = new User();
        update.setId(id);
        update.setRole(role);
        userMapper.updateById(update);

        return Result.success("修改用户角色成功");
    }

    /**
     * 调整用户积分
     */
    @PutMapping("/{id}/points")
    public Result<?> updateUserPoints(@PathVariable Long id, @RequestParam Integer points) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 扣减积分时检查余额
        if (points < 0 && user.getPoints() + points < 0) {
            return Result.error("积分不足");
        }

        // 使用 PointsService 记录积分变动
        pointsService.addPoints(user.getId(), points, "管理员手动调整");

        return Result.success("调整用户积分成功");
    }
}
