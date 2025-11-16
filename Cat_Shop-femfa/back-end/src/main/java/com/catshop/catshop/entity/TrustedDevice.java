package com.catshop.catshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "trusted_devices")
public class TrustedDevice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private String deviceId; // fingerprint
    private String ipAddress;
    private String userAgent;
    private boolean trusted;
    private LocalDateTime lastLogin;
    
    @Column(nullable = true) // Cho phép null để tương thích với database cũ
    private LocalDateTime createdAt;
    
    @Column(nullable = true) // Cho phép null để tương thích với database cũ
    private LocalDateTime expiresAt; // Thời gian hết hạn (30 ngày mặc định)
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            // Mặc định 30 ngày
            expiresAt = LocalDateTime.now().plusDays(30);
        }
        if (lastLogin == null) {
            lastLogin = LocalDateTime.now();
        }
    }
    
    /**
     * Kiểm tra xem device có còn hiệu lực không
     */
    public boolean isValid() {
        try {
            // Nếu chưa có expiresAt (device cũ), coi như vẫn còn hiệu lực (backward compatibility)
            if (expiresAt == null) {
                return trusted;
            }
            return trusted && LocalDateTime.now().isBefore(expiresAt);
        } catch (Exception e) {
            // Nếu lỗi, coi như không hợp lệ
            return false;
        }
    }
}
