package com.catshop.catshop.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VietQrResponse {
    private String qrCodeBase64;
    private String qrData;
    private Long orderId;
    private BigDecimal amount;
    private String accountNo;
    private String accountName;
    private String content;
    private String bankName;
    private String message;
}

