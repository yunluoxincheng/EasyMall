## Context

EasyMall 已完成路线图阶段 1-8A 的全部实现（共 10 个提案归档），包括工程结构重构、订单状态机、库存锁定、支付幂等、MQ 事件驱动、优惠券生命周期、积分幂等、管理端/用户端前端、测试与 CI。最近的两次额外提交完成了 Docker 文件结构重构（前后端独立 Dockerfile）和 docs 目录迁移。

当前文档状态：
- README.md 仍以课程作业风格描述功能列表，未突出企业级交易链路设计
- docs/ 目录存在 7 个文档但内容碎片化，部分已过时
- 缺少架构概览、业务设计、数据库设计等核心文档
- 无演示指南或默认账号说明

## Goals / Non-Goals

**Goals:**
- 重写 README 为"企业级 B2C 商城项目"定位，突出交易链路设计亮点
- 建立完整的 `docs/` 文档体系：架构、业务设计、数据库、前端、部署
- 让 README 一页即可传达项目的核心价值和技术深度
- 让面试官/答辩老师可以通过文档快速理解项目设计思路
- 提供演示指南，覆盖管理端和用户端的演示路径及默认账号

**Non-Goals:**
- 不修改任何业务代码
- 不修改数据库 schema
- 不引入新技术组件
- 不做项目截图（需运行项目后手动截图，可在后续补充）
- 不做微服务评估（属于路线图阶段 9）

## Decisions

### 1. 文档目录结构

采用按主题分类的扁平结构：

```
docs/
├── architecture.md          # 系统架构概览（合并架构内容）
├── business/
│   ├── order-state-machine.md
│   ├── inventory-model.md
│   ├── payment-system.md
│   ├── coupon-lifecycle.md
│   ├── points-ledger.md
│   └── mq-event-driven.md
├── database.md              # 数据库设计（ER 图、核心表）
├── frontend-guide.md        # 前端开发指南
├── deployment.md            # 部署指南（本地 + Docker + 云服务器）
├── demo.md                  # 演示指南（默认账号、演示路径）
├── API.md                   # API 文档（保留现有）
└── image-upload-guide.md    # 图片上传指南（保留现有）
```

**Why**: 扁平结构比深层嵌套更易浏览和维护。业务设计文档按主题独立，方便面试时针对单个话题深入讲解。演示指南独立成文件，方便答辩前快速查阅。

### 2. README 结构

采用"亮点驱动"结构而非"功能列表"结构：

```
项目标题 + 一句话定位
核心亮点（6-8 个 bullet points）
技术栈（全栈）
系统架构（简化架构图）
核心流程设计
  - 订单交易流程
  - 库存锁定流程
  - 支付幂等流程
项目结构（目录树，反映前后端各自含 Dockerfile/docker-compose）
快速开始
文档索引
```

**Why**: 面试和 GitHub 浏览场景下，读者首先关注"这个项目有什么亮点"而非"有哪些功能"。亮点前置能快速传达项目深度。

### 3. 过时文档处理

现有 `docs/` 中的过时文档直接覆盖重写，不保留历史版本：
- `deployment-guide.md` → 重写为 `deployment.md`
- `cloud-deployment.md` → 合并到 `deployment.md`
- `PACKAGE_STRUCTURE.md` → 合并到 `architecture.md`
- `ARCHITECTURE_REVIEW.md` → 合并到 `architecture.md`

**Why**: 过时文档比没有文档更糟糕。Git 历史已保留旧版本，无需在文件系统中存档。

### 4. 架构图使用 Mermaid

架构图使用 Mermaid 语法内嵌 Markdown，不依赖外部工具生成图片。

**Why**: Mermaid 在 GitHub 和大多数 Markdown 渲染器中原生支持，维护成本为零。

### 5. 前后端独立网络，无需任何手动网络配置

后端 docker-compose.yml 不声明任何自定义网络，使用 Docker Compose 默认网络（服务间通过服务名互相访问）。前端通过 `host.docker.internal` 访问后端映射到宿主机的 8080 端口，无需与后端共享 Docker 网络。

**Why**: 消除 `docker network create` 手动步骤和显式网络声明，降低部署门槛。前端 Nginx 使用 `host.docker.internal` + `extra_hosts` 配置，在 Windows/Mac/Linux 上均可正常工作（Linux 需要 Docker Engine 20.10+ 以支持 host-gateway）。

## Risks / Trade-offs

- **文档量大** → 分阶段创建，优先 README 和架构文档，业务设计文档按优先级逐个完成
- **Mermaid 兼容性** → GitHub 原生支持，部分 Markdown 编辑器可能不渲染，但不影响 GitHub 展示
- **现有文档覆盖** → 部分旧文档内容可能仍有用，重写前会提取有价值内容
