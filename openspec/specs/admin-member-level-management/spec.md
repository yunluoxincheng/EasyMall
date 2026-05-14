# admin-member-level-management Specification

## Purpose
TBD - created by archiving change add-admin-module. Update Purpose after archive.
## Requirements
### Requirement: 会员等级列表查询
系统 SHALL 允许管理员查询所有会员等级配置。

#### Scenario: 成功查询会员等级列表
- **WHEN** 管理员请求 GET /api/admin/member-levels
- **THEN** 返回所有会员等级列表，包含等级编号、等级名称、积分范围、折扣率、等级图标、权益描述、状态、排序等信息
- **AND** 列表按排序字段升序排列

### Requirement: 会员等级详情查询
系统 SHALL 允许管理员查询指定会员等级的完整配置信息。

#### Scenario: 成功查询会员等级详情
- **WHEN** 管理员请求 GET /api/admin/member-levels/{id}
- **THEN** 返回会员等级的完整配置信息

### Requirement: 新增会员等级
系统 SHALL 允许管理员创建新的会员等级。

#### Scenario: 成功创建会员等级
- **WHEN** 管理员请求 POST /api/admin/member-levels，提供等级编号、等级名称、积分范围、折扣率等必填信息
- **THEN** 创建会员等级成功，返回新创建的等级 ID
- **AND** 会员等级状态默认为启用（status=1）

#### Scenario: 积分范围冲突
- **WHEN** 管理员创建的会员等级积分范围与现有等级重叠
- **THEN** 返回错误信息，积分范围冲突

### Requirement: 修改会员等级
系统 SHALL 允许管理员修改已有会员等级的配置信息。

#### Scenario: 成功修改会员等级
- **WHEN** 管理员请求 PUT /api/admin/member-levels/{id}，提供需要更新的字段
- **THEN** 更新会员等级配置成功
- **AND** 仅更新提供的字段，未提供的字段保持不变

#### Scenario: 修改积分范围时冲突检测
- **WHEN** 管理员修改会员等级的积分范围，与其他等级冲突
- **THEN** 返回错误信息，积分范围冲突

### Requirement: 会员等级状态管理
系统 SHALL 允许管理员启用或禁用会员等级。

#### Scenario: 成功禁用会员等级
- **WHEN** 管理员请求 PUT /api/admin/member-levels/{id}/status，设置 status=0
- **THEN** 会员等级状态更新为禁用
- **AND** 用户无法达到或享受该等级权益

#### Scenario: 成功启用会员等级
- **WHEN** 管理员请求 PUT /api/admin/member-levels/{id}/status，设置 status=1
- **THEN** 会员等级状态更新为启用
- **AND** 用户可以正常达到或享受该等级权益

### Requirement: 删除会员等级
系统 SHALL 允许管理员删除会员等级。

#### Scenario: 成功删除会员等级
- **WHEN** 管理员请求 DELETE /api/admin/member-levels/{id}
- **THEN** 会员等级被逻辑删除（deleted 字段设置为 1）
- **AND** 已有该等级的用户不受影响，但新用户无法达到该等级

#### Scenario: 删除有用户的等级
- **WHEN** 管理员删除仍有用户持有的会员等级
- **THEN** 系统允许删除，但给出警告提示（或改为阻止删除，本版本采用允许删除）

### Requirement: 会员等级列表页面
系统 SHALL 提供会员等级管理列表页面，展示等级编号、等级名称、积分区间（minPoints-maxPoints）、折扣率、图标、权益说明、排序值、状态。后端返回全量列表（无分页），前端 SHALL 提供本地搜索过滤功能。

#### Scenario: 会员等级列表展示
- **WHEN** 管理员访问会员等级管理页面
- **THEN** 系统调用 `/api/admin/member-levels` 接口并以表格形式展示全部等级（无服务端分页）

#### Scenario: 本地搜索过滤
- **WHEN** 管理员输入等级名称关键词
- **THEN** 系统在前端本地过滤并展示匹配的等级

### Requirement: 会员等级新增/编辑
系统 SHALL 提供会员等级新增和编辑表单，包含等级编号（level）、等级名称（levelName）、最小积分（minPoints）、最大积分（maxPoints）、折扣率（discount）、图标（icon）、权益说明（benefits）、排序值（sortOrder）等字段。

#### Scenario: 新增会员等级
- **WHEN** 管理员点击"新增等级"按钮并填写表单后提交
- **THEN** 系统调用后端新增接口，成功后刷新列表

#### Scenario: 编辑会员等级
- **WHEN** 管理员点击等级的"编辑"按钮，修改字段后提交
- **THEN** 系统调用后端更新接口，成功后刷新列表

#### Scenario: 积分区间冲突校验
- **WHEN** 管理员输入的积分区间与已有等级重叠并提交
- **THEN** 后端返回冲突错误，前端显示错误提示（如"积分区间与已有等级冲突"）

