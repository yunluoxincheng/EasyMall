package org.ruikun.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.ruikun.common.Result;
import org.ruikun.dto.admin.MemberLevelSaveDTO;
import org.ruikun.entity.MemberLevel;
import org.ruikun.mapper.MemberLevelMapper;
import org.ruikun.vo.admin.AdminMemberLevelVO;
import org.springframework.beans.BeanUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 会员等级管理控制器（后台管理）
 */
@RestController
@RequestMapping("/api/admin/member-levels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMemberLevelController {

    private final MemberLevelMapper memberLevelMapper;

    /**
     * 查询所有会员等级
     */
    @GetMapping
    public Result<List<AdminMemberLevelVO>> getAllMemberLevels() {
        LambdaQueryWrapper<MemberLevel> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(MemberLevel::getSortOrder);

        List<MemberLevel> levels = memberLevelMapper.selectList(wrapper);

        List<AdminMemberLevelVO> vos = levels.stream()
                .map(level -> {
                    AdminMemberLevelVO vo = new AdminMemberLevelVO();
                    BeanUtils.copyProperties(level, vo);
                    return vo;
                })
                .collect(Collectors.toList());

        return Result.success(vos);
    }

    /**
     * 查询会员等级详情
     */
    @GetMapping("/{id}")
    public Result<AdminMemberLevelVO> getMemberLevelById(@PathVariable Long id) {
        MemberLevel level = memberLevelMapper.selectById(id);
        if (level == null || level.getDeleted() == 1) {
            return Result.error("会员等级不存在");
        }

        AdminMemberLevelVO vo = new AdminMemberLevelVO();
        BeanUtils.copyProperties(level, vo);

        return Result.success(vo);
    }

    /**
     * 新增会员等级
     */
    @PostMapping
    public Result<?> saveMemberLevel(@RequestBody @Validated MemberLevelSaveDTO saveDTO) {
        // 检查积分范围是否冲突
        LambdaQueryWrapper<MemberLevel> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.le(MemberLevel::getMinPoints, saveDTO.getMaxPoints())
                .ge(MemberLevel::getMaxPoints, saveDTO.getMinPoints()));
        Long count = memberLevelMapper.selectCount(wrapper);
        if (count > 0) {
            return Result.error("积分范围与其他等级冲突");
        }

        MemberLevel level = new MemberLevel();
        BeanUtils.copyProperties(saveDTO, level);
        level.setStatus(1); // 默认启用

        if (memberLevelMapper.insert(level) <= 0) {
            return Result.error("新增会员等级失败");
        }

        return Result.success("新增会员等级成功");
    }

    /**
     * 修改会员等级
     */
    @PutMapping("/{id}")
    public Result<?> updateMemberLevel(@PathVariable Long id, @RequestBody @Validated MemberLevelSaveDTO saveDTO) {
        MemberLevel existLevel = memberLevelMapper.selectById(id);
        if (existLevel == null) {
            return Result.error("会员等级不存在");
        }

        // 检查积分范围是否冲突（排除自身）
        LambdaQueryWrapper<MemberLevel> wrapper = new LambdaQueryWrapper<>();
        wrapper.ne(MemberLevel::getId, id)
                .and(w -> w.le(MemberLevel::getMinPoints, saveDTO.getMaxPoints())
                        .ge(MemberLevel::getMaxPoints, saveDTO.getMinPoints()));
        Long count = memberLevelMapper.selectCount(wrapper);
        if (count > 0) {
            return Result.error("积分范围与其他等级冲突");
        }

        MemberLevel level = new MemberLevel();
        level.setId(id);
        BeanUtils.copyProperties(saveDTO, level);

        if (memberLevelMapper.updateById(level) <= 0) {
            return Result.error("修改会员等级失败");
        }

        return Result.success("修改会员等级成功");
    }

    /**
     * 修改会员等级状态
     */
    @PutMapping("/{id}/status")
    public Result<?> updateMemberLevelStatus(@PathVariable Long id, @RequestParam Integer status) {
        MemberLevel level = memberLevelMapper.selectById(id);
        if (level == null) {
            return Result.error("会员等级不存在");
        }

        MemberLevel update = new MemberLevel();
        update.setId(id);
        update.setStatus(status);
        memberLevelMapper.updateById(update);

        return Result.success("修改会员等级状态成功");
    }

    /**
     * 删除会员等级
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteMemberLevel(@PathVariable Long id) {
        MemberLevel level = memberLevelMapper.selectById(id);
        if (level == null) {
            return Result.error("会员等级不存在");
        }

        memberLevelMapper.deleteById(id);
        return Result.success("删除会员等级成功");
    }
}
