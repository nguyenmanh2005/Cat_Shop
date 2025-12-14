package com.catshop.catshop.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long productId;
    private String productName;
    private BigDecimal price;
    private Integer stockQuantity;
    private String description;
    private String imageUrl;
    private Long typeId;
    private String typeName;
    private Long categoryId;
    private String categoryName;
}
