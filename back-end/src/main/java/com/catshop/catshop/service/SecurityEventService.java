package com.catshop.catshop.service;

import com.catshop.catshop.dto.response.SecurityEventResponse;
import com.catshop.catshop.entity.SecurityEvent;
import com.catshop.catshop.entity.SecurityEventType;
import com.catshop.catshop.repository.SecurityEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityEventService {

    private final SecurityEventRepository securityEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void recordEvent(String email,
                            SecurityEventType type,
                            String message,
                            String ipAddress,
                            String userAgent,
                            Map<String, Object> metadata) {
        try {
            String metadataJson = null;
            if (!CollectionUtils.isEmpty(metadata)) {
                metadataJson = objectMapper.writeValueAsString(metadata);
            }

            SecurityEvent event = SecurityEvent.builder()
                    .userEmail(normalizeEmail(email))
                    .eventType(type)
                    .message(message)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .metadata(metadataJson)
                    .createdAt(LocalDateTime.now())
                    .build();

            securityEventRepository.save(Objects.requireNonNull(event));
        } catch (JsonProcessingException e) {
            log.error("❌ Failed to serialize metadata for security event: {}", e.getMessage());
        } catch (Exception e) {
            log.error("❌ Failed to record security event: {}", e.getMessage());
        }
    }

    public List<SecurityEventResponse> getRecentEvents(String email, int limit) {
        String normalizedEmail = normalizeEmail(email);
        List<SecurityEvent> events = securityEventRepository
                .findTop50ByUserEmailOrderByCreatedAtDesc(normalizedEmail);

        return events.stream()
                .limit(limit)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private SecurityEventResponse toResponse(SecurityEvent event) {
        Map<String, Object> metadataMap = Collections.emptyMap();
        if (event.getMetadata() != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> parsed = objectMapper.readValue(event.getMetadata(), Map.class);
                metadataMap = parsed;
            } catch (Exception e) {
                metadataMap = Collections.singletonMap("raw", event.getMetadata());
            }
        }

        return SecurityEventResponse.builder()
                .id(event.getId())
                .eventType(event.getEventType())
                .message(event.getMessage())
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .metadata(metadataMap)
                .createdAt(event.getCreatedAt())
                .build();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}

