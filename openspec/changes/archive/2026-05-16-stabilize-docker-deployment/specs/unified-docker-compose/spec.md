## ADDED Requirements

### Requirement: 根级别统一 Docker Compose 编排
项目根目录 MUST 包含 `docker-compose.yml`，SHALL 统一编排 easymall-frontend、easymall-app、mysql、redis、rabbitmq 五个服务，MUST 确保一键 `docker compose up -d` 启动全部服务。

#### Scenario: 一键启动全部服务
- **WHEN** 在项目根目录执行 `docker compose up -d`
- **THEN** 五个容器全部启动（easymall-frontend、easymall-app、easymall-mysql、easymall-redis、easymall-rabbitmq）
- **AND** 所有容器状态为 healthy

#### Scenario: 服务启动顺序
- **WHEN** 执行 `docker compose up -d`
- **THEN** mysql 和 redis 先于 rabbitmq 启动
- **AND** rabbitmq 先于 easymall-app 启动
- **AND** easymall-app 先于 easymall-frontend 启动

### Requirement: 统一 Docker 网络
所有服务 MUST 加入同一个 Docker 网络 `easymall-net`，SHALL 通过服务名互相访问。

#### Scenario: 前端通过服务名访问后端
- **WHEN** easymall-frontend 容器内向 `easymall-app:8080` 发起 HTTP 请求
- **THEN** 请求成功到达后端服务

#### Scenario: 后端通过服务名访问 MySQL
- **WHEN** easymall-app 容器内连接 `mysql:3306`
- **THEN** 数据库连接成功

### Requirement: 构建上下文复用子目录 Dockerfile
根级别 compose MUST 通过 `build.context` 分别指向 `easymall-backend/` 和 `easymall-frontend/`，SHALL 复用各自已有的 Dockerfile。

#### Scenario: 构建后端镜像
- **WHEN** 执行 `docker compose build easymall-app`
- **THEN** 使用 `easymall-backend/Dockerfile` 构建镜像
- **AND** 构建成功

#### Scenario: 构建前端镜像
- **WHEN** 执行 `docker compose build easymall-frontend`
- **THEN** 使用 `easymall-frontend/Dockerfile` 构建镜像
- **AND** 构建成功

### Requirement: 环境变量统一管理
根级别 compose MUST 从根目录 `.env` 文件读取所有环境变量，SHALL 确保各服务配置一致。生产环境必需变量缺失时后端 MUST fail fast，不静默使用弱默认值。

#### Scenario: 从 .env 文件读取配置
- **WHEN** 根目录存在 `.env` 文件并配置了 `MYSQL_PASSWORD=secure_pass`
- **THEN** mysql 服务使用 `secure_pass` 作为 root 密码
- **AND** easymall-app 服务使用相同密码连接数据库

#### Scenario: 必需变量缺失时启动失败
- **WHEN** `.env` 文件缺少 `JWT_SECRET` 或 `MYSQL_PASSWORD` 等必需变量
- **THEN** easymall-app 容器启动失败并输出明确的错误信息
- **AND** 不会静默使用弱默认密钥

### Requirement: 后端容器注入所有 prod 必需环境变量
根级别 compose 的 easymall-app service MUST 通过 `environment` 显式注入 `application-prod.yml` 引用的所有环境变量，SHALL 确保不遗漏任何必需变量。

#### Scenario: PAYMENT_MOCK_SIGNATURE 正确注入
- **WHEN** `.env` 文件配置了 `PAYMENT_MOCK_SIGNATURE=mock_sig`
- **THEN** easymall-app 容器的环境变量中包含 `PAYMENT_MOCK_SIGNATURE=mock_sig`
- **AND** 后端支付模拟功能正常工作
