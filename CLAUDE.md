<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

\# B2C 电子商城系统 


##项目名称EasyMall



\## 后端开发文档（课程实训安全版）



> 课程：《Java Web 开发基础》

> 项目类型：期末课程实训（两人小组，前后端分离）

> 本人职责：后端系统设计与实现



---



\## 1. 项目概述



本项目为基于 B2C（Business to Customer）模式的电子商城系统，面向普通消费者提供商品展示、购物、下单及订单管理等功能。系统采用前后端分离架构，后端负责业务逻辑处理、数据持久化与接口服务，前端通过 HTTP 接口进行数据交互。



项目设计与实现严格依据《B2C 商城需求规格说明书》，在满足课程实训要求的基础上，适当引入工程化设计思想，以提升系统层次与可扩展性。



---



\## 2. 技术选型（课程实训合理范围）



\### 2.1 后端核心技术（已实现）

\* JDK 17

\* Spring Boot 4.0.1（基础开发框架）

\* Spring MVC（Web 控制层）

\* RESTful API 设计风格

\* Spring Security + JWT（基础用户认证与权限控制）

\* MyBatis Plus（ORM 框架）

\* MySQL 8（关系型数据库）

\* Redis（缓存热点数据、登录态信息）

\* Elasticsearch（商品名称与关键字搜索）



> 说明：以上技术均直接服务于商城核心业务功能，规模与复杂度控制在课程实训可掌控范围内。



\### 2.2 工程化扩展设计（非强制）



\* Docker（容器化部署支持，用于环境统一与快速部署）

\* Nginx（前后端分离部署，反向代理）

\* MinIO（商品图片对象存储）



> 上述内容为工程化增强设计，不作为系统运行的必要条件，系统可在无 Docker 环境下正常运行。



---



\## 3. 系统整体架构设计



\### 3.1 系统架构模式



系统采用经典的三层架构设计：



\* 表现层（Controller）：接收前端请求，返回 JSON 数据

\* 业务层（Service）：封装核心业务逻辑

\* 持久层（Mapper/DAO）：负责数据库访问



\### 3.2 后端模块划分



\* 用户与会员模块

\* 商品与分类模块

\* 购物车模块

\* 订单管理模块

\* 评论与收藏模块

\* 后台管理模块



### 3.3 API 响应格式

系统所有 API 接口统一使用增强的响应结构 `Result<T>` 封装：

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| success | Boolean | true 表示成功，false 表示失败 |
| code | String | 业务状态码（如 "SUCCESS", "VALIDATION_ERROR", "PRODUCT_NOT_FOUND"） |
| message | String | 响应消息描述 |
| timestamp | LocalDateTime | 响应时间戳 |
| traceId | String | 请求追踪 ID，用于日志关联和问题追踪 |
| data | T | 响应数据（仅成功时存在） |
| errors | List<ErrorDetail> | 错误详情数组（仅错误时存在） |

#### 成功响应示例

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "操作成功",
  "timestamp": "2024-12-23T12:30:00.123",
  "traceId": "a1b2c3d4e5f6g7h8",
  "data": {
    "id": 1,
    "name": "商品名称"
  }
}
```

#### 错误响应示例

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "参数校验失败",
  "timestamp": "2024-12-23T12:30:00.123",
  "traceId": "a1b2c3d4e5f6g7h8",
  "errors": [
    {
      "field": "productId",
      "code": "REQUIRED",
      "message": "商品ID不能为空",
      "rejectedValue": null
    }
  ]
}
```

#### 使用方式

```java
// 成功响应（无数据）
return Result.success();

// 成功响应（带数据）
return Result.success(data);

// 成功响应（自定义消息）
return Result.success("保存成功", data);

// 错误响应（使用预定义状态码）
return Result.error(ResponseCode.PRODUCT_NOT_FOUND);

// 错误响应（自定义消息）
return Result.error("库存不足");

// 抛出业务异常
throw new BusinessException(ResponseCode.PRODUCT_OUT_OF_STOCK, "商品库存不足");
```

#### 标准业务状态码

| 状态码 | HTTP状态 | 说明 |
|--------|----------|------|
| SUCCESS | 200 | 操作成功 |
| ERROR | 500 | 操作失败 |
| VALIDATION_ERROR | 400 | 参数校验失败 |
| NOT_FOUND | 404 | 资源不存在 |
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 无权访问 |
| PRODUCT_NOT_FOUND | 404 | 商品不存在 |
| PRODUCT_OUT_OF_STOCK | 400 | 商品库存不足 |
| ORDER_NOT_FOUND | 404 | 订单不存在 |
| USER_NOT_FOUND | 404 | 用户不存在 |

---



\## 4. 核心功能模块设计



\### 4.1 用户与会员模块



\#### 主要功能



\* 用户注册与登录

\* JWT 登录认证

\* 用户信息维护

\* 地址簿管理

\* 会员积分与等级维护



\#### 设计说明



\* 用户密码采用加密存储

\* 登录成功后返回 JWT，用于接口访问认证

\* 普通用户与管理员通过角色进行区分



---



\### 4.2 商品与分类模块



\#### 主要功能



\* 商品分类管理（多级分类）

\* 商品信息展示

\* 商品搜索（基于 Elasticsearch）



\#### 设计说明



\* 商品基础信息存储在 MySQL

\* 商品名称及关键字段同步至 Elasticsearch

\* 前端搜索请求直接调用搜索接口



---



\### 4.3 购物车模块



\#### 主要功能



\* 添加商品至购物车

\* 修改商品数量

\* 删除购物车商品



\#### 设计说明



\* 每个用户维护独立购物车数据

\* 添加或修改商品时进行库存校验



---



\### 4.4 订单管理模块



\#### 主要功能



\* 创建订单

\* 查询历史订单

\* 订单状态流转



\#### 订单状态设计



\* 待支付

\* 已支付

\* 已发货

\* 已完成



---



\### 4.5 后台管理模块



\#### 主要功能



\* 商品管理（新增、修改、删除、上下架、库存管理）

\* 订单管理（订单列表、订单详情、状态修改、取消订单）

\* 用户管理（用户列表、用户详情、状态管理、角色管理、积分调整）

\* 评论审核（评论列表、审核通过/拒绝、商家回复、删除评论）

\* 会员等级管理（等级配置、新增/修改/删除等级、状态管理）

\* 分类管理（分类列表、新增/修改/删除分类、状态管理）

\* 积分兑换商品管理（兑换商品列表、新增/修改/删除、上下架、库存管理）



\#### 权限控制



\* 后台接口仅管理员角色可访问（`/api/admin/**` 路径）

\* 使用 Spring Security 进行接口权限拦截

\* 所有 AdminController 使用 `@PreAuthorize("hasRole('ADMIN')")` 注解



---



\## 5. 数据库设计概述



\### 5.1 核心数据表



\* 用户表（user）

\* 商品表（product）

\* 商品分类表（category）

\* 购物车表（cart）

\* 订单表（order）

\* 订单明细表（order\_item）

\* 评论表（comment）

\* 收藏表（favorite）

\* 会员等级表（member\_level）

\* 签到表（sign\_in）

\* 积分记录表（points\_record）

\* 积分兑换商品表（points\_product）

\* 积分兑换记录表（points\_exchange）



---



\## 6. Docker 最小可选部署方案（工程化加分项）



\### 6.1 设计原则



\* Docker 仅作为扩展部署方式

\* 不影响本地传统方式运行

\* 仅容器化后端服务与数据库



\### 6.2 Dockerfile（后端服务）示例



\* 基于 OpenJDK 8/11

\* 启动 Spring Boot Jar 包



\### 6.3 docker-compose 说明



\* backend：Spring Boot 应用

\* mysql：MySQL 8 数据库



> 该方案用于展示系统的工程化能力，非课程实训的必需内容。



---



\## 7. 项目运行方式说明



\### 7.1 本地运行（推荐）



1\. 启动 MySQL

2\. 启动 Redis

3\. 使用 IDEA 启动 Spring Boot 项目

4\. 前端通过接口地址访问后端



\### 7.2 Docker 运行（可选）



1\. 安装 Docker 与 Docker Compose

2\. 执行 docker-compose up

3\. 浏览器访问服务地址



---



\## 8. 扩展与前瞻设计（未实现）



以下内容为调研后的扩展设想，未作为本次课程实训实现范围：



\* 使用消息队列进行异步订单处理

\* 引入系统监控与日志分析平台

\* 支持系统横向扩展与云端部署



---



\## 9. 总结



本项目在满足课程实训功能要求的基础上，采用主流 Java Web 技术栈完成后端系统设计与实现。系统结构清晰、功能完整，具备一定工程化设计能力，同时严格控制技术复杂度，确保项目稳定可运行，适合作为课程实训成果提交与答辩展示。



