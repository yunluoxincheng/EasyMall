package org.ruikun;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
public abstract class BaseSpringBootTest {

    static MySQLContainer<?> mysql;

    static {
        String dockerHost = System.getenv("DOCKER_HOST");
        String tcpHost = "tcp://localhost:2375";
        if (dockerHost == null || !dockerHost.startsWith("tcp://")) {
            System.setProperty("testcontainers.reuse.enable", "false");
            // Force docker-java to use TCP when named pipe is unavailable
            try {
                String currentOs = System.getProperty("os.name", "").toLowerCase();
                if (currentOs.contains("win")) {
                    System.setProperty("docker.host", tcpHost);
                    System.out.println("[Testcontainers] Setting docker.host=" + tcpHost);
                }
            } catch (Exception e) {
                // ignore
            }
        }
    }

    @BeforeAll
    static void startContainer() {
        mysql = new MySQLContainer<>(DockerImageName.parse("mysql:8.0"))
                .withDatabaseName("easymall_test")
                .withUsername("test")
                .withPassword("test");
        mysql.start();
    }

    @AfterAll
    static void stopContainer() {
        if (mysql != null) {
            mysql.stop();
        }
    }

    @MockitoBean
    ConnectionFactory connectionFactory;

    @MockitoBean
    RabbitTemplate rabbitTemplate;

    @MockitoBean
    StringRedisTemplate stringRedisTemplate;

    @MockitoBean
    RedisConnectionFactory redisConnectionFactory;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("TEST_JDBC_URL", () -> mysql.getJdbcUrl());
        registry.add("TEST_DB_USERNAME", () -> mysql.getUsername());
        registry.add("TEST_DB_PASSWORD", () -> mysql.getPassword());
    }
}
