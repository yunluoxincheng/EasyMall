# payment-order-management Specification

## Purpose
定义支付单管理，包括支付单表结构、回调日志、状态枚举、支付渠道模型、支付方式选择、渠道可用性控制、支付发起边界，以及支付单创建、查询和状态流转规则。支持扩展国内和国际支付渠道。

## Requirements
### Requirement: 支付单表结构
系统 SHALL 维护 `payment_order` 表，每条记录对应一笔支付单，包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| payment_no | VARCHAR(64) NOT NULL UNIQUE | 支付单号 |
| order_id | BIGINT NOT NULL | 关联订单ID |
| order_no | VARCHAR(64) NOT NULL | 关联订单号 |
| user_id | BIGINT NOT NULL | 用户ID |
| amount | DECIMAL(10,2) NOT NULL | 支付金额 |
| channel | VARCHAR(32) NOT NULL | 支付渠道 |
| status | VARCHAR(32) NOT NULL | 支付状态 |
| third_trade_no | VARCHAR(128) | 第三方交易号 |
| paid_time | DATETIME | 支付完成时间 |
| create_time | DATETIME DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

索引：`idx_order_id(order_id)`、`idx_order_no(order_no)`、`idx_user_id(user_id)`。

#### Scenario: 订单创建时自动生成支付单
- **WHEN** 用户成功创建订单（订单号为 "ORD20241223001"），订单金额为 199.00
- **THEN** 系统自动在 `payment_order` 表创建一条记录：`order_id` 为该订单ID，`amount=199.00`，`status=WAITING_PAY`，`payment_no` 为系统生成的唯一支付单号

#### Scenario: 支付单号全局唯一
- **WHEN** 系统生成支付单号
- **THEN** 支付单号格式为 "PAY" + 时间戳 + 随机数，且全局唯一

### Requirement: 支付回调日志表结构
系统 SHALL 维护 `payment_callback_log` 表，记录每次支付回调的原始数据，包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| payment_no | VARCHAR(64) NOT NULL | 支付单号 |
| channel | VARCHAR(32) NOT NULL | 支付渠道 |
| callback_raw | TEXT | 回调原始数据 |
| result | VARCHAR(32) | 处理结果 |
| create_time | DATETIME DEFAULT CURRENT_TIMESTAMP | 创建时间 |

索引：`idx_payment_no(payment_no)`。

#### Scenario: 每次回调均记录日志（成功场景）
- **WHEN** 支付回调到达系统且处理成功
- **THEN** `payment_callback_log` 新增一条记录，包含 `callback_raw` 原始数据，`result` 为 "SUCCESS"

#### Scenario: 每次回调均记录日志（失败场景）
- **WHEN** 支付回调到达系统但处理失败（如金额不一致、支付单不存在）
- **THEN** `payment_callback_log` 仍新增一条记录，包含 `callback_raw` 原始数据，`result` 为具体错误原因；日志在独立事务中写入，不随主流程异常回滚

### Requirement: 支付状态枚举
系统 SHALL 定义 `PaymentStatus` 枚举，包含以下状态：

| 枚举值 | 中文 | 说明 |
|--------|------|------|
| WAITING_PAY | 待支付 | 初始状态 |
| PAYING | 支付中 | 用户已发起支付 |
| PAID | 已支付 | 支付成功 |
| CLOSED | 已关闭 | 支付单已关闭（订单取消） |
| FAILED | 支付失败 | 支付失败 |

#### Scenario: 通过编码获取枚举
- **WHEN** 调用 `PaymentStatus.fromCode("WAITING_PAY")`
- **THEN** 返回 `PaymentStatus.WAITING_PAY`

### Requirement: 支付渠道模型
系统 SHALL 定义前端支付渠道模型，并 SHALL 在后端具备真实渠道能力时与后端 `PaymentChannel` 或等价渠道标识保持一致。第一版后端 MAY 仅保持 MOCK 可执行，真实渠道 MAY 作为前端可展示但不可执行的渠道模型存在。

| 枚举值 | 中文 | 说明 |
|--------|------|------|
| MOCK | 模拟支付 | 本地开发与测试使用 |
| ALIPAY | 支付宝 | 国内支付渠道 |
| WECHAT | 微信支付 | 国内支付渠道 |
| UNIONPAY | 银联/云闪付 | 国内银行卡与云闪付渠道 |
| STRIPE | Stripe | 国际卡支付与钱包聚合渠道 |
| PAYPAL | PayPal | 国际 PayPal 支付渠道 |
| APPLE_PAY | Apple Pay | 国际钱包渠道，可通过支持的支付服务商执行 |
| GOOGLE_PAY | Google Pay | 国际钱包渠道，可通过支持的支付服务商执行 |

#### Scenario: 获取支付渠道描述
- **WHEN** 调用 `PaymentChannel.MOCK.getDescription()` 或等价渠道描述能力
- **THEN** 返回 "模拟支付"

#### Scenario: 获取国际支付渠道描述
- **WHEN** 调用 Stripe、PayPal、Apple Pay 或 Google Pay 的渠道描述能力
- **THEN** 系统 SHALL 返回对应渠道的用户可读名称

#### Scenario: 后端暂未扩展真实渠道枚举
- **WHEN** 后端仅支持 MOCK 支付渠道
- **THEN** 前端 SHALL 仍可展示真实渠道模型，但 SHALL 将其标记为不可用并阻止发起支付

### Requirement: 支付方式选择
系统 SHALL 在支付页面提供支付方式选择能力，覆盖开发模拟支付、国内主流支付和国际主流支付的展示模型；只有已配置且后端支持发起的真实渠道 SHALL 可执行支付。

#### Scenario: 查看可用支付方式
- **WHEN** 用户进入待支付订单的支付页面
- **THEN** 页面 SHALL 展示当前环境的支付方式列表，至少支持展示 MOCK、支付宝、微信支付、银联/云闪付、Stripe、PayPal、Apple Pay、Google Pay 的渠道模型和可用状态

#### Scenario: 选择支付方式
- **WHEN** 用户选择某个支付方式
- **THEN** 页面 SHALL 将该渠道作为当前选择，并展示该渠道对应的支付说明、可用状态或不可用原因

### Requirement: 支付渠道可用性
系统 SHALL 支持按环境、配置和订单上下文控制支付渠道可用性。

#### Scenario: 本地开发展示模拟支付
- **WHEN** 系统运行在本地开发环境
- **THEN** 支付页面 SHALL 保留 MOCK 支付方式用于完整联调订单支付流程

#### Scenario: 未配置渠道不可发起真实支付
- **WHEN** 某个真实支付渠道缺少必要商户配置
- **THEN** 系统 SHALL 不允许用户通过该渠道发起真实支付，并展示清晰不可用状态

### Requirement: 支付发起边界
系统 SHALL 保证 MOCK 支付在第一版可执行；真实支付渠道 SHALL 仅在具备必要后端发起能力、商户配置和回调处理能力时进入真实支付流程。

#### Scenario: 发起模拟支付
- **WHEN** 用户选择 MOCK 渠道并点击支付
- **THEN** 系统 SHALL 执行模拟支付流程并更新支付状态

#### Scenario: 尝试发起未配置真实支付
- **WHEN** 用户选择未配置的真实支付渠道并尝试支付
- **THEN** 系统 SHALL 阻止发起支付，并提示该支付方式暂未配置或暂不可用

### Requirement: 支付单创建
系统 SHALL 在订单创建成功后自动创建对应的支付单。支付单的金额 SHALL 等于订单的 `payAmount`（已扣除会员折扣和优惠券后的实付金额）。每个订单仅能有一笔状态为 WAITING_PAY 或 PAYING 的支付单。支付渠道 SHALL 可在发起支付时由用户选择或更新。

#### Scenario: 订单创建后自动生成支付单
- **WHEN** 用户创建订单成功，订单实付金额为 180.00
- **THEN** 系统自动创建支付单，`amount=180.00`，`status=WAITING_PAY`，默认渠道为 MOCK 或系统配置的默认渠道

#### Scenario: 已有活跃支付单时不创建新支付单
- **WHEN** 订单已有一笔 WAITING_PAY 状态的支付单
- **THEN** 不创建新的支付单

#### Scenario: 用户选择支付渠道后发起支付
- **WHEN** 用户在支付页面选择 MOCK 或已配置的 ALIPAY、WECHAT、STRIPE 或其他可用渠道并发起支付
- **THEN** 系统 SHALL 将支付单进入对应支付流程，并返回该渠道需要的二维码、跳转地址、钱包调用参数或模拟支付结果

### Requirement: 支付单查询
系统 SHALL 提供按支付单号查询支付单详情的能力。

#### Scenario: 查询存在的支付单
- **WHEN** 用户查询支付单号 "PAY20241223001"
- **THEN** 返回支付单详情，包含 paymentNo、amount、status、channel、createTime

#### Scenario: 查询不存在的支付单
- **WHEN** 用户查询不存在的支付单号
- **THEN** 返回错误，ResponseCode 为 `PAYMENT_NOT_FOUND`

### Requirement: 支付单状态流转规则
支付单状态 SHALL 按以下规则流转：

| 当前状态 | 允许转换到 |
|----------|-----------|
| WAITING_PAY | PAYING, CLOSED |
| PAYING | PAID, FAILED, CLOSED |
| PAID | （终态） |
| CLOSED | （终态） |
| FAILED | WAITING_PAY（允许重新发起） |

#### Scenario: 合法转换——待支付到支付中
- **WHEN** 支付单状态为 WAITING_PAY，用户发起支付
- **THEN** 状态变更为 PAYING

#### Scenario: 合法转换——支付中到已支付
- **WHEN** 支付单状态为 PAYING，支付回调成功
- **THEN** 状态变更为 PAID，记录 paid_time

#### Scenario: 非法转换——已支付到支付中
- **WHEN** 支付单状态为 PAID，尝试转换为 PAYING
- **THEN** 转换失败，抛出 BusinessException
