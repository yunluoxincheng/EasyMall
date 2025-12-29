## 1. 数据库设计与迁移

- [x] 1.1 创建 `V5__Add_coupon_tables.sql` 迁移脚本
  - `coupon_template` 优惠券模板表
  - `user_coupon` 用户优惠券表
  - `coupon_usage_log` 优惠券使用记录表
- [x] 1.2 为 `points_product` 表添加 `product_type` 和 `relation_id` 字段支持优惠券兑换
- [x] 1.3 添加索引优化查询性能
- [x] 1.4 初始化测试数据（示例优惠券模板）

## 2. 实体类和枚举创建

- [x] 2.1 创建 `CouponType` 枚举（FIXED_AMOUNT, PERCENTAGE, NEWCOMER, MEMBER_EXCLUSIVE）
- [x] 2.2 创建 `CouponStatus` 枚举（UNUSED, USED, EXPIRED）
- [x] 2.3 创建 `CouponTemplate` 实体类
- [x] 2.4 创建 `UserCoupon` 实体类
- [x] 2.5 创建 `CouponUsageLog` 实体类

## 3. 数据访问层（Mapper）

- [x] 3.1 创建 `CouponTemplateMapper` 接口
- [x] 3.2 创建 `UserCouponMapper` 接口
- [x] 3.3 创建 `CouponUsageLogMapper` 接口
- [x] 3.4 创建对应的 MyBatis XML 映射文件

## 4. DTO 和 VO 创建

- [x] 4.1 创建 `CouponTemplateDTO`（管理员保存优惠券模板）
- [x] 4.2 创建 `CouponTemplateQueryDTO`（管理员查询优惠券模板）
- [x] 4.3 创建 `CouponReceiveDTO`（用户领取优惠券）
- [x] 4.4 创建 `CouponCalculateDTO`（计算优惠金额）
- [x] 4.5 创建 `CouponTemplateVO`（优惠券模板视图对象）
- [x] 4.6 创建 `UserCouponVO`（用户优惠券视图对象）
- [x] 4.7 创建 `CouponUsageLogVO`（使用记录视图对象）

## 5. Service 层实现

- [x] 5.1 创建 `ICouponService` 接口
- [x] 5.2 实现 `CouponServiceImpl` 核心业务逻辑
  - 领取优惠券（含数量限制验证）
  - 查询用户优惠券列表（按状态分类）
  - 计算优惠金额
  - 使用优惠券
  - 返还优惠券（订单取消）
  - 优惠券过期检查定时任务
- [x] 5.3 创建 `ICouponAdminService` 接口
- [x] 5.4 实现 `CouponAdminServiceImpl` 管理功能
  - 创建优惠券模板
  - 更新优惠券模板
  - 下架/上架优惠券
  - 查询优惠券模板列表
  - 查询优惠券使用记录
  - 优惠券数据统计

## 6. Controller 层实现

- [x] 6.1 创建 `CouponController`（用户端）
  - `GET /api/coupon/templates` - 获取可领取的优惠券列表
  - `POST /api/coupon/receive/{templateId}` - 领取优惠券
  - `GET /api/coupon/my` - 查看我的优惠券列表
  - `POST /api/coupon/calculate` - 计算优惠金额
  - `GET /api/coupon/available` - 获取可用优惠券（下单时）
- [x] 6.2 创建 `CouponAdminController`（管理端）
  - `GET /api/admin/coupon/templates` - 查询优惠券模板列表
  - `POST /api/admin/coupon/template` - 创建优惠券模板
  - `PUT /api/admin/coupon/template/{id}` - 更新优惠券模板
  - `PUT /api/admin/coupon/template/{id}/status` - 上下架优惠券
  - `DELETE /api/admin/coupon/template/{id}` - 删除优惠券模板
  - `GET /api/admin/coupon/usage-logs` - 查询使用记录
  - `GET /api/admin/coupon/statistics` - 优惠券统计数据

## 7. 集成现有系统

- [x] 7.1 修改 `OrderServiceImpl` 支持优惠券
  - 创建订单时接收优惠券ID参数
  - 验证优惠券有效性
  - 计算并扣减优惠金额
  - 扣减优惠券
  - 记录优惠券使用日志
- [x] 7.2 修改 `OrderServiceImpl` 支持订单取消返还优惠券
  - 取消待支付订单时返还优惠券
  - 清除优惠券使用记录
- [x] 7.3 扩展 `PointsExchangeServiceImpl` 支持兑换优惠券
  - 判断兑换商品类型
  - 调用优惠券服务发放优惠券
- [x] 7.4 实现 `MemberServiceImpl` 会员升级发放优惠券
  - 监听会员等级变化
  - 自动发放对应等级专属优惠券
- [x] 7.5 实现 `UserServiceImpl` 新用户注册发放新人券
  - 注册成功后自动发放新人专享优惠券

## 8. 缓存实现

- [ ] 8.1 创建 `CouponCacheService` 缓存服务
- [ ] 8.2 实现优惠券模板缓存
  - 上架模板列表缓存
  - 单个模板详情缓存
- [ ] 8.3 实现用户优惠券列表缓存
- [ ] 8.4 实现缓存失效策略
  - 修改/删除模板时清除缓存
  - 领取/使用优惠券时清除用户缓存

## 9. 定时任务

- [x] 9.1 创建 `CouponScheduledTask` 定时任务类
- [x] 9.2 实现优惠券过期检查任务
  - 扫描所有未使用且已过期的优惠券
  - 批量更新状态为已过期
- [x] 9.3 配置定时任务执行策略（每5分钟执行一次）

## 10. 异常处理和响应码

- [x] 10.1 在 `ResponseCode` 中添加优惠券相关状态码
  - COUPON_NOT_FOUND - 优惠券不存在
  - COUPON_ALREADY_RECEIVED - 已领取过该优惠券
  - COUPON_OUT_OF_STOCK - 优惠券已领完
  - COUPON_EXPIRED - 优惠券已过期
  - COUPON_USAGE_LIMIT_EXCEEDED - 超过使用次数限制
  - COUPON_AMOUNT_THRESHOLD_NOT_MET - 不满足使用门槛
  - COUPON_MEMBER_LEVEL_NOT_MET - 会员等级不足

## 11. 验证和安全

- [x] 11.1 添加 DTO 参数验证注解（`@Valid`, `@NotNull`, `@Min`, `@Max` 等）
- [x] 11.2 配置管理端接口权限控制（`@PreAuthorize("hasRole('ADMIN')")`）
- [x] 11.3 添加优惠券操作的业务安全检查（防重复领取、防超发）

## 12. 单元测试

- [ ] 12.1 测试优惠券领取功能
  - 正常领取
  - 重复领取限制
  - 数量上限限制
- [ ] 12.2 测试优惠券使用功能
  - 正常使用
  - 不满足门槛
  - 过期券使用
- [ ] 12.3 测试优惠券计算逻辑
  - 固定金额券计算
  - 百分比券计算
  - 会员折扣叠加
- [ ] 12.4 测试订单取消返还优惠券
- [ ] 12.5 测试积分兑换优惠券

## 13. 集成测试

- [ ] 13.1 测试完整的优惠券使用流程
  - 领取 -> 查看 -> 下单使用 -> 创建订单
- [ ] 13.2 测试订单取消返还流程
- [ ] 13.3 测试积分兑换优惠券流程
- [ ] 13.4 测试会员升级发放优惠券流程
- [ ] 13.5 测试新人注册发放优惠券流程

## 14. 文档更新

- [x] 14.1 更新 README.md 添加优惠券功能说明
- [x] 14.2 添加优惠券相关 API 接口文档
- [ ] 14.3 更新数据库设计文档

## 15. 验证和发布

- [x] 15.1 执行 `openspec validate add-coupon-system --strict` 验证提案
- [ ] 15.2 本地运行测试确保功能正常
- [ ] 15.3 使用 Docker 测试完整流程
- [ ] 15.4 提交代码并创建 Pull Request
