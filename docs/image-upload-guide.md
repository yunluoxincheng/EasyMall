# 图片上传功能使用指南

## 概述

EasyMall 图片上传功能支持商品图片和用户头像的上传、存储和管理。

## 功能特性

- ✅ 支持单图和多图上传
- ✅ 文件类型验证（仅支持 jpg/jpeg/png/gif）
- ✅ 文件大小限制（≤ 5MB）
- ✅ 文件内容验证（魔数检查）
- ✅ UUID 文件命名（避免冲突）
- ✅ 按年月自动组织目录
- ✅ 返回可直接访问的 HTTP URL
- ✅ Docker Volume 持久化存储

## API 接口

### 1. 单图上传

**接口地址**: `POST /api/upload/image`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件 |
| type | String | 是 | 图片类型：`product`（商品）或 `avatar`（头像） |

**请求示例**:

```bash
curl -X POST http://8.134.192.13:8080/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@product.jpg" \
  -F "type=product"
```

**响应示例**:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "上传成功",
  "timestamp": "2024-01-15T10:30:00",
  "traceId": "abc123",
  "data": {
    "url": "http://8.134.192.13/uploads/products/2024/01/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.jpg",
    "filename": "product.jpg",
    "size": 102400,
    "relativePath": "products/2024/01/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.jpg"
  }
}
```

### 2. 多图上传

**接口地址**: `POST /api/upload/images`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | File[] | 是 | 多个图片文件 |
| type | String | 是 | 图片类型：`product`（仅商品支持多图） |

**请求示例**:

```bash
curl -X POST http://8.134.192.13:8080/api/upload/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "type=product"
```

**响应示例**:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "成功上传 2 张图片",
  "timestamp": "2024-01-15T10:30:00",
  "data": {
    "urls": [
      "http://8.134.192.13/uploads/products/2024/01/uuid1.jpg",
      "http://8.134.192.13/uploads/products/2024/01/uuid2.png"
    ],
    "count": 2
  }
}
```

### 3. 删除图片

**接口地址**: `DELETE /api/upload/image?path={relativePath}`

**权限要求**: 管理员（ADMIN）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| path | String | 是 | 图片相对路径，如 `products/2024/01/uuid.jpg` |

**请求示例**:

```bash
curl -X DELETE "http://8.134.192.13:8080/api/upload/image?path=products/2024/01/uuid.jpg" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**响应示例**:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "删除成功"
}
```

## 错误码说明

| 错误码 | HTTP状态 | 说明 |
|--------|----------|------|
| FILE_EMPTY | 400 | 文件为空 |
| FILE_TOO_LARGE | 400 | 文件大小超过 5MB 限制 |
| INVALID_FILE_TYPE | 400 | 不支持的文件类型（仅支持 jpg/jpeg/png/gif） |
| INVALID_FILE_CONTENT | 400 | 文件内容不合法（不是真实的图片文件） |
| FILE_UPLOAD_FAILED | 500 | 文件上传失败 |
| FILE_NOT_FOUND | 404 | 文件不存在 |
| FILE_DELETE_FAILED | 500 | 文件删除失败 |

## 前端集成示例

### Vue 3 示例

#### 单图上传组件

```vue
<template>
  <div>
    <input
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/gif"
      @change="handleFileChange"
      ref="fileInput"
    />
    <button @click="uploadImage">上传图片</button>
    <div v-if="uploadedUrl">
      <img :src="uploadedUrl" alt="上传的图片" />
      <p>URL: {{ uploadedUrl }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const fileInput = ref(null);
const uploadedUrl = ref(null);
const selectedFile = ref(null);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  // 验证文件大小
  if (file.size > 5 * 1024 * 1024) {
    alert('文件大小不能超过 5MB');
    return;
  }
  selectedFile.value = file;
};

const uploadImage = async () => {
  if (!selectedFile.value) {
    alert('请先选择文件');
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('type', 'product'); // 或 'avatar'

  try {
    const response = await axios.post('/api/upload/image', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      uploadedUrl.value = response.data.data.url;
      console.log('上传成功:', response.data);
    }
  } catch (error) {
    console.error('上传失败:', error);
    alert(error.response?.data?.message || '上传失败');
  }
};
</script>
```

#### 多图上传组件

```vue
<template>
  <div>
    <input
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/gif"
      multiple
      @change="handleFilesChange"
      ref="fileInput"
    />
    <button @click="uploadImages">上传图片</button>
    <div v-if="uploadedUrls.length > 0">
      <img
        v-for="(url, index) in uploadedUrls"
        :key="index"
        :src="url"
        alt="上传的图片"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const fileInput = ref(null);
const selectedFiles = ref([]);
const uploadedUrls = ref([]);

const handleFilesChange = (event) => {
  selectedFiles.value = Array.from(event.target.files);
};

const uploadImages = async () => {
  if (selectedFiles.value.length === 0) {
    alert('请先选择文件');
    return;
  }

  const formData = new FormData();
  selectedFiles.value.forEach(file => {
    formData.append('files', file);
  });
  formData.append('type', 'product');

  try {
    const response = await axios.post('/api/upload/images', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      uploadedUrls.value = response.data.data.urls;
      console.log('上传成功:', response.data);
    }
  } catch (error) {
    console.error('上传失败:', error);
    alert(error.response?.data?.message || '上传失败');
  }
};
</script>
```

### 使用上传的图片

#### 商品管理示例

```javascript
// 1. 先上传图片获取 URL
const imageUrl = await uploadImage(); // 返回: "http://8.134.192.13/uploads/products/2024/01/uuid.jpg"

// 2. 创建商品时使用图片 URL
const productData = {
  name: "商品名称",
  price: 99.00,
  stock: 100,
  image: imageUrl, // 使用上传返回的 URL
  categoryId: 1
};

await axios.post('/api/admin/products', productData, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### 用户头像示例

```javascript
// 1. 上传头像
const avatarUrl = await uploadAvatar();

// 2. 更新用户信息
const userData = {
  nickname: "新昵称",
  avatar: avatarUrl // 使用上传返回的 URL
};

await axios.put('/api/user/info', userData, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## React 示例

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('请先选择文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'product');

    try {
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setUploadedUrl(response.data.data.url);
        alert('上传成功！');
      }
    } catch (error) {
      alert('上传失败：' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleFileChange}
      />
      <button onClick={handleUpload}>上传图片</button>
      {uploadedUrl && (
        <div>
          <img src={uploadedUrl} alt="上传的图片" style={{ maxWidth: 300 }} />
          <p>{uploadedUrl}</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
```

## 存储架构

### 目录结构

```
云服务器: /root/EasyMall/uploads/
├── products/           # 商品图片
│   └── 2024/01/       # 按年月组织
│       └── uuid.jpg
└── avatars/           # 用户头像
    └── 2024/01/
        └── uuid.jpg
```

### URL 格式

```
http://8.134.192.13/uploads/{type}/{year}/{month}/{filename}
```

示例:
- 商品图片: `http://8.134.192.13/uploads/products/2024/01/a1b2c3d4.jpg`
- 用户头像: `http://8.134.192.13/uploads/avatars/2024/01/e5f6g7h8.jpg`

## 常见问题

### Q1: 上传时提示"文件为空"

**原因**: 未正确选择文件或文件被清空

**解决**: 检查文件选择逻辑，确保 FormData 正确添加文件

### Q2: 上传时提示"文件大小超过限制"

**原因**: 文件大小超过 5MB

**解决**: 压缩图片或调整文件大小

### Q3: 上传时提示"不支持的文件类型"

**原因**: 文件类型不是 jpg/jpeg/png/gif

**解决**: 转换图片格式为支持的类型

### Q4: 上传成功但无法访问图片

**原因**: Nginx 配置未生效或路径错误

**解决**: 检查 Nginx 配置，确保 `/uploads/` 路径正确映射

### Q5: Docker 容器重启后图片丢失

**原因**: 未正确配置 Volume 挂载

**解决**: 确保 `docker-compose.yml` 中配置了 `./uploads:/data/easymall/uploads`

## 部署说明

### 云服务器配置

1. **创建上传目录**:
```bash
mkdir -p uploads/products uploads/avatars
chmod 755 uploads
```

2. **配置 Nginx**:
```nginx
location /uploads/ {
    alias /root/EasyMall/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

3. **重启服务**:
```bash
docker-compose down
docker-compose up -d
```

## 安全建议

1. **不要在前端硬编码 JWT Token**，使用 localStorage 或 sessionStorage
2. **验证文件类型**：不仅检查扩展名，还要检查文件内容
3. **限制文件大小**：防止大文件攻击
4. **使用 HTTPS**：保护 Token 和图片传输安全
5. **定期清理**：定期清理未使用的图片文件

## 技术支持

如有问题，请查看：
- API 错误码说明
- Nginx 日志：`/var/log/nginx/error.log`
- 应用日志：`docker logs easymall-app`
