package com.catshop.catshop.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Slf4j
@Configuration
public class MailConfig {

    @Value("${spring.mail.host}")
    private String host;

    @Value("${spring.mail.port}")
    private int port;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Bean
    // Bỏ @ConditionalOnMissingBean để đảm bảo cấu hình này luôn được sử dụng
    public JavaMailSender javaMailSender() {
        log.info("═══════════════════════════════════════════════════════════");
        log.info("📧 [MAIL-CONFIG] Initializing JavaMailSender...");
        log.info("📧 [MAIL-CONFIG] Host: {}", host);
        log.info("📧 [MAIL-CONFIG] Port: {}", port);
        log.info("📧 [MAIL-CONFIG] Username: {}", username);
        log.info("📧 [MAIL-CONFIG] Password: {} (length: {})", 
                password != null ? "***" : "NULL", 
                password != null ? password.length() : 0);
        
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");
        props.put("mail.debug", "true"); // Bật debug để xem chi tiết lỗi

        log.info("📧 [MAIL-CONFIG] JavaMailSender configured successfully");
        log.info("═══════════════════════════════════════════════════════════");

        return mailSender;
    }
}


