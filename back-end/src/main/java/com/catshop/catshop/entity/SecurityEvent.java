package com.catshop.catshop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    @Enumerated(EnumType.STRING)
    private SecurityEventType eventType;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String ipAddress;
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

