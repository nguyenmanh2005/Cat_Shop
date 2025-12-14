package com.catshop.catshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity lưu trữ các IP address đã biết của user
 * Khi user đăng nhập từ IP mới, hệ thống sẽ gửi email cảnh báo
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_known_ips", indexes = {
    @Index(name = "idx_user_email", columnList = "userEmail"),
    @Index(name = "idx_ip_address", columnList = "ipAddress")
})
public class UserKnownIp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String userEmail;

    @Column(nullable = false, length = 45)
    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @Column(nullable = false)
    private LocalDateTime firstSeen;

    @Column(nullable = false)
    private LocalDateTime lastSeen;

    @Builder.Default
    @Column(nullable = false)
    private Integer loginCount = 1; // Số lần đăng nhập từ IP này

    @Column(length = 100)
    private String location; // Vị trí địa lý (tùy chọn)
}

