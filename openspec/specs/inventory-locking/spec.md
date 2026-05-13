# inventory-locking Specification

## Purpose
TBD - created by archiving change add-inventory-locking-model. Update Purpose after archive.
## Requirements
### Requirement: 库存表结构
系统 SHALL 维护独立的 `inventory` 表，每个商品对应一条库存记录，包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| product_id | BIGINT NOT NULL UNIQUE | 商品ID（唯一约束） |
| total_stock | INT NOT NULL DEFAULT 0 | 总库存 |
| available_stock | INT NOT NULL DEFAULT 0 | 可售库存 |
| locked_stock | INT NOT NULL DEFAULT 0 | 锁定库存 |
| sold_stock | INT NOT NULL DEFAULT 0 | 已售库存 |
| version | INT NOT NULL DEFAULT 0 | 乐观锁版本号 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

不变量约束：`available_stock + locked_stock + sold_stock = total_stock`。

#### Scenario: 新商品创建时自动初始化库存记录
- **WHEN** 管理员创建一个新商品，设置库存为 100
- **THEN** 系统同时在 `inventory` 表插入一条记录：`total_stock=100, available_stock=100, locked_stock=0, sold_stock=0, version=0`

#### Scenario: 已有商品初始化库存记录
- **WHEN** 执行数据迁移脚本
- **THEN** 所有未删除商品的 `product.stock` 值迁移为 `inventory.available_stock` 和 `inventory.total_stock`

### Requirement: 库存流水表结构
系统 SHALL 维护 `inventory_log` 表，记录所有库存变动，包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| product_id | BIGINT NOT NULL | 商品ID |
| order_id | BIGINT | 关联订单ID（可空） |
| change_type | VARCHAR(50) NOT NULL | 变动类型 |
| change_quantity | INT NOT NULL | 变动数量（正数） |
| before_available | INT | 变动前可售库存 |
| after_available | INT | 变动后可售库存 |
| remark | VARCHAR(255) | 备注 |
| create_time | DATETIME | 创建时间 |

`change_type` 枚举值包括：`ORDER_LOCK`、`ORDER_RELEASE`、`PAYMENT_CONFIRM`、`ADMIN_ADJUST`、`INITIALIZE`。

#### Scenario: 库存变动自动记录流水
- **WHEN** 订单 1001 锁定商品 5 的库存 2 件，锁定前 available_stock 为 50
- **THEN** `inventory_log` 新增一条记录：`product_id=5, order_id=1001, change_type=ORDER_LOCK, change_quantity=2, before_available=50, after_available=48`

### Requirement: 锁定库存
系统 SHALL 提供 `InventoryService.lockStock(productId, quantity, orderId)` 方法，在订单创建时锁定库存。

锁定操作 SHALL 原子性地：
1. 检查 `available_stock >= quantity`，否则抛出 `BUSINESS_ERROR`（商品库存不足）
2. `available_stock -= quantity`，`locked_stock += quantity`
3. `version += 1`
4. SQL 条件：`WHERE product_id = ? AND available_stock >= ? AND version = ?`
5. 如果影响行数为 0，抛出 `PRODUCT_OUT_OF_STOCK` 异常
6. 记录 `inventory_log`（change_type = `ORDER_LOCK`）
7. 同步更新 `product.stock = inventory.available_stock`

#### Scenario: 库存充足时锁定成功
- **WHEN** 商品库存 available_stock=100，锁定 3 件
- **THEN** 锁定成功，available_stock=97，locked_stock=3，version 递增，product.stock 更新为 97

#### Scenario: 库存不足时锁定失败
- **WHEN** 商品库存 available_stock=2，尝试锁定 5 件
- **THEN** 抛出 BusinessException（ResponseCode 为 PRODUCT_OUT_OF_STOCK），库存数据不变

#### Scenario: 并发锁定时其中一个失败
- **WHEN** 商品 available_stock=5，两个并发请求同时锁定 3 件
- **THEN** 仅一个成功，另一个因 version 不匹配或 available_stock 不足而失败

### Requirement: 释放锁定库存
系统 SHALL 提供 `InventoryService.releaseLockedStock(productId, quantity, orderId)` 方法，在订单取消时释放锁定库存。

释放操作 SHALL 原子性地：
1. `locked_stock -= quantity`，`available_stock += quantity`
2. `version += 1`
3. SQL 条件：`WHERE product_id = ? AND locked_stock >= ? AND version = ?`
4. 如果影响行数为 0，抛出业务异常
5. 记录 `inventory_log`（change_type = `ORDER_RELEASE`）
6. 同步更新 `product.stock = inventory.available_stock`

#### Scenario: 订单取消时释放库存成功
- **WHEN** 订单取消，商品 locked_stock=3，释放 3 件
- **THEN** 释放成功，locked_stock=0，available_stock 增加 3，product.stock 同步更新

#### Scenario: 释放数量超过锁定数量时失败
- **WHEN** 商品 locked_stock=2，尝试释放 5 件
- **THEN** 抛出 BusinessException，库存数据不变

#### Scenario: 重复释放被阻止
- **WHEN** 同一订单对同一商品重复调用释放库存
- **THEN** 第二次释放因 locked_stock 已为 0 而失败，抛出 BusinessException

### Requirement: 确认已售库存
系统 SHALL 提供 `InventoryService.confirmSoldStock(productId, quantity, orderId)` 方法，在支付成功时将锁定库存转为已售库存。

确认操作 SHALL 原子性地：
1. `locked_stock -= quantity`，`sold_stock += quantity`
2. `version += 1`
3. SQL 条件：`WHERE product_id = ? AND locked_stock >= ? AND version = ?`
4. 如果影响行数为 0，抛出业务异常
5. 记录 `inventory_log`（change_type = `PAYMENT_CONFIRM`）

注意：confirmSoldStock 仅在 locked_stock 和 sold_stock 之间转换，available_stock 不变，因此不需要同步 product.stock。

#### Scenario: 支付成功确认库存
- **WHEN** 支付成功，商品 locked_stock=3，确认 3 件
- **THEN** 确认成功，locked_stock=0，sold_stock 增加 3

#### Scenario: 确认数量超过锁定数量时失败
- **WHEN** 商品 locked_stock=2，尝试确认 5 件
- **THEN** 抛出 BusinessException，库存数据不变

### Requirement: 管理员库存调整
系统 SHALL 提供 `InventoryService.adjustStock(productId, quantity, remark)` 方法，供管理员手动调整库存。

调整操作 SHALL：
1. 修改 `total_stock` 和 `available_stock`（正数为增加，负数为减少）
2. `version += 1`
3. 确保调整后 `available_stock` 不为负
4. 记录 `inventory_log`（change_type = `ADMIN_ADJUST`）
5. 同步更新 `product.stock = inventory.available_stock`

#### Scenario: 管理员增加库存
- **WHEN** 管理员为商品增加 50 件库存
- **THEN** total_stock 增加 50，available_stock 增加 50，product.stock 同步更新

#### Scenario: 管理员减少库存不超过可售库存
- **WHEN** 管理员减少商品库存 10 件，当前 available_stock=50
- **THEN** total_stock 减少 10，available_stock 减少 10，product.stock 同步更新

#### Scenario: 管理员减少库存超过可售库存
- **WHEN** 管理员减少商品库存 60 件，当前 available_stock=50
- **THEN** 抛出 BusinessException，库存数据不变

### Requirement: 库存查询
系统 SHALL 提供按商品ID查询库存记录的能力，返回 `available_stock`、`locked_stock`、`sold_stock`。

#### Scenario: 查询商品库存
- **WHEN** 查询商品 ID=5 的库存
- **THEN** 返回该商品的 available_stock、locked_stock、sold_stock 信息

#### Scenario: 查询不存在的商品库存
- **WHEN** 查询不存在的商品 ID 的库存
- **THEN** 返回 null

### Requirement: 管理员绝对值设置库存
系统 SHALL 提供 `InventoryService.setStock(productId, newTotalStock, remark)` 方法，供管理员通过绝对值设置库存总量。

该方法 SHALL：
1. 查询当前 inventory 记录获取 `currentTotalStock`
2. 计算差值 `delta = newTotalStock - currentTotalStock`
3. 如果 `delta == 0`，不执行任何操作
4. 如果 `delta > 0`，调用 `adjustStock(productId, delta, remark)` 增加库存
5. 如果 `delta < 0`，调用 `adjustStock(productId, delta, remark)` 减少库存（adjustStock 内部保证 available_stock 不为负）
6. 同步更新 `product.stock = inventory.available_stock`

#### Scenario: 管理员设置库存为更大的值
- **WHEN** 当前 total_stock=100，管理员设置新库存为 150
- **THEN** total_stock=150，available_stock 增加 50，product.stock 同步更新

#### Scenario: 管理员设置库存为更小的值且可售库存充足
- **WHEN** 当前 total_stock=100，available_stock=80，管理员设置新库存为 70
- **THEN** total_stock=70，available_stock=50（减少 30），product.stock 同步更新

#### Scenario: 管理员设置库存为更小的值但可售库存不足
- **WHEN** 当前 total_stock=100，available_stock=20，locked_stock=80，管理员设置新库存为 50
- **THEN** 抛出 BusinessException，因为减少 50 会使得 available_stock 为 -30（不可为负）

### Requirement: Timeout cancellation releases locked stock
When an order is cancelled by delayed order close, the system SHALL release locked inventory by calling the existing locked-stock release behavior for every order item.

#### Scenario: Delayed close releases stock
- **WHEN** an unpaid order containing product ID 2001 with quantity 2 is cancelled by timeout
- **THEN** `InventoryService.releaseLockedStock(2001, 2, orderId)` is executed and the product's locked stock decreases while available stock increases

#### Scenario: Paid order delayed message does not release stock
- **WHEN** a delayed close message is consumed for a paid order
- **THEN** the system does not call locked-stock release for that order

