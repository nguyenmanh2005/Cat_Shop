package com.catshop.catshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrLoginStatusResponse {
    private String status; // PENDING, APPROVED, REJECTED, EXPIRED
    private TokenResponse tokens; // Chỉ có khi status = APPROVED
    private String message;
}

