## ADDED Requirements

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

### Requirement: 会员等级状态管理
系统 SHALL 提供会员等级启用/禁用功能。

#### Scenario: 禁用会员等级
- **WHEN** 管理员对已启用等级点击"禁用"操作
- **THEN** 系统调用 `/api/admin/member-levels/{id}/status` 接口更改等级状态

### Requirement: 会员等级删除
系统 SHALL 提供会员等级删除功能，删除前 SHALL 显示确认对话框。

#### Scenario: 删除会员等级确认
- **WHEN** 管理员点击等级的"删除"按钮并确认
- **THEN** 系统调用 `/api/admin/member-levels/{id}` DELETE 接口并刷新列表
