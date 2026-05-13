## ADDED Requirements

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

### Requirement: 支付渠道枚举
系统 SHALL 定义 `PaymentChannel` 枚举，包含以下渠道：

| 枚举值 | 中文 |
|--------|------|
| MOCK | 模拟支付 |
| ALIPAY | 支付宝（预留） |
| WECHAT | 微信支付（预留） |

当前仅实现 MOCK 渠道。

#### Scenario: 获取支付渠道描述
- **WHEN** 调用 `PaymentChannel.MOCK.getDescription()`
- **THEN** 返回 "模拟支付"

### Requirement: 支付单创建
系统 SHALL 在订单创建成功后自动创建对应的支付单。支付单的金额 SHALL 等于订单的 `payAmount`（已扣除会员折扣和优惠券后的实付金额）。每个订单仅能有一笔状态为 WAITING_PAY 或 PAYING 的支付单。

#### Scenario: 订单创建后自动生成支付单
- **WHEN** 用户创建订单成功，订单实付金额为 180.00
- **THEN** 系统自动创建支付单，`amount=180.00`，`status=WAITING_PAY`，`channel=MOCK`

#### Scenario: 已有活跃支付单时不创建新支付单
- **WHEN** 订单已有一笔 WAITING_PAY 状态的支付单
- **THEN** 不创建新的支付单

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
