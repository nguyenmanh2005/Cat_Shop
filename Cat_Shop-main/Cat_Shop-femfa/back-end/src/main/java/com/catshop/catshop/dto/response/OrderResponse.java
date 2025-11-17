//package com.catshop.catshop.dto.response;
//
//import lombok.*;
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class OrderResponse {
//    private Long orderId;
//    private Long userId;
//    private LocalDateTime orderDate;
//    private String status;
//    private BigDecimal totalAmount;
//
//    private List<PaymentResponse> payments;
//    private List<ShipmentResponse> shipments;
//}


package com.catshop.catshop.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long orderId;
    private Long userId;
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal totalAmount;
}
