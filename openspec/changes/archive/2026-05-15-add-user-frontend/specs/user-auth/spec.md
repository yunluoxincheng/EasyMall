## ADDED Requirements

### Requirement: 用户注册
系统 SHALL 提供用户注册页面，允许新用户通过用户名、昵称、密码、确认密码进行注册。手机号和邮箱为可选字段。

#### Scenario: 成功注册
- **WHEN** 用户填写有效用户名、昵称、密码和确认密码，点击注册
- **THEN** 系统调用注册接口（username、nickname、password、confirmPassword 必填；phone、email 可选），成功后自动跳转到登录页

#### Scenario: 注册失败——用户名已存在
- **WHEN** 用户填写已被占用的用户名
- **THEN** 系统显示错误提示"用户名已存在"

#### Scenario: 注册表单校验——昵称为空
- **WHEN** 用户未填写昵称就点击注册
- **THEN** 表单校验拦截提交，显示"昵称不能为空"

### Requirement: 用户登录
系统 SHALL 提供用户登录页面，允许已注册用户通过用户名和密码登录。

#### Scenario: 成功登录
- **WHEN** 用户输入正确的用户名和密码，点击登录
- **THEN** 系统保存 token，跳转到用户端首页

#### Scenario: 登录失败提示
- **WHEN** 用户输入错误的用户名或密码
- **THEN** 系统显示错误提示

### Requirement: 用户登出
系统 SHALL 允许已登录用户退出登录。

#### Scenario: 点击退出登录
- **WHEN** 已登录用户点击导航栏"退出登录"
- **THEN** 系统清除 token 和用户信息，跳转到用户端首页

### Requirement: 用户端路由守卫
系统 SHALL 对需要登录的用户端页面进行路由守卫。

#### Scenario: 未登录访问受保护页面
- **WHEN** 未登录用户访问 /orders 或 /user 等受保护路由
- **THEN** 系统跳转到用户端登录页，登录成功后返回原页面

#### Scenario: 已登录访问登录页
- **WHEN** 已登录用户访问 /login
- **THEN** 系统重定向到用户端首页
