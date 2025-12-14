package com.catshop.catshop.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    // Tạo kết nối đến Redis với cấu hình từ application.properties
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        log.info("🔧 [REDIS] Configuring Redis connection: host={}, port={}, hasPassword={}", 
                redisHost, redisPort, redisPassword != null && !redisPassword.isEmpty());
        
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort);
        
        // Chỉ set password nếu có (không rỗng)
        if (redisPassword != null && !redisPassword.trim().isEmpty()) {
            config.setPassword(redisPassword);
            log.info("🔧 [REDIS] Password configured (length: {})", redisPassword.length());
        } else {
            log.info("🔧 [REDIS] No password configured (Redis without password)");
        }
        
        return new LettuceConnectionFactory(config);
    }

    // Bean thao tác với Redis
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }
}