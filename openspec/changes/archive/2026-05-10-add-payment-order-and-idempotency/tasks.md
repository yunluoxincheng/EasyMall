## 1. Database

- [x] 1.1 创建 `payment_order` 表迁移脚本（payment_no、order_id、order_no、user_id、amount、channel、status、third_trade_no、paid_time、索引）
- [x] 1.2 创建 `payment_callback_log` 表迁移脚本（payment_no、channel、callback_raw、result、索引）
- [x] 1.3 新增 `PaymentStatus` 枚举（WAITING_PAY、PAYING、PAID、CLOSED、FAILED）
- [x] 1.4 新增 `PaymentChannel` 枚举（MOCK、ALIPAY 预留、WECHAT 预留）

## 2. Payment Module

- [x] 2.1 创建 `modules/payment` 模块目录结构（controller、service、entity、mapper、dto、vo）
- [x] 2.2 创建 `PaymentOrder` 实体类（对应 payment_order 表）
- [x] 2.3 创建 `PaymentCallbackLog` 实体类（对应 payment_callback_log 表）
- [x] 2.4 创建 `PaymentOrderMapper` 接口
- [x] 2.5 创建 `PaymentCallbackLogMapper` 接口
- [x] 2.6 创建 `PaymentVO` 返回视图对象
- [x] 2.7 创建 `PaymentCallbackDTO`（请求体：paymentNo、amount、channel）
- [x] 2.8 创建 `IPaymentService` 接口（定义 createPayment、getByPaymentNo、getByOrderId、pay、processCallback、closeByOrderId）
- [x] 2.9 创建 `IPaymentCallbackLogService` 接口（定义 saveLog、updateResult），独立事务写入回调日志
- [x] 2.10 实现 `PaymentCallbackLogServiceImpl`——所有方法使用 `REQUIRES_NEW` 事务传播，确保日志不受主事务回滚影响
- [x] 2.11 实现 `PaymentServiceImpl`——创建支付单逻辑
- [x] 2.12 实现 `PaymentServiceImpl`——模拟支付发起逻辑（pay），注入 OrderMapper + OrderStateMachine（不注入 OrderService，避免循环依赖）
- [x] 2.13 实现 `PaymentServiceImpl`——回调处理逻辑（processCallback）：先通过 PaymentCallbackLogService 在 REQUIRES_NEW 事务创建日志（result=RECEIVED），再执行业务校验，每个分支通过独立事务更新日志 result，含幂等 CAS 校验、金额校验
- [x] 2.14 实现 `PaymentServiceImpl`——关闭支付单逻辑（closeByOrderId）
- [x] 2.15 创建 `PaymentController`——`POST /api/payment/{paymentNo}/pay`（JWT 认证）、`POST /api/payment/callback`（permitAll + X-Mock-Signature 校验）、`GET /api/payment/{paymentNo}`（JWT 认证）、`GET /api/payment/order/{orderId}`（JWT 认证）

## 3. Order Integration

- [x] 3.1 修改 `OrderServiceImpl.createOrder()`：下单成功后调用 `PaymentService.createPayment()` 自动创建支付单
- [x] 3.2 修改 `OrderServiceImpl.cancelOrder()`：取消订单时调用 `PaymentService.closeByOrderId()` 关闭活跃支付单
- [x] 3.3 修改 `OrderController` 的 `PUT /api/order/{orderId}/pay` 端点：改为查询并返回关联支付单信息（paymentNo、amount、status、channel），不再直接修改订单状态
- [x] 3.4 修改 `IOrderService.payOrder()` 和 `OrderServiceImpl.payOrder()`：改为查询支付单信息返回给 Controller，不再执行状态变更和库存确认
- [x] 3.5 修改 `createOrder` 返回值：返回包含 orderNo 和 paymentNo 的 VO，而非仅 orderNo

## 4. ResponseCode

- [x] 4.1 新增 `PAYMENT_NOT_FOUND`（404，支付单不存在）
- [x] 4.2 新增 `PAYMENT_ALREADY_PAID`（400，支付单已支付）
- [x] 4.3 新增 `PAYMENT_STATUS_INVALID`（400，支付状态不允许此操作）
- [x] 4.4 新增 `PAYMENT_AMOUNT_MISMATCH`（400，支付金额不一致）

## 5. Configuration

- [x] 5.1 在 `EasyMallApplication.java` 的 `@MapperScan` 中新增 `"org.ruikun.modules.payment.mapper"`
- [x] 5.2 在 `application.yml` 的 `type-aliases-package` 中新增 `org.ruikun.modules.payment.entity`
- [x] 5.3 在 `application-dev.yml` 中新增 `payment.mock.signature` 配置项（默认值 `easymall-mock-signature-2024`），在 `application-prod.yml` 中使用 `${PAYMENT_MOCK_SIGNATURE}` 无默认值
- [x] 5.4 在 `SecurityConfig.java` 中将 `POST /api/payment/callback` 加入 permitAll

## 6. Tests

- [x] 6.1 测试订单创建后自动生成支付单
- [x] 6.2 测试正常模拟支付流程（发起支付 → 支付单 PAID → 订单 PAID → 库存确认）
- [x] 6.3 测试重复支付回调幂等（第二次回调直接返回成功，不重复确认库存）
- [x] 6.4 测试金额不一致回调被拒绝（日志在独立事务中已持久化，result 为 AMOUNT_MISMATCH）
- [x] 6.5 测试不存在的支付单号回调被拒绝（日志在独立事务中已持久化，result 为 PAYMENT_NOT_FOUND）
- [x] 6.6 测试取消订单时支付单关闭
- [x] 6.7 测试已支付支付单不能再次发起支付
- [x] 6.8 测试查询订单支付信息接口
- [x] 6.9 测试 `PUT /api/order/{orderId}/pay` 返回支付单信息而非直接支付
- [x] 6.10 测试 `POST /api/payment/callback` 缺少签名返回 403
- [x] 6.11 测试 `POST /api/payment/callback` 携带正确签名正常处理
