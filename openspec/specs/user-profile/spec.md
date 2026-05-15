# user-profile Specification

## Purpose
TBD - created by archiving change add-user-frontend. Update Purpose after archive.
## Requirements
### Requirement: 个人信息页
系统 SHALL 提供个人信息页面，展示并允许编辑用户基本信息。

#### Scenario: 查看个人信息
- **WHEN** 用户访问个人中心页面
- **THEN** 页面显示用户昵称、头像、手机号（脱敏显示）、邮箱、注册时间

#### Scenario: 编辑个人信息
- **WHEN** 用户修改昵称、邮箱等字段并点击"保存"
- **THEN** 系统调用更新接口，成功后显示"保存成功"提示并刷新页面数据

### Requirement: 修改密码
系统 SHALL 允许用户修改登录密码。

#### Scenario: 成功修改密码
- **WHEN** 用户输入旧密码、新密码和确认密码，点击"确认修改"
- **THEN** 系统调用修改密码接口，成功后提示"密码修改成功，请重新登录"，跳转到登录页

#### Scenario: 旧密码错误
- **WHEN** 用户输入的旧密码不正确
- **THEN** 系统显示错误提示"旧密码错误"

