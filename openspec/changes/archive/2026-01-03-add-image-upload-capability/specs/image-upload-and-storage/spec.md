# Spec: 图片上传与存储功能

## ADDED Requirements

### Requirement: 系统必须支持用户上传单张图片

系统 SHALL 提供通用单图上传接口,支持用户和管理员上传图片文件。

#### Scenario: 上传商品主图

**Given** 用户已登录并有商品管理权限
**When** 用户通过 `POST /api/upload/image` 上传商品图片文件
  | 参数 | 值 |
  |------|-----|
  | file | product.jpg (2MB) |
  | type | product |
**Then** 系统返回 HTTP 200 状态码
**And** 响应包含图片访问 URL
**And** 图片被保存到 `/data/easymall/uploads/products/{year}/{month}/` 目录
**And** 文件名为 UUID 格式

#### Scenario: 上传用户头像

**Given** 用户已登录
**When** 用户通过 `POST /api/upload/image` 上传头像文件
  | 参数 | 值 |
  |------|-----|
  | file | avatar.png (500KB) |
  | type | avatar |
**Then** 系统返回 HTTP 200 状态码
**And** 响应包含头像访问 URL
**And** 图片被保存到 `/data/easymall/uploads/avatars/{year}/{month}/` 目录

#### Scenario: 上传空文件

**Given** 用户已登录
**When** 用户通过上传接口提交空文件
**Then** 系统返回 HTTP 400 状态码
**And** 错误码为 `FILE_EMPTY`

#### Scenario: 上传超大文件

**Given** 用户已登录
**When** 用户上传大小超过 5MB 的图片文件
**Then** 系统返回 HTTP 400 状态码
**And** 错误码为 `FILE_TOO_LARGE`
**And** 错误消息提示"文件大小不能超过 5MB"

#### Scenario: 上传非法文件类型

**Given** 用户已登录
**When** 用户上传非图片文件(如 .exe, .pdf)
**Then** 系统返回 HTTP 400 状态码
**And** 错误码为 `INVALID_FILE_TYPE`
**And** 错误消息提示"仅支持 jpg、png、gif 格式"

---

### Requirement: 系统必须支持批量上传图片

系统 SHALL 提供多图上传接口,允许一次性上传多张商品图片。

#### Scenario: 批量上传商品详情图

**Given** 管理员已登录
**When** 管理员通过 `POST /api/upload/images` 上传 3 张商品图片
  | 参数 | 值 |
  |------|-----|
  | files | [img1.jpg, img2.png, img3.jpg] |
  | type | product |
**Then** 系统返回 HTTP 200 状态码
**And** 响应包含 3 个图片 URL 的数组
**And** 所有图片成功保存到服务器

#### Scenario: 批量上传包含非法文件

**Given** 管理员已登录
**When** 管理员上传包含非法文件的图片数组
**Then** 系统返回 HTTP 400 状态码
**And** 所有文件均不被保存
**And** 返回详细的错误信息

---

### Requirement: 系统必须支持删除已上传的图片

系统 SHALL 提供图片删除接口,允许删除不需要的图片文件。

#### Scenario: 删除已上传的图片

**Given** 图片已存在 `products/2024/01/uuid.jpg`
**When** 用户通过 `DELETE /api/upload/image?path=products/2024/01/uuid.jpg` 删除图片
**Then** 系统返回 HTTP 200 状态码
**And** 文件从服务器磁盘中被删除

#### Scenario: 删除不存在的图片

**Given** 图片路径 `products/2024/01/not-exist.jpg` 不存在
**When** 用户尝试删除该图片
**Then** 系统返回 HTTP 404 状态码
**And** 错误码为 `FILE_NOT_FOUND`

---

### Requirement: 系统必须提供图片访问与静态文件服务

系统 MUST 提供通过 HTTP URL 直接访问已上传图片的功能。

#### Scenario: 通过 URL 访问商品图片

**Given** 商品图片已上传并保存为 `products/2024/01/uuid.jpg`
**When** 用户通过浏览器访问 `http://8.134.192.13/uploads/products/2024/01/uuid.jpg`
**Then** 系统返回图片文件
**And** HTTP 状态码为 200
**And** Content-Type 为 `image/jpeg`

#### Scenario: 图片缓存优化

**Given** 图片 URL 被访问
**When** 浏览器再次请求相同 URL
**Then** 服务器返回 304 Not Modified 或使用缓存
**And** 响应头包含 `Cache-Control: public, immutable`
**And** 响应头包含 `Expires: 未来 30 天`

#### Scenario: 访问非图片文件被拒绝

**Given** 存储目录中包含非图片文件
**When** 用户尝试访问该文件 URL
**Then** 系统返回 HTTP 403 状态码

---

### Requirement: 系统必须执行文件上传安全验证

系统 MUST 对上传文件进行多层安全验证,防止恶意文件上传。

#### Scenario: 验证文件内容真实性

**Given** 用户上传伪装成图片的可执行文件
**When** 系统验证文件内容
**Then** 系统检测到文件魔数与扩展名不匹配
**And** 拒绝上传并返回 `INVALID_FILE_CONTENT` 错误

#### Scenario: 文件名安全处理

**Given** 用户上传文件名为 `../../../malicious.jpg`
**When** 系统处理文件名
**Then** 文件名被转换为安全的 UUID 格式
**And** 不会发生路径遍历攻击

#### Scenario: 上传接口需要认证

**Given** 用户未登录(无 JWT Token)
**When** 用户尝试访问上传接口
**Then** 系统返回 HTTP 401 状态码
**And** 错误码为 `UNAUTHORIZED`

---

### Requirement: 图片上传功能必须与业务功能集成

图片上传功能 SHALL 与商品管理和用户管理功能集成。

#### Scenario: 创建商品时使用上传的图片

**Given** 管理员已上传商品主图并获得 URL
**When** 管理员通过商品管理接口创建商品,使用该图片 URL
**Then** 商品创建成功
**And** 商品的 `image` 字段存储该 URL
**And** 前端可以正常显示商品图片

#### Scenario: 更新用户头像

**Given** 用户已上传头像并获得 URL
**When** 用户通过用户中心接口更新头像,使用该 URL
**Then** 用户信息更新成功
**And** 用户的 `avatar` 字段存储该 URL
**And** 个人中心显示新头像

---

## 相关能力引用

- **依赖**: `authentication-and-authorization` - 上传接口需要用户认证
- **影响**: `admin-product-management` - 商品管理需要图片上传
- **影响**: `user-profile-management` - 用户中心需要头像上传
