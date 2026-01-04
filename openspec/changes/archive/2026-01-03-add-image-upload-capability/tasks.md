# 任务分解:图片上传与存储功能

## 阶段 1:基础设施与配置

### 1.1 创建存储目录结构
- [x] 在项目根目录创建 `uploads/` 目录
- [x] 创建子目录 `uploads/products/` 和 `uploads/avatars/`
- [x] 在 `docker-compose.yml` 中配置目录挂载
- [x] 更新 `.gitignore` 忽略 `uploads/` 目录

**验证**:运行 `docker-compose up` 后,容器内可以访问 `/data/easymall/uploads` 目录

---

## 阶段 2:配置与常量定义

### 2.1 添加配置属性
- [x] 在 `application.yml` 中添加 `file.upload` 配置项
- [x] 创建 `FileUploadProperties` 配置类
- [x] 定义 `ImageType` 枚举(PRODUCT, AVATAR)

**验证**:配置类可以正确读取配置值

### 2.2 定义响应对象
- [x] 创建 `ImageUploadVO`(url, filename, size, relativePath)
- [x] 创建 `MultiImageUploadVO`(urls, count)

**验证**:VO 类可以通过 Jackson 正确序列化

---

## 阶段 3:核心服务实现

### 3.1 实现 FileStorageService 接口
- [x] 创建 `FileStorageService` 接口
- [x] 实现 `saveFile(MultipartFile, ImageType)` 方法
- [x] 实现 `saveFiles(MultipartFile[], ImageType)` 方法
- [x] 实现 `deleteFile(String)` 方法
- [x] 实现 `getUrl(String)` 方法

**验证**:单元测试覆盖文件保存、删除逻辑

### 3.2 实现文件验证逻辑
- [x] 实现 `validateFile(MultipartFile)` 方法
- [x] 添加文件大小验证(≤ 5MB)
- [x] 添加文件类型验证(jpg/png/gif)
- [x] 添加文件内容验证(检查魔数)
- [x] 定义文件上传相关错误码

**验证**:非法文件能被正确拦截并抛出异常

### 3.3 实现文件命名与路径管理
- [x] 实现基于 UUID 的文件命名
- [x] 实现按年月的目录结构生成
- [x] 实现相对路径到 URL 的转换

**验证**:生成的文件名唯一且路径格式正确

---

## 阶段 4:控制器实现

### 4.1 创建 FileUploadController
- [x] 创建 `FileUploadController` 类
- [x] 实现 `POST /api/upload/image` 接口(单图上传)
- [x] 实现 `POST /api/upload/images` 接口(多图上传)
- [x] 实现 `DELETE /api/upload/image` 接口(删除图片)
- [x] 添加 `@PreAuthorize` 注解进行权限控制
- [x] 启用 `@EnableMethodSecurity` 支持

**验证**:
- 使用 Postman/curl 测试上传接口
- 检查返回的 URL 格式正确
- 验证文件实际保存到磁盘

### 4.2 添加异常处理
- [ ] 创建 `FileUploadExceptionHandler`
- [ ] 处理 `MaxUploadSizeExceededException`
- [ ] 处理 `FileUploadException`
- [ ] 处理 `IOException`

**验证**:异常时返回标准错误响应格式

---

## 阶段 5:业务集成

### 5.1 集成到商品管理
- [x] 检查 `ProductSaveDTO` 已支持图片 URL 字段
- [x] 验证商品管理可使用上传接口返回的 URL

**验证**:管理员可以上传商品图片并保存到数据库

### 5.2 集成到用户管理
- [x] 检查 `UserUpdateDTO` 已支持头像 URL 字段
- [x] 验证用户更新接口可使用上传接口返回的 URL

**验证**:用户可以上传头像并查看更新

---

## 阶段 6:Nginx 配置

### 6.1 配置静态文件访问
- [ ] 创建 Nginx 配置文件 `nginx.conf` 或修改现有配置
- [ ] 配置 `location /uploads/` 指向存储目录
- [ ] 添加缓存头配置(expires 30d)
- [ ] 配置安全限制(仅允许图片文件)

**验证**:
- 通过浏览器访问图片 URL 可以正常显示
- 直接访问非图片文件返回 403

### 6.2 更新部署文档
- [ ] 在部署文档中说明 Nginx 配置要求
- [ ] 说明存储目录权限设置
- [ ] 提供 Nginx 配置示例

**验证**:文档完整且可操作

---

## 阶段 7:测试

### 7.1 单元测试
- [ ] 测试 `FileStorageService.saveFile()`
- [ ] 测试 `FileStorageService.deleteFile()`
- [ ] 测试 `validateFile()` 各种情况
- [ ] 测试文件名和路径生成逻辑

**目标**:测试覆盖率 > 80%

### 7.2 集成测试
- [ ] 测试单图上传完整流程
- [ ] 测试多图上传完整流程
- [ ] 测试文件删除功能
- [ ] 测试异常情况(空文件、超大文件、非法类型)

**验证**:所有测试通过

### 7.3 端到端测试
- [ ] 在 Docker 环境中测试上传功能
- [ ] 验证 Nginx 静态文件访问
- [ ] 测试并发上传场景
- [ ] 测试大文件上传(接近 5MB)

**验证**:功能在真实环境中正常运行

---

## 阶段 8:文档

### 8.1 API 文档
- [x] 创建完整的图片上传功能使用指南
- [x] 添加请求/响应示例
- [x] 添加错误码说明
- [x] 提供前端集成示例(Vue 3 / React)

**验证**:API 文档完整准确

### 8.2 使用说明
- [x] 创建 `docs/image-upload-guide.md` 使用指南
- [x] 创建 `docs/deployment-guide.md` 部署指南
- [x] 说明如何使用上传功能
- [x] 提供前端调用示例(Vue/React)
- [x] 说明常见问题和解决方案

**验证**:文档清晰易懂

---

## 依赖关系

```
阶段 1 → 阶段 2 → 阶段 3 → 阶段 4 → 阶段 5
                                    ↓
                              阶段 6
                                    ↓
                              阶段 7
                                    ↓
                              阶段 8
```

## 并行工作

以下任务可以并行进行:
- 阶段 1 和阶段 2
- 阶段 3 中的服务实现和控制器设计
- 阶段 5 中的商品管理和用户管理集成
- 阶段 7 中的不同测试类型

## 优先级

**高优先级**:
- 1.1, 2.1, 3.1, 3.2, 4.1 (核心功能)

**中优先级**:
- 2.2, 3.3, 4.2, 5.1, 6.1 (完善功能)

**低优先级**:
- 5.2, 7.3, 8.1, 8.2 (增强体验)
