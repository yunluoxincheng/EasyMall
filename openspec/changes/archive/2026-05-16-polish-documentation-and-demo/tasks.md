## 1. README 重写

- [x] 1.1 重写 README 顶部：项目标题 + 一句话定位 + 核心亮点列表（订单状态机、库存锁定、支付幂等、MQ 延迟关单、优惠券生命周期、积分幂等）
- [x] 1.2 编写技术栈部分：后端（Spring Boot、MySQL、Redis、RabbitMQ）+ 前端（Vue 3、Naive UI）+ 工程化（Docker Compose、CI、Flyway）
- [x] 1.3 编写系统架构概览：Mermaid 架构图 + 模块说明
- [x] 1.4 编写核心流程概览：订单交易链路、库存锁定流程、支付幂等流程的简化描述
- [x] 1.5 编写项目结构：前后端分离目录树（easymall-backend、easymall-frontend、docs，各子项目含独立 Dockerfile/docker-compose）
- [x] 1.6 编写快速开始：环境准备、配置、启动步骤
- [x] 1.7 编写文档索引：指向 docs/ 下各文档的链接

## 2. 架构文档

- [x] 2.1 创建 docs/architecture.md：系统架构总览（Mermaid 架构图：前端 → Nginx → 后端 → MySQL/Redis/RabbitMQ）
- [x] 2.2 编写后端模块化架构说明（modules/ 各模块职责、common/ 公共层、infrastructure/ 基础设施层）
- [x] 2.3 编写前端架构说明（管理端 + 用户端双应用结构、Vue 3 + Naive UI 技术栈）
- [x] 2.4 编写部署架构说明（前后端独立 Docker + Nginx 通过 host.docker.internal 反向代理后端宿主机端口）

## 3. 业务设计文档

- [x] 3.1 创建 docs/business/ 目录
- [x] 3.2 创建 docs/business/order-state-machine.md：状态定义 + 状态转换表 + 状态转换图
- [x] 3.3 创建 docs/business/inventory-model.md：三态分离说明 + 操作流程 + 并发安全
- [x] 3.4 创建 docs/business/payment-system.md：支付单模型 + 支付状态生命周期 + 幂等机制 + 回调日志
- [x] 3.5 创建 docs/business/mq-event-driven.md：领域事件定义 + 延迟关单流程 + 消费者幂等 + 缓存失效
- [x] 3.6 创建 docs/business/coupon-lifecycle.md：优惠券状态定义 + 状态流转规则 + 下单锁定/支付确认/取消返还
- [x] 3.7 创建 docs/business/points-ledger.md：幂等键设计（biz_type + biz_id）+ 各场景幂等键规则

## 4. 数据库设计文档

- [x] 4.1 创建 docs/database.md：Mermaid ER 图（核心表关系）
- [x] 4.2 编写核心表字段说明（user、product、category、order、order_item、cart、payment_order、inventory、coupon_template、user_coupon、points_record、member_level 等）
- [x] 4.3 编写 Flyway 迁移策略说明

## 5. 前端开发指南

- [x] 5.1 创建 docs/frontend-guide.md：管理端开发指南（安装、启动、Vue 3 + Naive UI 技术栈、目录结构）
- [x] 5.2 编写用户端开发指南（安装、启动、技术栈）
- [x] 5.3 编写生产构建说明（npm run build、Docker 构建、API 代理配置）

## 6. 部署指南重写

- [x] 6.1 创建 docs/deployment.md（合并旧 deployment-guide.md 和 cloud-deployment.md）
- [x] 6.2 编写前提条件（建议 Docker Engine 20.10+，Linux 上 host.docker.internal 依赖 host-gateway 支持）
- [x] 6.3 编写本地开发启动指南（MySQL、Redis、RabbitMQ、后端、前端启动顺序）
- [x] 6.4 编写 Docker Compose 部署指南（后端使用默认网络，前端通过 host.docker.internal 连接后端宿主机端口）
- [x] 6.5 编写云服务器部署指南（镜像构建、推送、启动、Nginx 配置）
- [x] 6.6 编写环境变量配置说明（.env.example 完整解读，注明前端 Docker 部署时 APP_PORT 须保持 8080 否则需同步改 nginx.conf 并重建镜像）

## 7. 演示指南

- [x] 7.1 创建 docs/demo.md：默认管理员账号（admin/admin123）+ 普通用户注册步骤
- [x] 7.2 编写管理端演示路径（登录 → 商品管理 → 订单管理 → 优惠券管理 → 评论审核）
- [x] 7.3 编写用户端演示路径（注册/登录 → 浏览商品 → 购物车 → 下单 → 支付 → 查看订单 → 签到/积分/会员）
- [x] 7.4 编写核心交易链路亮点演示步骤（库存锁定验证、超时自动取消、支付幂等、优惠券锁定与返还）

## 8. 过时文档清理

- [x] 8.1 删除或替换 docs/deployment-guide.md（内容已合并到 docs/deployment.md）
- [x] 8.2 删除或替换 docs/cloud-deployment.md（内容已合并到 docs/deployment.md）
- [x] 8.3 删除或替换 docs/PACKAGE_STRUCTURE.md（内容已合并到 docs/architecture.md）
- [x] 8.4 删除或替换 docs/ARCHITECTURE_REVIEW.md（内容已合并到 docs/architecture.md）
- [x] 8.5 保留 docs/API.md 和 docs/image-upload-guide.md（内容仍有价值，无需重写）
