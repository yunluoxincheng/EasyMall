# readme-documentation Specification Delta

## MODIFIED Requirements

### Requirement: 待完善功能列表准确性

README 中的"待完善功能"部分 SHALL 移除已实现的图片上传功能，并准确反映当前的开发状态。

#### Scenario: 用户查看待开发功能
- **WHEN** 用户打开 README.md 文件并查看"待完善功能"部分
- **THEN** 不应包含"商品图片上传（MinIO）"（已使用本地存储实现）
- **AND** 可以保留其他未实现功能（如支付接口集成、会员生日礼包自动发放等）

---

## ADDED Requirements

### Requirement: 图片上传功能文档说明

README SHALL 包含图片上传功能的说明，包括技术实现方式和功能特性。

#### Scenario: 查看技术栈中的文件存储说明
- **WHEN** 用户查看"技术栈"部分
- **THEN** 应该看到"本地文件存储"或类似说明
- **AND** 应该说明支持商品图片和用户头像上传
- **AND** 可以提到文件验证、大小限制等安全机制

#### Scenario: 查看商品模块中的图片上传功能
- **WHEN** 用户查看"商品与分类模块"部分
- **THEN** 应该包含商品图片上传功能说明
- **AND** 应该说明支持单图/多图上传
- **AND** 应该说明支持文件类型验证和大小限制

#### Scenario: 查看用户模块中的头像上传功能
- **WHEN** 用户查看"用户与会员模块"部分
- **THEN** 应该包含用户头像上传功能说明
- **AND** 应该说明支持个人头像更换

---

### Requirement: 图片上传文档引用

README SHALL 提供图片上传功能详细文档的引用链接。

#### Scenario: 查找图片上传使用指南
- **WHEN** 用户在 README 中查找图片上传相关文档
- **THEN** 应该看到指向 `docs/image-upload-guide.md` 的链接
- **AND** 链接描述应该清晰（如"图片上传使用指南"或类似文字）

---

### Requirement: 部署配置中包含图片存储说明

README 中的部署说明 SHALL 包含图片存储目录的配置要求。

#### Scenario: 查看本地部署的图片存储配置
- **WHEN** 用户查看"本地部署"部分
- **THEN** 应该说明需要创建图片存储目录
- **AND** 应该提供目录权限设置建议

#### Scenario: 查看 Docker 部署的 volume 挂载
- **WHEN** 用户查看"Docker 部署"部分
- **THEN** 应该说明 uploads 目录的 volume 挂载配置
- **AND** 应该说明挂载路径（如 `./uploads:/data/easymall/uploads`）

#### Scenario: 查看云服务器部署的 Nginx 配置
- **WHEN** 用户查看云服务器部署文档
- **THEN** 应该说明 Nginx 静态文件服务配置
- **AND** 应该提供 `/uploads/` 路径的 location 配置示例
