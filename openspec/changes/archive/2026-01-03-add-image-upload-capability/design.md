# 设计文档:图片上传与存储功能

## 架构设计

### 系统组件

```
┌─────────┐         ┌──────────────┐         ┌─────────────────┐
│ 前端应用 │────────>│ Spring Boot  │────────>│ 服务器文件系统  │
│ (Vue)   │<--------│  上传服务    │<--------│ /data/uploads/  │
└─────────┘         └──────────────┘         └─────────────────┘
                            │
                            ↓
                      ┌──────────┐
                      │  Nginx   │
                      │ 静态服务 │
                      └──────────┘
```

### 存储策略

#### 目录组织

```
/data/easymall/uploads/
├── products/                    # 商品图片
│   ├── 2024/01/                # 按年月分目录
│   │   ├── a1b2c3d4-...jpg     # 主图
│   │   └── e5f6g7h8-...jpg     # 详情图
│   └── 2024/02/
└── avatars/                    # 用户头像
    └── 2024/01/
        └── uuid.jpg
```

**设计理由**:
- **按类型分离**:商品图片和用户头像分开存储,便于管理
- **按时间分目录**:避免单目录文件过多,便于归档和清理
- **UUID 文件名**:避免文件名冲突和安全问题

#### 文件命名规则

```
{UUID}.{原始扩展名}
```

示例: `a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d.jpg`

#### URL 访问路径

```
http://8.134.192.13/uploads/{type}/{year}/{month}/{filename}
```

示例:
- 商品图片: `http://8.134.192.13/uploads/products/2024/01/a1b2c3d4.jpg`
- 用户头像: `http://8.134.192.13/uploads/avatars/2024/01/e5f6g7h8.jpg`

#### 数据库存储策略

**存储内容**:完整 HTTP URL(非相对路径)

| 存储位置 | 存储内容 | 示例 |
|---------|---------|------|
| 磁盘文件 | 图片二进制数据 | `/data/easymall/uploads/products/2024/01/uuid.jpg` |
| MySQL 数据库 | URL 文本字符串 | `http://8.134.192.13/uploads/products/2024/01/uuid.jpg` |

**为什么要存完整 URL**:
- 前端直接使用,无需拼接
- API 返回后前端可直接在 `<img>` 标签使用
- 数据库查询后无需额外处理即可返回

## 接口设计

### 1. 通用图片上传接口

**接口**: `POST /api/upload/image`

**请求**:
- Content-Type: `multipart/form-data`
- 参数:
  - `file`: 图片文件(必填)
  - `type`: 图片类型 `product` | `avatar`(必填)

**响应**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "上传成功",
  "timestamp": "2024-01-15T10:30:00",
  "traceId": "abc123",
  "data": {
    "url": "http://8.134.192.13/uploads/products/2024/01/uuid.jpg",
    "filename": "uuid.jpg",
    "size": 102400,
    "relativePath": "products/2024/01/uuid.jpg"
  }
}
```

### 2. 多图上传接口

**接口**: `POST /api/upload/images`

**请求**:
- Content-Type: `multipart/form-data`
- 参数:
  - `files`: 多个图片文件(必填)
  - `type`: 图片类型 `product`(必填)

**响应**:
```json
{
  "success": true,
  "data": {
    "urls": [
      "http://8.134.192.13/uploads/products/2024/01/uuid1.jpg",
      "http://8.134.192.13/uploads/products/2024/01/uuid2.jpg"
    ],
    "count": 2
  }
}
```

### 3. 删除图片接口

**接口**: `DELETE /api/upload/image`

**请求参数**:
- `path`: 相对路径(如 `products/2024/01/uuid.jpg`)

**响应**:
```json
{
  "success": true,
  "message": "删除成功"
}
```

## 技术实现细节

### 配置设计

#### application.yml 配置项

```yaml
# 文件上传配置
file:
  upload:
    # 基础存储路径(服务器绝对路径)
    base-path: /data/easymall/uploads
    # 访问基础 URL (服务器 IP)
    base-url: http://8.134.192.13/uploads
    # 单个文件最大大小(字节)
    max-size: 5242880  # 5MB
    # 允许的文件类型
    allowed-types:
      - image/jpeg
      - image/jpg
      - image/png
      - image/gif
```

**重要说明**:
- `base-path`: 图片文件实际存储在服务器磁盘的路径
- `base-url`: 返回给前端的完整 HTTP URL 前缀(会被存入数据库)
- 最终存入数据库的 URL: `{base-url}/{type}/{year}/{month}/{filename}`

### 核心类设计

#### 1. FileUploadController

```java
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @PostMapping("/image")
    public Result<ImageUploadVO> uploadImage(
        @RequestParam("file") MultipartFile file,
        @RequestParam("type") String type
    ) { ... }

    @PostMapping("/images")
    public Result<MultiImageUploadVO> uploadImages(
        @RequestParam("files") MultipartFile[] files,
        @RequestParam("type") String type
    ) { ... }

    @DeleteMapping("/image")
    public Result<Void> deleteImage(@RequestParam("path") String path) { ... }
}
```

#### 2. FileStorageService

```java
public interface FileStorageService {
    // 保存单个文件
    String saveFile(MultipartFile file, ImageType type);

    // 保存多个文件
    List<String> saveFiles(MultipartFile[] files, ImageType type);

    // 删除文件
    void deleteFile(String relativePath);

    // 获取完整 URL
    String getUrl(String relativePath);

    // 验证文件
    void validateFile(MultipartFile file);
}
```

#### 3. ImageType 枚举

```java
public enum ImageType {
    PRODUCT("products", "商品图片"),
    AVATAR("avatars", "用户头像");

    private final String directory;
    private final String description;
}
```

### 文件验证规则

| 验证项 | 规则 | 错误码 |
|--------|------|--------|
| 文件非空 | file != null | FILE_EMPTY |
| 文件大小 | ≤ 5MB | FILE_TOO_LARGE |
| 文件类型 | jpg/png/gif | INVALID_FILE_TYPE |
| 文件内容 | 真实图片(非伪装) | INVALID_FILE_CONTENT |

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name 8.134.192.13;

    # 静态文件访问
    location /uploads/ {
        alias /data/easymall/uploads/;
        expires 30d;  # 缓存 30 天
        add_header Cache-Control "public, immutable";

        # 安全限制
        location ~ \.(jpg|jpeg|png|gif)$ {
            # 只允许图片文件
        }
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080;
        # ... 其他代理配置
    }
}
```

**URL 映射说明**:
- 浏览器请求: `http://8.134.192.13/uploads/products/2024/01/uuid.jpg`
- Nginx 映射到: `/data/easymall/uploads/products/2024/01/uuid.jpg` (磁盘文件)
- Nginx 返回图片文件给浏览器

## Docker 部署配置

### 存储目录架构设计

**关键原则**:图片文件存储在**云服务器磁盘**,而非容器内,确保数据持久化。

```
┌─────────────────────────────────────────────────────────────┐
│                    云服务器 (8.134.192.13)                   │
│                                                              │
│  /root/EasyMall/uploads/                                    │
│  └── products/2024/01/                                      │
│      └── abc123.jpg  ← 图片文件实际存在这里(持久化)           │
│            ↑                                                │
│            │ (Docker Volume 挂载)                           │
│            ↓                                                │
│  ┌──────────────────┐                                       │
│  │  Docker 容器     │                                       │
│  │  /data/easymall/uploads/  ← 容器内访问路径                │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### 为什么不在容器内创建目录?

❌ **容器内存储的问题**:
- 容器删除/重建 → 图片丢失
- 镜像重新构建 → 图片丢失
- 无法持久化保存数据

✅ **服务器存储 + Volume 挂载的优势**:
- 数据持久化,容器删除不影响
- 便于备份和迁移
- 容器升级不丢失数据
- 可直接在服务器查看和管理文件

### 部署步骤

#### 1. 在云服务器创建目录

```bash
# SSH 连接到云服务器
ssh root@8.134.192.13

# 进入项目目录
cd /root/EasyMall  # (或您的实际项目路径)

# 创建上传目录结构
mkdir -p uploads/products
mkdir -p uploads/avatars

# 设置目录权限
chmod 755 uploads
```

#### 2. 修改 docker-compose.yml

```yaml
services:
  easymall-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: easymall-app
    ports:
      - "${APP_PORT:-8080}:8080"
    volumes:
      # 现有挂载...
      - ./src:/app/src
      - ./pom.xml:/app/pom.xml
      - ${HOME}/.m2:/root/.m2
      # 🆕 新增:挂载上传文件目录
      # 格式: 服务器路径:容器内路径
      - ./uploads:/data/easymall/uploads
    environment:
      # 现有环境变量...
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/easymall?...
      - SPRING_DATA_REDIS_HOST=redis
      # 🆕 新增:文件上传配置
      - FILE_UPLOAD_BASE_PATH=/data/easymall/uploads
      - FILE_UPLOAD_BASE_URL=http://8.134.192.13/uploads
```

**配置说明**:
- `./uploads:/data/easymall/uploads`: 左边是服务器相对路径,右边是容器内绝对路径
- `FILE_UPLOAD_BASE_PATH`: 容器内路径(应用写文件使用)
- `FILE_UPLOAD_BASE_URL`: HTTP URL 前缀(存入数据库)

#### 3. 修改 application.yml

```yaml
# 文件上传配置
file:
  upload:
    # 容器内路径(应用写文件使用)
    base-path: /data/easymall/uploads
    # HTTP URL 前缀(存入数据库)
    base-url: http://8.134.192.13/uploads
    max-size: 5242880  # 5MB
    allowed-types:
      - image/jpeg
      - image/jpg
      - image/png
      - image/gif
```

#### 4. 重启容器

```bash
# 在云服务器上执行
cd /root/EasyMall
docker-compose down
docker-compose up -d

# 验证挂载是否成功
docker exec easymall-app ls -la /data/easymall/uploads/
```

### 目录路径映射关系

| 位置 | 路径 | 用途 |
|------|------|------|
| **云服务器** | `/root/EasyMall/uploads/` | 图片文件实际存储位置 |
| **容器内** | `/data/easymall/uploads/` | 应用读写文件的路径 |
| **配置 base-path** | `/data/easymall/uploads` | Spring Boot 配置(容器路径) |
| **配置 base-url** | `http://8.134.192.13/uploads` | 存入数据库的 URL 前缀 |
| **Nginx alias** | `/root/EasyMall/uploads/` | Nginx 静态文件路径(服务器路径) |

### 数据流完整示例

1. **上传图片**:
   ```
   前端上传 → Spring Boot 容器 → 写入 /data/easymall/uploads/products/2024/01/uuid.jpg
                                                         ↓ (Docker Volume)
                                    实际保存到 /root/EasyMall/uploads/...
   ```

2. **生成 URL**:
   ```
   应用生成: http://8.134.192.13/uploads/products/2024/01/uuid.jpg
   存入数据库 product.image 字段
   ```

3. **前端访问**:
   ```
   浏览器请求: http://8.134.192.13/uploads/products/2024/01/uuid.jpg
       ↓
   Nginx 接收 → 映射到 /root/EasyMall/uploads/...
       ↓
   返回图片文件给浏览器
   ```

### Nginx 配置(重要!)

Nginx 需要**指向服务器实际路径**,而非容器路径:

```nginx
server {
    listen 80;
    server_name 8.134.192.13;

    # 静态文件访问 - 指向服务器实际路径
    location /uploads/ {
        alias /root/EasyMall/uploads/;  # ← 服务器路径,不是容器路径!
        expires 30d;
        add_header Cache-Control "public, immutable";

        # 安全限制
        location ~ \.(jpg|jpeg|png|gif)$ {
            # 只允许图片文件
        }
    }

    # API 代理到容器内应用
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 备份与迁移

**备份上传的图片**:
```bash
# 在云服务器上执行
cd /root/EasyMall
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

**迁移到其他服务器**:
```bash
# 打包
tar -czf uploads.tar.gz uploads/

# 复制到新服务器
scp uploads.tar.gz root@new-server:/root/EasyMall/

# 在新服务器解压
cd /root/EasyMall
tar -xzf uploads.tar.gz
```

## 安全考虑

### 文件上传安全

1. **文件类型验证**:
   - 检查 Content-Type
   - 检查文件扩展名
   - 检查文件魔数(真实内容)

2. **文件名安全**:
   - 使用 UUID 避免路径遍历攻击
   - 过滤特殊字符

3. **访问控制**:
   - 上传接口需要认证(JWT)
   - 删除接口需要权限验证

### 存储安全

1. **目录权限**:
   - 上传目录设置为只可执行写入
   - 禁止执行权限

2. **URL 安全**:
   - Nginx 配置禁止访问非图片文件
   - 防止目录遍历

## 性能优化

### 缓存策略

- **Nginx 缓存**:静态文件缓存 30 天
- **浏览器缓存**:添加 `Cache-Control` 头

### 存储优化(可选)

- 压缩大图片(> 2MB 自动压缩)
- 生成缩略图
- 定期清理未使用的图片

## 监控与日志

### 日志记录

- 上传成功:记录文件名、大小、类型、上传用户
- 上传失败:记录失败原因、文件信息
- 删除操作:记录删除的文件路径、操作用户

### 监控指标

- 上传成功率
- 平均上传文件大小
- 存储空间使用量

## 扩展性设计

### 未来可扩展功能

1. **图片压缩**:上传时自动压缩
2. **水印**:为商品图片添加水印
3. **CDN**:接入 CDN 加速访问
4. **云存储迁移**:无缝切换到 OSS

### 迁移路径

如果未来需要迁移到 OSS:
1. 修改 `FileStorageService` 实现
2. 保持接口不变
3. 批量迁移现有文件
4. 更新数据库中的 URL

## 错误处理

### 异常定义

```java
public enum FileUploadErrorCode {
    FILE_EMPTY("文件为空"),
    FILE_TOO_LARGE("文件大小超过限制"),
    INVALID_FILE_TYPE("不支持的文件类型"),
    INVALID_FILE_CONTENT("文件内容不合法"),
    STORAGE_ERROR("文件存储失败"),
    FILE_NOT_FOUND("文件不存在"),
    DELETE_FAILED("文件删除失败");
}
```

### 回滚机制

- 保存失败时删除已上传的文件
- 数据库保存失败时删除已上传的文件
