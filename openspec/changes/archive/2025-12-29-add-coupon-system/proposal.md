# Change: 添加优惠券系统

## Why

当前 EasyMall 系统已具备完整的会员等级体系和积分系统，但缺少优惠券这一重要的营销工具。优惠券系统能够：

1. **提升用户活跃度** - 通过发放优惠券吸引用户下单
2. **促进销售转化** - 降低用户购买门槛，提高订单转化率
3. **精准营销** - 针对不同会员等级发放不同类型优惠券
4. **与现有系统集成** - 优惠券可与会员等级、积分兑换系统无缝结合

## What Changes

### 新增功能模块

1. **优惠券类型支持**
   - 固定金额优惠券（满减券）
   - 百分比折扣优惠券（折扣券）
   - 新人专享券
   - 会员等级专属券

2. **优惠券发放方式**
   - 用户主动领取（优惠券中心）
   - 积分兑换优惠券
   - 系统自动发放（新人注册、会员升级）
   - 管理员手动发放

3. **用户优惠券管理**
   - 查看我的优惠券列表（可用/已使用/已过期）
   - 下单时选择使用优惠券
   - 优惠券使用记录查询

4. **后台管理功能**
   - 优惠券模板管理（创建、编辑、删除、上下架）
   - 发放记录管理
   - 使用情况统计

### 技术实现

- 使用 Spring Boot 4.0.1 现代特性（Virtual Threads、Observability）
- 采用 MyBatis Plus 进行数据访问
- 使用 Redis 缓存优惠券模板数据
- 遵循项目现有的三层架构和 Result<T> 响应格式

## Impact

### 影响的功能模块（Affected specs）

- **order-management** - 订单创建时需要支持优惠券抵扣
- **points-exchange** - 积分兑换系统新增兑换优惠券功能
- **member-level** - 会员等级权益增加专属优惠券

### 影响的代码文件

- 新增：`src/main/java/org/ruikun/entity/Coupon*.java`（优惠券相关实体）
- 新增：`src/main/java/org/ruikun/controller/CouponController.java`
- 新增：`src/main/java/org/ruikun/service/ICouponService.java`
- 修改：`src/main/java/org/ruikun/service/impl/OrderServiceImpl.java`（支持优惠券计算）
- 新增：`src/main/resources/db/migration/V5__Add_coupon_tables.sql`

### 数据库变更

新增表：
- `coupon_template` - 优惠券模板表
- `user_coupon` - 用户优惠券表
- `coupon_usage_log` - 优惠券使用记录表

### 兼容性

- **非破坏性变更** - 现有订单、积分、会员功能不受影响
- **渐进式增强** - 优惠券使用为可选功能，不影响现有下单流程
