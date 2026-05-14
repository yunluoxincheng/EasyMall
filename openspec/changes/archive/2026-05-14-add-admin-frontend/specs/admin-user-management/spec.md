## ADDED Requirements

### Requirement: 用户列表页面
系统 SHALL 提供用户管理列表页面，展示用户 ID、用户名、手机号、角色、状态、注册时间、积分，支持按用户名/手机号搜索、按状态/角色筛选和分页。

#### Scenario: 用户列表分页展示
- **WHEN** 管理员访问用户管理页面
- **THEN** 系统调用 `/api/admin/users` 接口并以表格形式展示用户列表

#### Scenario: 用户搜索筛选
- **WHEN** 管理员输入用户名或手机号进行搜索，或选择状态/角色进行筛选
- **THEN** 系统根据条件重新查询并展示匹配的用户

### Requirement: 用户详情查看
系统 SHALL 提供用户详情查看功能，展示用户完整信息、会员等级、积分余额。

#### Scenario: 查看用户详情
- **WHEN** 管理员点击用户列表中的"查看详情"按钮
- **THEN** 系统展示用户完整信息，包括会员等级和积分

## UPDATED Requirements

### Requirement: 用户状态管理
系统 SHALL 在管理后台列表页提供用户启用/禁用功能。

#### Scenario: 禁用用户
- **WHEN** 管理员对用户点击"禁用"操作
- **THEN** 系统调用后端接口更改用户状态，该用户将无法登录

### Requirement: 用户角色管理
系统 SHALL 在管理后台列表页提供用户角色切换功能（普通用户/管理员）。

#### Scenario: 切换用户角色
- **WHEN** 管理员修改用户角色并确认
- **THEN** 系统调用后端接口更新用户角色

### Requirement: 用户积分调整
系统 SHALL 在管理后台提供管理员手动调整用户积分的功能。后端接口仅接受 `points` 参数（正数增加、负数扣减），备注由服务端自动生成，前端无需提供备注输入。

#### Scenario: 增加用户积分
- **WHEN** 管理员输入正数积分值并提交调整
- **THEN** 系统调用 `/api/admin/users/{id}/points` 接口传入 points 参数，用户积分增加

#### Scenario: 扣减用户积分
- **WHEN** 管理员输入负数积分值并提交调整
- **THEN** 系统调用 `/api/admin/users/{id}/points` 接口传入 points 参数，用户积分减少
