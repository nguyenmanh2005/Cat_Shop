package com.catshop.catshop.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long orderId;
    private LocalDateTime paymentDate;
    private String method;
    private BigDecimal amount;
}
