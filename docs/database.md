# 数据库设计

## ER 关系图

```mermaid
erDiagram
    user ||--o{ orders : creates
    user ||--o{ cart : has
    user ||--o{ user_coupon : owns
    user ||--o{ points_record : earns
    user ||--o{ user_sign : signs
    user ||--o{ favorite : collects
    user ||--o{ comment : writes
    user ||--o{ points_exchange : exchanges
    orders ||--o{ order_item : contains
    orders ||--o| payment_order : pays
    orders }o--o| user_coupon : uses
    product ||--o{ order_item : included_in
    product ||--o{ cart : added_to
    product ||--o{ comment : reviewed_in
    product ||--o{ favorite : collected_in
    product ||--|| inventory : tracked_by
    inventory ||--o{ inventory_log : logged_in
    category ||--o{ product : contains
    coupon_template ||--o{ user_coupon : generates
    coupon_template ||--o{ coupon_usage_log : tracks
    points_product ||--o{ points_exchange : exchanged_for

    user {
        bigint id PK
        varchar username UK
        varchar password
        varchar nickname
        varchar phone
        varchar email
        varchar avatar
        tinyint gender
        tinyint role
        tinyint status
        int points
        int level
    }

    orders {
        bigint id PK
        varchar order_no UK
        bigint user_id FK
        decimal total_amount
        decimal pay_amount
        int status
        bigint user_coupon_id FK
        decimal coupon_discount
        varchar payment_method
        datetime pay_time
        varchar receiver_name
        varchar receiver_phone
        varchar receiver_address
    }

    order_item {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        varchar product_name
        varchar product_image
        decimal product_price
        int quantity
        decimal total_price
    }

    product {
        bigint id PK
        varchar name
        varchar subtitle
        text description
        decimal original_price
        decimal price
        int stock
        varchar image
        bigint category_id FK
        tinyint status
        int sales
    }

    category {
        bigint id PK
        varchar name
        bigint parent_id
        tinyint level
        int sort
        tinyint status
    }

    inventory {
        bigint id PK
        bigint product_id UK
        int total_stock
        int available_stock
        int locked_stock
        int sold_stock
        int version
    }

    payment_order {
        bigint id PK
        varchar payment_no UK
        bigint order_id FK
        varchar order_no
        bigint user_id FK
        decimal amount
        varchar channel
        varchar status
        varchar third_trade_no
        datetime paid_time
    }

    cart {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        varchar product_name
        varchar product_image
        decimal product_price
        int quantity
        decimal total_price
        tinyint selected
    }

    user_coupon {
        bigint id PK
        bigint user_id FK
        bigint template_id FK
        varchar coupon_code UK
        varchar coupon_name
        tinyint type
        decimal discount_amount
        decimal discount_percentage
        decimal min_amount
        decimal max_discount
        int member_level
        datetime start_time
        datetime end_time
        tinyint status
        datetime use_time
        bigint order_id FK
        varchar order_no
    }

    coupon_template {
        bigint id PK
        varchar name
        tinyint type
        decimal discount_amount
        decimal discount_percentage
        decimal min_amount
        decimal max_discount
        int total_count
        int received_count
        int used_count
        int member_level
        tinyint status
    }

    points_record {
        bigint id PK
        bigint user_id FK
        int points_change
        int before_points
        int after_points
        tinyint type
        varchar biz_type
        varchar biz_id
        varchar idempotency_key UK
        varchar description
    }

    member_level {
        bigint id PK
        int level UK
        varchar level_name
        int min_points
        int max_points
        decimal discount
        tinyint status
    }

    user_sign {
        bigint id PK
        bigint user_id FK
        date sign_date
        int continuous_days
        int points_earned
    }

    points_product {
        bigint id PK
        varchar name
        tinyint product_type
        bigint relation_id
        int points_required
        int stock
        tinyint status
    }

    points_exchange {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        varchar product_name
        int points_used
        varchar exchange_no UK
        tinyint status
    }

    inventory_log {
        bigint id PK
        bigint product_id FK
        bigint order_id FK
        varchar change_type
        int change_quantity
        int before_available
        int after_available
        varchar remark
    }

    comment {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        bigint order_id FK
        tinyint rating
        text content
        varchar images
        tinyint status
        text reply
    }

    favorite {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
    }

    coupon_usage_log {
        bigint id PK
        bigint user_id FK
        bigint user_coupon_id FK
        bigint template_id FK
        varchar coupon_name
        tinyint coupon_type
        bigint order_id FK
        varchar order_no
        decimal order_amount
        decimal discount_amount
        tinyint action
    }

    payment_callback_log {
        bigint id PK
        varchar payment_no
        varchar channel
        text callback_raw
        varchar result
    }

    message_consume_log {
        bigint id PK
        varchar message_id UK
        varchar queue_name
        tinyint status
        int retry_count
    }
```

## 核心表说明

### 用户与会员

| 表名 | 说明 |
|------|------|
| `user` | 用户基础信息、积分、等级、角色 |
| `member_level` | 会员等级配置（5 级：普通 → 钻石） |
| `user_sign` | 签到记录，`uk_user_date` 唯一约束防止重复签到 |

### 商品与分类

| 表名 | 说明 |
|------|------|
| `product` | 商品信息，`stock` 字段与 `inventory.available_stock` 同步 |
| `category` | 商品分类，支持多级（`parent_id`） |

### 订单与支付

| 表名 | 说明 |
|------|------|
| `orders` | 订单主表，含会员折扣、优惠券金额、收货信息 |
| `order_item` | 订单明细，记录每个商品的购买数量和价格 |
| `payment_order` | 支付单，`uk_payment_no` 唯一，记录支付状态和第三方交易号 |
| `payment_callback_log` | 支付回调日志，记录每次回调的原始数据和处理结果 |

### 库存

| 表名 | 说明 |
|------|------|
| `inventory` | 库存主表，三态分离（`available`/`locked`/`sold`），乐观锁 `version` |
| `inventory_log` | 库存变动流水，记录每次操作的前后状态 |

### 优惠券

| 表名 | 说明 |
|------|------|
| `coupon_template` | 优惠券模板，定义优惠规则和发放数量 |
| `user_coupon` | 用户持有的优惠券，6 种状态生命周期 |
| `coupon_usage_log` | 使用/返还记录 |

### 积分

| 表名 | 说明 |
|------|------|
| `points_record` | 积分流水，`biz_type + biz_id` 唯一约束实现幂等 |
| `points_product` | 积分兑换商品，支持实物和优惠券两种类型 |
| `points_exchange` | 积分兑换记录 |

### 消息消费

| 表名 | 说明 |
|------|------|
| `message_consume_log` | MQ 消息消费日志，`message_id` 唯一约束实现消费幂等 |

## Flyway 迁移策略

### 迁移脚本管理

- 脚本位于 `easymall-backend/src/main/resources/db/migration/`
- 命名格式：`V{N}__{description}.sql`
- Flyway 在应用启动时自动执行未应用的迁移

### 迁移版本说明

| 版本 | 说明 |
|------|------|
| V1 | 核心表创建：`user`、`category`、`product`、`orders`、`order_item`、`cart`、`comment`、`favorite` |
| V2 | 会员系统：`member_level`、`points_record`、`user_sign` |
| V3 | 积分兑换：`points_product`、`points_exchange` |
| V5 | 优惠券系统：`coupon_template`、`user_coupon`、`coupon_usage_log`；订单添加优惠券字段 |
| V6 | 库存系统：`inventory`、`inventory_log`；从 `product.stock` 初始化 `inventory` 数据 |
| V7 | 支付系统：`payment_order`、`payment_callback_log` |
| V8 | 消息消费日志：`message_consume_log` |
| V9 | 积分幂等：`points_record` 添加 `idempotency_key` 唯一约束 |
| V10 | 优惠券生命周期索引优化 |
| V11 | 积分业务标识：`points_record` 添加 `biz_type`、`biz_id` 列及唯一索引 |

### 生产环境配置

```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true   # 首次部署时自动创建基线
```

- `baseline-on-migrate: true` 允许在已有数据库上首次执行 Flyway
- 所有迁移脚本使用 `IF NOT EXISTS` 和 `ON DUPLICATE KEY UPDATE`，支持重复执行
