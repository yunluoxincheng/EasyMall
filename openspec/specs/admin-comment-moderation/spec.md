# admin-comment-moderation Specification

## Purpose
TBD - created by archiving change add-admin-module. Update Purpose after archive.
## Requirements
### Requirement: 评论列表分页查询
系统 SHALL 允许管理员通过分页查询获取评论列表，并支持按商品 ID、用户 ID、审核状态、评分进行筛选。

#### Scenario: 成功查询评论列表
- **WHEN** 管理员请求 GET /api/admin/comments，提供页码、页大小等分页参数
- **THEN** 返回评论分页结果，包含评论 ID、用户信息、商品信息、评论内容、评分、审核状态、商家回复、创建时间等信息
- **AND** 支持按商品 ID 筛选
- **AND** 支持按用户 ID 筛选
- **AND** 支持按审核状态筛选（0=隐藏/待审核，1=显示）
- **AND** 支持按评分筛选

### Requirement: 评论详情查询
系统 SHALL 允许管理员查询指定评论的完整详细信息。

#### Scenario: 成功查询评论详情
- **WHEN** 管理员请求 GET /api/admin/comments/{id}
- **THEN** 返回评论的完整信息，包括评论内容、图片、评分、用户信息、商品信息、商家回复、回复时间等

### Requirement: 评论审核通过
系统 SHALL 允许管理员审核通过评论，使评论在前端显示。

#### Scenario: 成功审核通过评论
- **WHEN** 管理员请求 PUT /api/admin/comments/{id}/approve
- **THEN** 评论的显示状态更新为显示（showStatus=1）
- **AND** 前端用户可以查看该评论

### Requirement: 评论审核拒绝
系统 SHALL 允许管理员审核拒绝评论，使评论在前端隐藏。

#### Scenario: 成功审核拒绝评论
- **WHEN** 管理员请求 PUT /api/admin/comments/{id}/reject
- **THEN** 评论的显示状态更新为隐藏（showStatus=0）
- **AND** 前端用户无法查看该评论

### Requirement: 商家回复评论
系统 SHALL 允许管理员（代表商家）回复用户评论。

#### Scenario: 成功回复评论
- **WHEN** 管理员请求 PUT /api/admin/comments/{id}/reply，提供回复内容
- **THEN** 更新评论的商家回复内容和回复时间
- **AND** 前端用户可以查看商家回复

#### Scenario: 回复内容为空
- **WHEN** 管理员提供的回复内容为空
- **THEN** 返回参数校验错误信息

### Requirement: 删除评论
系统 SHALL 允许管理员删除不当评论。

#### Scenario: 成功删除评论
- **WHEN** 管理员请求 DELETE /api/admin/comments/{id}
- **THEN** 评论被逻辑删除（deleted 字段设置为 1）
- **AND** 前端用户无法查看该评论

### Requirement: 评论列表页面
系统 SHALL 提供评论审核列表页面，展示评论 ID、商品名称、评论用户、评分、内容摘要、状态（待审核/已通过/已拒绝），支持按状态筛选和分页。

#### Scenario: 评论列表展示
- **WHEN** 管理员访问评论审核页面
- **THEN** 系统调用 `/api/admin/comments` 接口并以表格形式展示评论列表

#### Scenario: 按状态筛选评论
- **WHEN** 管理员选择评论状态筛选条件
- **THEN** 系统根据状态条件重新查询并展示结果

### Requirement: 评论审核操作
系统 SHALL 提供评论审核通过和拒绝操作。

#### Scenario: 审核通过评论
- **WHEN** 管理员对待审核评论点击"通过"操作
- **THEN** 系统调用后端审核接口，评论状态变为已通过

#### Scenario: 拒绝评论
- **WHEN** 管理员对待审核评论点击"拒绝"操作
- **THEN** 系统调用后端审核接口，评论状态变为已拒绝

