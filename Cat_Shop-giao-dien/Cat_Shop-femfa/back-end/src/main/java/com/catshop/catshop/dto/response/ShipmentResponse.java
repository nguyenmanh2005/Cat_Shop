package com.catshop.catshop.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentResponse {
    private Long orderId;
    private String shippingAddress;
    private LocalDateTime shippedDate;
    private String status;
}

