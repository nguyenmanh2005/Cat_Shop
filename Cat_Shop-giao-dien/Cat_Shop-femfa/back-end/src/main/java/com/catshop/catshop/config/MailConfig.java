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
        
        // Cấu hình dựa trên port
        if (port == 465) {
            // Port 465: Dùng SSL trực tiếp
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");
            props.put("mail.smtp.ssl.checkserveridentity", "true");
            props.put("mail.smtp.starttls.enable", "false");
            props.put("mail.smtp.starttls.required", "false");
            log.info("📧 [MAIL-CONFIG] Using SSL on port 465");
        } else {
            // Port 587: Dùng STARTTLS
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.enable", "false");
            props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");
            props.put("mail.smtp.ssl.checkserveridentity", "true");
            log.info("📧 [MAIL-CONFIG] Using STARTTLS on port 587");
        }
        
        // Tăng timeout để tránh connection timeout trên Railway
        props.put("mail.smtp.connectiontimeout", "30000"); // 30 giây
        props.put("mail.smtp.timeout", "30000"); // 30 giây
        props.put("mail.smtp.writetimeout", "30000"); // 30 giây
        props.put("mail.debug", "true"); // Bật debug để xem chi tiết lỗi

        log.info("📧 [MAIL-CONFIG] JavaMailSender configured successfully");
        log.info("═══════════════════════════════════════════════════════════");

        return mailSender;
    }
}


