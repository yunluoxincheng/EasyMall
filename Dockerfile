# 基础镜像：官方 OpenJDK 17
FROM eclipse-temurin:17-jdk

# 维护者信息
LABEL authors="yunluoxincheng"
LABEL description="EasyMall Spring Boot Application"

# 安装 Maven
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

# 创建工作目录
WORKDIR /app

# 暴露应用端口
EXPOSE 8080

# 启动命令（开发模式）
ENTRYPOINT ["mvn", "spring-boot:run", "-Dspring-boot.run.fork=false"]
