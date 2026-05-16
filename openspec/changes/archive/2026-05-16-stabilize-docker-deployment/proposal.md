## Why

EasyMall 后端和前端各自拥有独立的 `docker-compose.yml`，但缺少根级别的一键启动编排。前端 Nginx 只代理了 `/api/`，未代理 `/uploads/`，导致生产环境中图片上传功能不可用。目前没有统一的生产部署方案和验证流程，部署文档分散且未覆盖 RabbitMQ 和前端 Nginx 的完整配置。

## What Changes

- 新增根级别 `docker-compose.yml`，统一编排后端、前端、MySQL、Redis、RabbitMQ 五个服务
- 更新前端 `nginx.conf`，增加 `/uploads/` 静态文件服务（Nginx 直接挂载 upload-data volume）
- 保留 `easymall-backend/` 和 `easymall-frontend/` 下各自的 `docker-compose.yml` 作为独立开发用途
- 补充 `.env.example` 中缺少的 `FRONTEND_PORT`、`PAYMENT_MOCK_SIGNATURE` 等变量
- 添加部署验证命令和故障排查文档

## Capabilities

### New Capabilities
- `unified-docker-compose`: 根级别统一 docker-compose 编排，一键启动全部服务
- `nginx-production-proxy`: 生产环境 Nginx 配置，覆盖 `/api/` 反向代理和 `/uploads/` 静态文件服务

### Modified Capabilities
- `docker-dev-environment`: 开发环境 docker-compose 保持独立，不受生产编排影响
- `cloud-deployment-guide`: 更新部署文档，覆盖统一编排、RabbitMQ、前端 Nginx 的完整部署流程

## Impact

- 新增根目录 `docker-compose.yml`
- 修改 `easymall-frontend/nginx.conf` 增加 `/uploads/` 静态文件服务（Nginx 直接挂载 volume，不经过后端）
- 更新 `.env.example` 补充缺失变量，标注必需变量
- 生产环境必需变量缺失时后端 fail fast，不静默使用弱默认值
- 更新部署相关文档
- 不影响现有后端/前端各自的 docker-compose 独立开发模式
