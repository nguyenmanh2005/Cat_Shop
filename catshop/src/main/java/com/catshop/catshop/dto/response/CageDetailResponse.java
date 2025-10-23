package com.catshop.catshop.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CageDetailResponse {
    private Long productId;
    private String productName;
    private Double price;
    private Integer stockQuantity;
    private String imageUrl;
    private String description;

    // Thông tin riêng của Cage
    private String material;
    private String dimensions;
}
