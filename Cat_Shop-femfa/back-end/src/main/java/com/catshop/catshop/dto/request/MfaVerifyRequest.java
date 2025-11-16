package com.catshop.catshop.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MfaVerifyRequest {
    private String email;
    private String code; // Có thể là Google Authenticator code (6 số) hoặc Backup code (XXXX-XXXX)
    private String deviceId; // Device ID để đánh dấu trusted device sau khi verify thành công
}

