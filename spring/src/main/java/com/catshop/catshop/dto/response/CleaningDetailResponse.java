package com.catshop.catshop.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CleaningDetailResponse {

    // Thông tin chung từ bảng Product
    private Long productId;
    private String productName;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private String description;

    // Thông tin riêng của CleaningDetail
    private Integer volumeMl;
    private String usage;
}
