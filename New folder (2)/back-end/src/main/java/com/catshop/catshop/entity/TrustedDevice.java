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
    private String hostName; // tên máy (hostname) nếu xác định được
    private String userAgent;
    private boolean trusted;
    private LocalDateTime lastLogin;
}
