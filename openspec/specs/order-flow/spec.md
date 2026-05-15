# order-flow Specification

## Purpose
TBD - created by archiving change add-user-frontend. Update Purpose after archive.
## Requirements
### Requirement: 订单确认页
系统 SHALL 提供订单确认页面，展示待结算商品、收货信息表单、优惠券选择和订单金额汇总。

#### Scenario: 查看订单确认页
- **WHEN** 用户从购物车进入订单确认页
- **THEN** 页面显示待结算商品列表、收货信息表单（收货人姓名、手机号、收货地址、订单备注）、优惠券选择下拉、商品总额、优惠金额、应付金额、提交订单按钮

#### Scenario: 收货信息表单校验
- **WHEN** 用户未填写收货人姓名、手机号或收货地址就点击提交
- **THEN** 表单校验拦截提交，在对应字段下方显示错误提示

#### Scenario: 收货信息表单填充
- **WHEN** 用户填写完整的收货人姓名、手机号和收货地址
- **THEN** 表单校验通过，允许提交订单

#### Scenario: 选择优惠券
- **WHEN** 用户在订单确认页点击优惠券选择区域
- **THEN** 系统展示当前可用优惠券列表，用户选择后金额汇总自动更新（显示优惠金额和折后应付金额）

#### Scenario: 没有可用优惠券
- **WHEN** 用户没有可用优惠券
- **THEN** 优惠券选择区域显示"暂无可用优惠券"

### Requirement: 提交订单
系统 SHALL 允许用户提交订单。

#### Scenario: 成功提交订单
- **WHEN** 用户填写完整收货信息并点击"提交订单"按钮
- **THEN** 系统调用创建订单接口（传入 cartIds、receiverName、receiverPhone、receiverAddress、remark、userCouponId），成功后跳转到支付页面（路由包含 paymentNo），显示支付信息

#### Scenario: 提交订单失败（库存不足）
- **WHEN** 用户提交订单但某商品库存不足
- **THEN** 系统显示错误提示"商品库存不足"

#### Scenario: 提交订单失败（优惠券不可用）
- **WHEN** 用户提交订单但选中的优惠券不满足使用条件
- **THEN** 系统显示错误提示

### Requirement: 模拟支付
系统 SHALL 提供模拟支付页面，允许用户模拟完成支付。页面路由使用 paymentNo 参数，通过 /api/payment/{paymentNo} 查询支付信息。

#### Scenario: 成功支付
- **WHEN** 用户在支付页面点击"确认支付"按钮
- **THEN** 系统调用 /api/payment/{paymentNo}/pay 接口，成功后跳转到订单详情页，订单状态变为"已支付/待发货"

#### Scenario: 查看支付状态
- **WHEN** 用户访问支付页面（/payment/:paymentNo）
- **THEN** 系统通过 /api/payment/{paymentNo} 查询支付单信息，页面显示订单号、支付金额、支付方式选择、确认支付按钮

#### Scenario: 提交订单后跳转支付页
- **WHEN** 用户成功提交订单，后端返回 orderNo 和 paymentNo
- **THEN** 页面跳转到 /payment/{paymentNo}，而非使用 orderNo

### Requirement: 订单列表页
系统 SHALL 提供订单列表页，展示用户的历史订单。

#### Scenario: 查看订单列表
- **WHEN** 用户访问订单列表页
- **THEN** 页面显示订单卡片列表，每张卡片包含订单号、下单时间、订单状态、商品摘要和订单金额，支持分页

#### Scenario: 按状态筛选订单
- **WHEN** 用户选择某个订单状态标签（如"待支付"、"待发货"）
- **THEN** 仅显示对应状态的订单

#### Scenario: 订单列表为空
- **WHEN** 用户没有任何订单
- **THEN** 显示空状态提示"暂无订单"

### Requirement: 订单详情页
系统 SHALL 提供订单详情页，展示单个订单的完整信息。

#### Scenario: 查看订单详情
- **WHEN** 用户点击某个订单进入详情页
- **THEN** 页面显示订单号、下单时间、订单状态、商品列表（图片、名称、数量、单价）、收货信息、优惠券信息、订单金额汇总、操作按钮

### Requirement: 取消订单
系统 SHALL 允许用户取消待支付的订单。

#### Scenario: 取消待支付订单
- **WHEN** 用户在订单详情页点击"取消订单"且订单状态为"待支付"
- **THEN** 系统弹出确认提示，确认后订单状态变为"已取消"

#### Scenario: 已支付订单不可取消
- **WHEN** 订单状态为"已支付"或更后续状态
- **THEN** 不显示"取消订单"按钮

### Requirement: 确认收货
系统 SHALL 允许用户对已发货订单进行确认收货。

#### Scenario: 确认收货
- **WHEN** 用户在订单详情页点击"确认收货"且订单状态为"已发货"
- **THEN** 系统弹出确认提示，确认后订单状态变为"已完成"

