## ADDED Requirements

### Requirement: 订单列表分页查询
系统 SHALL 允许管理员通过分页查询获取订单列表，并支持按订单号、用户 ID、订单状态、时间范围进行筛选。

#### Scenario: 成功查询订单列表
- **WHEN** 管理员请求 GET /api/admin/orders，提供页码、页大小等分页参数
- **THEN** 返回订单分页结果，包含订单 ID、订单号、用户信息、订单金额、订单状态、创建时间等信息
- **AND** 支持按订单号精确或模糊搜索
- **AND** 支持按用户 ID 筛选
- **AND** 支持按订单状态筛选（0=待支付，1=已支付，2=已发货，3=已完成，4=已取消）
- **AND** 支持按创建时间范围筛选

### Requirement: 订单详情查询
系统 SHALL 允许管理员查询指定订单的完整详细信息，包括订单商品明细。

#### Scenario: 成功查询订单详情
- **WHEN** 管理员请求 GET /api/admin/orders/{id}
- **THEN** 返回订单的完整信息，包括订单基本信息、收货地址、订单商品列表（商品名称、单价、数量、小计）

### Requirement: 订单状态管理
系统 SHALL 允许管理员修改订单的状态，如发货、完成订单等。

#### Scenario: 成功发货订单
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置 status=2（已发货）
- **THEN** 订单状态更新为已发货
- **AND** 用户可以查看订单的发货状态

#### Scenario: 成功完成订单
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/status，设置 status=3（已完成）
- **THEN** 订单状态更新为已完成

#### Scenario: 状态流转校验
- **WHEN** 管理员尝试将订单从待支付状态直接改为已完成
- **THEN** 返回错误信息，订单状态流转不合法

### Requirement: 取消订单
系统 SHALL 允许管理员取消订单。

#### Scenario: 成功取消订单
- **WHEN** 管理员请求 PUT /api/admin/orders/{id}/cancel
- **THEN** 订单状态更新为已取消（status=4）
- **AND** 如果订单已支付，应当退款（本版本暂不实现自动退款，仅更新状态）
