package com.catshop.catshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MfaVerifyRequest {
    @NotBlank(message = "Email cannot be empty")
    private String email;
    
    @NotBlank(message = "Code cannot be empty")
    private String code; // Có thể là Google Authenticator code (6 số) hoặc Backup code (XXXX-XXXX)
    
    private String deviceId; // Device fingerprint để cập nhật lastLogin (optional)

}

