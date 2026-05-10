package org.ruikun;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan({
    "org.ruikun.modules.user.mapper",
    "org.ruikun.modules.product.mapper",
    "org.ruikun.modules.order.mapper",
    "org.ruikun.modules.coupon.mapper",
    "org.ruikun.modules.points.mapper",
    "org.ruikun.modules.comment.mapper",
    "org.ruikun.modules.favorite.mapper",
    "org.ruikun.modules.inventory.mapper",
    "org.ruikun.modules.payment.mapper",
    "org.ruikun.infrastructure.mq.consumelog"
})
public class EasyMallApplication {

    public static void main(String[] args) {
        SpringApplication.run(EasyMallApplication.class, args);
    }

}
