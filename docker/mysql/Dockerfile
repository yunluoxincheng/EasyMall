# EasyMall MySQL 镜像
# 基于 MySQL 8.0，预装 EasyMall 数据库结构
# 构建方式: docker build -f docker/mysql/Dockerfile -t easymall-mysql ..

FROM mysql:8.0

LABEL maintainer="yunluoxincheng"
LABEL description="EasyMall MySQL Database with Pre-initialized Schema"

ENV MYSQL_ROOT_PASSWORD=123456
ENV MYSQL_DATABASE=easymall
ENV TZ=Asia/Shanghai

# 构建上下文为 easymall-backend/
COPY src/main/resources/db/migration/V1__Create_initial_tables.sql /docker-entrypoint-initdb.d/
COPY src/main/resources/db/migration/V2__Create_member_tables.sql /docker-entrypoint-initdb.d/
COPY src/main/resources/db/migration/V3__Create_points_exchange_tables.sql /docker-entrypoint-initdb.d/
COPY src/main/resources/db/migration/V5__Add_coupon_tables.sql /docker-entrypoint-initdb.d/
COPY src/main/resources/db/migration/test-data.sql /docker-entrypoint-initdb.d/

RUN echo "default-time-zone='+08:00'" >> /etc/mysql/conf.d/easymall.cnf && \
    echo "character-set-server=utf8mb4" >> /etc/mysql/conf.d/easymall.cnf && \
    echo "collation-server=utf8mb4_unicode_ci" >> /etc/mysql/conf.d/easymall.cnf

EXPOSE 3306

CMD ["mysqld"]
