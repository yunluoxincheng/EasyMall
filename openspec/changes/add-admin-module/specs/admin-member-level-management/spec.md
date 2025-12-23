## ADDED Requirements

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
