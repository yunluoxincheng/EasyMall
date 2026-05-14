## ADDED Requirements

### Requirement: 优惠券模板列表页面
系统 SHALL 提供优惠券模板管理列表页面，展示模板 ID、名称、类型、面额/折扣、使用门槛、有效期、发放数量，支持搜索和分页。后端优惠券接口返回 MyBatis Plus `Page<T>` 分页结构，前端 SHALL 使用 `MyBatisPage<T>` 类型适配。

#### Scenario: 优惠券模板列表展示
- **WHEN** 管理员访问优惠券管理页面
- **THEN** 系统调用 `/api/admin/coupon/templates` 接口并以表格形式展示优惠券模板列表

### Requirement: 优惠券模板新增/编辑
系统 SHALL 提供优惠券模板新增和编辑表单，包含名称、类型（满减/折扣/固定金额）、面额、使用门槛、有效期（固定日期/领取后N天）、发放总量等字段。

#### Scenario: 新增优惠券模板
- **WHEN** 管理员点击"新增优惠券"按钮并填写表单后提交
- **THEN** 系统调用 `/api/admin/coupon/template` POST 接口，成功后刷新列表

#### Scenario: 编辑优惠券模板
- **WHEN** 管理员点击优惠券的"编辑"按钮，修改字段后提交
- **THEN** 系统调用 `/api/admin/coupon/template` PUT 接口，成功后刷新列表

### Requirement: 优惠券模板上下架
系统 SHALL 提供优惠券模板上架/下架状态切换功能。

#### Scenario: 优惠券模板上下架
- **WHEN** 管理员对优惠券模板点击上下架操作
- **THEN** 系统调用 `/api/admin/coupon/template/{id}/status` 接口更改状态

### Requirement: 优惠券模板删除
系统 SHALL 提供优惠券模板删除功能，删除前 SHALL 显示确认对话框。

#### Scenario: 删除优惠券模板
- **WHEN** 管理员点击优惠券模板的"删除"按钮并确认
- **THEN** 系统调用 `/api/admin/coupon/template/{id}` DELETE 接口并刷新列表

### Requirement: 优惠券使用日志
系统 SHALL 提供优惠券使用记录查看功能，支持按模板 ID 和用户 ID 筛选，分页展示。

#### Scenario: 查看使用日志
- **WHEN** 管理员访问优惠券使用日志页面
- **THEN** 系统调用 `/api/admin/coupon/usage-logs` 接口并以表格形式展示使用记录

#### Scenario: 按条件筛选使用日志
- **WHEN** 管理员输入模板 ID 或用户 ID 进行筛选
- **THEN** 系统根据筛选条件重新查询并展示匹配的使用记录

### Requirement: 优惠券统计数据
系统 SHALL 提供优惠券统计数据展示功能，包含发放量、领取量、使用量等关键指标。

#### Scenario: 查看优惠券统计
- **WHEN** 管理员在优惠券管理页面查看统计信息
- **THEN** 系统调用 `/api/admin/coupon/statistics` 接口并展示统计数据
