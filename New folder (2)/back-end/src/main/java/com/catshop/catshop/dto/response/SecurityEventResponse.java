package com.catshop.catshop.dto.response;

import com.catshop.catshop.entity.SecurityEventType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class SecurityEventResponse {
    private Long id;
    private SecurityEventType eventType;
    private String message;
    private String ipAddress;
    private String userAgent;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
}

