## 1. 项目结构准备
- [x] 1.1 在 `controller` 包下创建 `admin` 子包
- [x] 1.2 在 `dto` 包下创建 `admin` 子包（后台管理专用 DTO）
- [x] 1.3 在 `vo` 包下创建 `admin` 子包（后台管理专用 VO）

## 2. 商品管理模块
- [x] 2.1 创建 `AdminProductController.java`，定义商品管理接口
- [x] 2.2 创建 `ProductQueryDTO.java`（商品查询条件）
- [x] 2.3 创建 `ProductSaveDTO.java`（新增/修改商品）
- [x] 2.4 创建 `AdminProductVO.java`（后台商品详情）
- [x] 2.5 创建 `AdminProductPageVO.java`（后台商品列表项）
- [x] 2.6 实现 GET /api/admin/products - 分页查询商品列表
- [x] 2.7 实现 GET /api/admin/products/{id} - 查询商品详情
- [x] 2.8 实现 POST /api/admin/products - 新增商品
- [x] 2.9 实现 PUT /api/admin/products/{id} - 修改商品
- [x] 2.10 实现 PUT /api/admin/products/{id}/status - 修改商品状态
- [x] 2.11 实现 PUT /api/admin/products/{id}/stock - 修改商品库存
- [x] 2.12 实现 DELETE /api/admin/products/{id} - 删除商品

## 3. 订单管理模块
- [x] 3.1 创建 `AdminOrderController.java`，定义订单管理接口
- [x] 3.2 创建 `OrderQueryDTO.java`（订单查询条件）
- [x] 3.3 创建 `AdminOrderVO.java`（后台订单详情，含用户信息和商品明细）
- [x] 3.4 创建 `AdminOrderPageVO.java`（后台订单列表项）
- [x] 3.5 实现 GET /api/admin/orders - 分页查询订单列表
- [x] 3.6 实现 GET /api/admin/orders/{id} - 查询订单详情
- [x] 3.7 实现 PUT /api/admin/orders/{id}/status - 修改订单状态
- [x] 3.8 实现 PUT /api/admin/orders/{id}/cancel - 取消订单

## 4. 用户管理模块
- [x] 4.1 创建 `AdminController.java`（用户管理），定义用户管理接口
- [x] 4.2 创建 `UserQueryDTO.java`（用户查询条件）
- [x] 4.3 创建 `AdminUserVO.java`（后台用户详情）
- [x] 4.4 创建 `AdminUserPageVO.java`（后台用户列表项）
- [x] 4.5 实现 GET /api/admin/users - 分页查询用户列表
- [x] 4.6 实现 GET /api/admin/users/{id} - 查询用户详情
- [x] 4.7 实现 PUT /api/admin/users/{id}/status - 修改用户状态
- [x] 4.8 实现 PUT /api/admin/users/{id}/role - 修改用户角色
- [x] 4.9 实现 PUT /api/admin/users/{id}/points - 调整用户积分

## 5. 评论审核模块
- [x] 5.1 创建 `AdminCommentController.java`，定义评论审核接口
- [x] 5.2 创建 `CommentQueryDTO.java`（评论查询条件）
- [x] 5.3 创建 `AdminCommentVO.java`（后台评论详情，含用户和商品信息）
- [x] 5.4 创建 `AdminCommentPageVO.java`（后台评论列表项）
- [x] 5.5 创建 `CommentReplyDTO.java`（商家回复）
- [x] 5.6 实现 GET /api/admin/comments - 分页查询评论列表
- [x] 5.7 实现 GET /api/admin/comments/{id} - 查询评论详情
- [x] 5.8 实现 PUT /api/admin/comments/{id}/approve - 审核通过评论
- [x] 5.9 实现 PUT /api/admin/comments/{id}/reject - 审核拒绝评论
- [x] 5.10 实现 PUT /api/admin/comments/{id}/reply - 商家回复评论
- [x] 5.11 实现 DELETE /api/admin/comments/{id} - 删除评论

## 6. 会员等级管理模块
- [x] 6.1 创建 `AdminMemberLevelController.java`，定义会员等级管理接口
- [x] 6.2 创建 `MemberLevelSaveDTO.java`（新增/修改会员等级）
- [x] 6.3 创建 `AdminMemberLevelVO.java`（后台会员等级详情）
- [x] 6.4 实现 GET /api/admin/member-levels - 查询所有会员等级
- [x] 6.5 实现 GET /api/admin/member-levels/{id} - 查询会员等级详情
- [x] 6.6 实现 POST /api/admin/member-levels - 新增会员等级
- [x] 6.7 实现 PUT /api/admin/member-levels/{id} - 修改会员等级
- [x] 6.8 实现 PUT /api/admin/member-levels/{id}/status - 修改会员等级状态
- [x] 6.9 实现 DELETE /api/admin/member-levels/{id} - 删除会员等级

## 7. 积分兑换商品管理模块
- [x] 7.1 创建 `AdminPointsProductController.java`，定义积分兑换商品管理接口
- [x] 7.2 创建 `PointsProductQueryDTO.java`（积分兑换商品查询条件）
- [x] 7.3 创建 `PointsProductSaveDTO.java`（新增/修改积分兑换商品）
- [x] 7.4 创建 `AdminPointsProductVO.java`（后台积分兑换商品详情）
- [x] 7.5 创建 `AdminPointsProductPageVO.java`（后台积分兑换商品列表项）
- [x] 7.6 实现 GET /api/admin/points-products - 分页查询积分兑换商品列表
- [x] 7.7 实现 GET /api/admin/points-products/{id} - 查询积分兑换商品详情
- [x] 7.8 实现 POST /api/admin/points-products - 新增积分兑换商品
- [x] 7.9 实现 PUT /api/admin/points-products/{id} - 修改积分兑换商品
- [x] 7.10 实现 PUT /api/admin/points-products/{id}/status - 修改商品状态
- [x] 7.11 实现 PUT /api/admin/points-products/{id}/stock - 修改商品库存
- [x] 7.12 实现 DELETE /api/admin/points-products/{id} - 删除积分兑换商品

## 8. Service 层扩展（如需要）
- [x] 8.1 评估现有 Service 是否满足后台管理需求
- [x] 8.2 在 IPointsService 中添加 addPoints(Long userId, Integer points, String description) 便捷方法

## 9. 测试与验证
- [x] 9.1 使用测试工具（如 Postman、test-api.http）测试所有后台管理接口
- [x] 9.2 验证权限控制：确认普通用户无法访问 /api/admin/** 接口
- [x] 9.3 验证业务逻辑：确认分页、筛选、状态更新等功能正常
- [x] 9.4 验证参数校验：确认必填参数、格式校验等正常工作
- [x] 9.5 为所有 AdminController 添加 @PreAuthorize("hasRole('ADMIN')") 注解

## 10. 文档更新
- [x] 10.1 更新 API 文档（test-api.http 已包含 92 个接口）
- [x] 10.2 更新 CLAUDE.md 项目文档
