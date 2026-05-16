## ADDED Requirements

### Requirement: 数据库设计概览文档
`docs/database.md` SHALL 提供完整的数据库设计概览，包含 ER 图和核心表说明。

#### Scenario: 读者理解数据库 ER 关系
- **WHEN** 读者打开 docs/database.md
- **THEN** 看到 Mermaid 绘制的 ER 图，展示核心表之间的关系
- **AND** 理解用户、商品、订单、支付单、库存、优惠券、积分之间的关系

#### Scenario: 读者理解核心表结构
- **WHEN** 读者查看核心表说明部分
- **THEN** 看到各表的字段说明（user、product、category、order、order_item、cart、payment_order、inventory、inventory_log、coupon_template、user_coupon、points_record、member_level 等）
- **AND** 理解关键字段的业务含义

#### Scenario: 读者理解数据库迁移策略
- **WHEN** 读者查看迁移策略部分
- **THEN** 理解 Flyway 迁移脚本的管理方式
- **AND** 看到现有迁移脚本的版本说明
