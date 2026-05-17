## ADDED Requirements

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

## MODIFIED Requirements

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
