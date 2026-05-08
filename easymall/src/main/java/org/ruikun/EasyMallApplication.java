package org.ruikun;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("org.ruikun.mapper")
public class EasyMallApplication {

    public static void main(String[] args) {
        SpringApplication.run(EasyMallApplication.class, args);
    }

}
