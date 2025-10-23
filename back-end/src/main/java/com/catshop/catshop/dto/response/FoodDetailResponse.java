package com.catshop.catshop.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodDetailResponse {

    // -------- Thông tin Product ----------
    private Long productId;
    private String productName;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private String description;

    // -------- Thông tin Food Detail -------
    private BigDecimal weightKg;
    private String ingredients;
    private LocalDate expiryDate;
}
