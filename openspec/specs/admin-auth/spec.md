# admin-auth Specification

## Purpose
TBD - created by archiving change add-admin-frontend. Update Purpose after archive.
## Requirements
### Requirement: 管理员登录页面
系统 SHALL 提供管理员登录页面，包含用户名和密码输入框及登录按钮。登录成功后系统 SHALL 校验用户角色是否为管理员（role === 1），仅管理员可以进入后台。

#### Scenario: 管理员登录成功
- **WHEN** 管理员输入正确的用户名和密码并点击登录按钮
- **THEN** 系统调用后端登录接口 `/api/user/login`，返回数据中 `role === 1`，系统将 Token 和 role 存入 localStorage 和 Pinia store，并跳转至后台首页

#### Scenario: 普通用户登录被拒绝
- **WHEN** 普通用户（role !== 1）输入正确的用户名和密码并点击登录按钮
- **THEN** 系统调用后端登录接口成功，但检测到 `role !== 1`，系统不存储 Token，显示"非管理员账号"错误提示，登录页面保持不变

#### Scenario: 管理员登录失败
- **WHEN** 管理员输入错误的用户名或密码并点击登录按钮
- **THEN** 系统显示错误提示信息（如"用户名或密码错误"），登录页面保持不变

#### Scenario: 登录表单验证
- **WHEN** 管理员未填写用户名或密码就点击登录按钮
- **THEN** 系统显示必填字段校验提示

### Requirement: Token 管理
系统 SHALL 通过 Axios 请求拦截器自动在所有 API 请求的 Header 中附加 `Authorization: Bearer <token>`。系统 SHALL 通过 Axios 响应拦截器在收到 401 状态时清除 Token 并跳转至登录页。

#### Scenario: 请求自动附加 Token
- **WHEN** 前端发送任意 API 请求
- **THEN** 请求 Header 中自动包含 `Authorization: Bearer <stored_token>`

#### Scenario: Token 过期自动跳转登录
- **WHEN** 后端返回 401 未授权响应
- **THEN** 系统清除 localStorage 中的 Token，跳转至登录页，并显示"登录已过期"提示

### Requirement: 路由守卫
系统 SHALL 在每次路由跳转前检查用户是否已登录（Token 是否存在）且角色为管理员。未登录或非管理员访问管理页面时 SHALL 被重定向至登录页。

#### Scenario: 已登录管理员访问管理页面
- **WHEN** 已登录管理员（Token 存在且 role === 1）访问任意管理页面路由
- **THEN** 正常显示对应页面

#### Scenario: 未登录用户访问管理页面
- **WHEN** 用户未登录（Token 不存在）并访问任意管理页面路由
- **THEN** 系统重定向至登录页

### Requirement: 管理员登出
系统 SHALL 提供登出功能，清除 Token 和角色信息并跳转至登录页。

#### Scenario: 管理员主动登出
- **WHEN** 管理员点击顶栏的登出按钮
- **THEN** 系统清除 localStorage 中的 Token 和角色信息，跳转至登录页

