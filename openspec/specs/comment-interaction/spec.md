# comment-interaction Specification

## Purpose
TBD - created by archiving change add-user-frontend. Update Purpose after archive.
## Requirements
### Requirement: 查看商品评论
系统 SHALL 在商品详情页展示该商品的用户评论列表。

#### Scenario: 查看商品评论列表
- **WHEN** 用户在商品详情页查看评论区域
- **THEN** 显示评论列表（评论人、评分、评论内容、评论时间），支持分页加载

#### Scenario: 商品无评论
- **WHEN** 商品暂无审核通过的评论
- **THEN** 评论区域显示"暂无评论"

### Requirement: 发表评论
系统 SHALL 允许已登录用户对已完成订单的商品发表评论。

#### Scenario: 从订单详情页发表评论
- **WHEN** 用户在已完成订单详情页点击某商品的"评价"按钮
- **THEN** 弹出评论对话框，包含评分选择和评论内容输入框

#### Scenario: 提交评论成功
- **WHEN** 用户填写评分和评论内容后点击提交
- **THEN** 系统调用评论接口，成功后显示"评论提交成功，等待审核"

#### Scenario: 评论内容为空
- **WHEN** 用户未填写评论内容就点击提交
- **THEN** 表单校验提示"请输入评论内容"

### Requirement: 我的评论管理
系统 SHALL 提供我的评论页面，展示用户发表的所有评论及审核状态。

#### Scenario: 查看我的评论
- **WHEN** 用户访问我的评论页面
- **THEN** 显示评论列表（商品名称、评论内容、评分、审核状态、评论时间），支持分页

#### Scenario: 删除评论
- **WHEN** 用户点击某条评论的删除按钮
- **THEN** 系统弹出确认提示，确认后调用删除接口，该评论从列表中移除

