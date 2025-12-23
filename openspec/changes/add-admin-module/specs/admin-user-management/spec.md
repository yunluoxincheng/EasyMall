## ADDED Requirements

### Requirement: 用户列表分页查询
系统 SHALL 允许管理员通过分页查询获取用户列表，并支持按用户名、手机号、状态进行筛选。

#### Scenario: 成功查询用户列表
- **WHEN** 管理员请求 GET /api/admin/users，提供页码、页大小等分页参数
- **THEN** 返回用户分页结果，包含用户 ID、用户名、昵称、手机号、邮箱、角色、状态、积分、等级、创建时间等信息
- **AND** 支持按用户名模糊搜索
- **AND** 支持按手机号精确搜索
- **AND** 支持按用户状态筛选（0=禁用，1=启用）
- **AND** 支持按角色筛选（0=普通用户，1=管理员）

### Requirement: 用户详情查询
系统 SHALL 允许管理员查询指定用户的完整详细信息。

#### Scenario: 成功查询用户详情
- **WHEN** 管理员请求 GET /api/admin/users/{id}
- **THEN** 返回用户的完整信息，包括基本信息、积分、等级、注册时间等

### Requirement: 用户状态管理
系统 SHALL 允许管理员启用或禁用用户账号。

#### Scenario: 成功禁用用户
- **WHEN** 管理员请求 PUT /api/admin/users/{id}/status，设置 status=0
- **THEN** 用户状态更新为禁用
- **AND** 被禁用的用户无法登录系统

#### Scenario: 成功启用用户
- **WHEN** 管理员请求 PUT /api/admin/users/{id}/status，设置 status=1
- **THEN** 用户状态更新为启用
- **AND** 用户可以正常登录系统

### Requirement: 用户角色管理
系统 SHALL 允许管理员将普通用户设置为管理员，或取消管理员权限。

#### Scenario: 成功设置管理员
- **WHEN** 管理员请求 PUT /api/admin/users/{id}/role，设置 role=1
- **THEN** 用户角色更新为管理员
- **AND** 该用户可以访问后台管理接口

#### Scenario: 成功取消管理员
- **WHEN** 管理员请求 PUT /api/admin/users/{id}/role，设置 role=0
- **THEN** 用户角色更新为普通用户
- **AND** 该用户无法访问后台管理接口

### Requirement: 用户积分调整
系统 SHALL 允许管理员手动调整用户积分，用于奖励或补偿等场景。

#### Scenario: 成功增加积分
- **WHEN** 管理员请求 PUT /api/admin/users/{id}/points，提供正数积分值
- **THEN** 用户积分增加相应数量
- **AND** 记录积分变动原因（管理员手动调整）

#### Scenario: 成功扣减积分
- **WHEN** 管理员请求 PUT /api/admin/users/{id}/points，提供负数积分值
- **THEN** 用户积分减少相应数量
- **AND** 积分不能为负数，扣减后的积分应 >= 0

#### Scenario: 积分不足时扣减失败
- **WHEN** 管理员尝试扣减的积分超过用户当前积分
- **THEN** 返回错误信息，积分不足
