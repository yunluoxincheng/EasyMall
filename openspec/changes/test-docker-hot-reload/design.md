# 设计文档：Docker 卷挂载热重载测试

## 架构分析

### 当前配置

**Dockerfile 分析：**
```dockerfile
FROM eclipse-temurin:17-jdk
# 安装 Maven
RUN apt-get update && apt-get install -y maven
# 使用 mvn spring-boot:run 启动
ENTRYPOINT ["mvn", "spring-boot:run", "-Dspring-boot.run.fork=false"]
```

**docker-compose.yml 卷挂载：**
```yaml
volumes:
  - ./src:/app/src
  - ./pom.xml:/app/pom.xml
  - ${HOME}/.m2:/root/.m2
```

**Spring DevTools 环境变量：**
```yaml
environment:
  - SPRING_DEVTOOLS_RESTART_ENABLED=true
  - SPRING_DEVTOOLS_LIVERELOAD_ENABLED=true
```

### 问题诊断

**潜在问题点：**

1. **pom.xml 缺少 devtools 依赖**
   - Spring Boot DevTools 需要在 pom.xml 中显式声明依赖
   - 当前 pom.xml 可能未包含此依赖

2. **Maven 不会自动重启**
   - `mvn spring-boot:run` 启动后，代码变更需要手动重启
   - DevTools 的自动重启功能在 Docker 环境中可能受限

3. **卷挂载路径问题**
   - Windows 路径映射可能导致文件变更监听失败

## 设计方案

### 方案 A：添加 DevTools 依赖（推荐）

**步骤：**
1. 在 pom.xml 添加 `spring-boot-devtools` 依赖
2. 创建测试 Controller
3. 修改代码后观察容器日志

**预期行为：**
- DevTools 检测到 classpath 变化
- 触发应用上下文重启
- 日志显示 "Restarting EasyMall" 信息

### 方案 B：使用远程调试（备选）

如果 DevTools 无法在 Docker 中工作，可以：
1. 配置 JDWP 远程调试端口
2. 使用 IDE 连接容器进行热替换

## 测试 Controller 设计

```java
@RestController
@RequestMapping("/api/test")
public class HotReloadTestController {

    @GetMapping("/hot-reload")
    public Result<String> testHotReload() {
        return Result.success("Hot reload test - " + LocalDateTime.now());
    }
}
```

**测试流程：**
1. 访问 `GET /api/test/hot-reload` 记录初始响应
2. 修改返回字符串
3. 等待 5-10 秒
4. 再次访问端点
5. 观察响应是否更新

## 验证标准

### 成功标准
- 代码修改后，容器日志出现重启信息
- 无需手动重启容器，新代码生效

### 失败标准
- 代码修改后，容器无任何日志
- 需要手动重启容器才能生效

## 依赖关系

- 需要 Spring Boot DevTools 依赖
- 需要正确的 Maven 配置
- 需要正确的卷挂载路径
