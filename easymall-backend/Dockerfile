# 多阶段构建
# 阶段一：Maven 构建
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# 先复制 pom.xml 下载依赖（利用缓存）
COPY pom.xml .
RUN mvn dependency:go-offline

# 复制源码并构建
COPY src ./src
RUN mvn clean package -DskipTests

# 阶段二：运行
FROM eclipse-temurin:17-jre-alpine

# 时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

# 非 root 用户
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS=""
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
