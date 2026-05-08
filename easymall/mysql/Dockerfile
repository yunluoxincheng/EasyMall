# EasyMall MySQL 镜像
# 基于 MySQL 8.0，预装 EasyMall 数据库结构

FROM mysql:8.0

# 维护者信息
LABEL maintainer="yunluoxincheng"
LABEL description="EasyMall MySQL Database with Pre-initialized Schema"

# 设置环境变量
ENV MYSQL_ROOT_PASSWORD=123456
ENV MYSQL_DATABASE=easymall
ENV TZ=Asia/Shanghai

# 复制数据库初始化脚本
# MySQL 会自动按字母顺序执行 /docker-entrypoint-initdb.d/ 目录下的 .sql 文件
# 文件名使用 V1__, V2__ 等前缀确保正确的执行顺序
COPY src/main/resources/db/migration/V1__Create_initial_tables.sql /docker-entrypoint-initdb.d/
COPY src/main/resources/db/migration/V2__Create_member_tables.sql /docker-entrypoint-initdb.d/
COPY src/main/resources/db/migration/V3__Create_points_exchange_tables.sql /docker-entrypoint-initdb.d/
COPY src/main/resources/db/migration/V5__Add_coupon_tables.sql /docker-entrypoint-initdb.d/
COPY src/main/resources/db/migration/test-data.sql /docker-entrypoint-initdb.d/

# 设置 MySQL 配置
RUN echo "default-time-zone='+08:00'" >> /etc/mysql/conf.d/easymall.cnf && \
    echo "character-set-server=utf8mb4" >> /etc/mysql/conf.d/easymall.cnf && \
    echo "collation-server=utf8mb4_unicode_ci" >> /etc/mysql/conf.d/easymall.cnf

# 暴露 MySQL 端口
EXPOSE 3306

# MySQL 镜像的默认入口点
CMD ["mysqld"]
