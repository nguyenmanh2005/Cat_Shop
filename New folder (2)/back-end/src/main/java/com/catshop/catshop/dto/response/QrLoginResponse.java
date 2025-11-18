package com.catshop.catshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrLoginResponse {
    private String sessionId;
    private String qrCodeBase64; // Base64 encoded QR code image
    private Long expiresIn; // Thời gian hết hạn (seconds)
    private String message;
}

