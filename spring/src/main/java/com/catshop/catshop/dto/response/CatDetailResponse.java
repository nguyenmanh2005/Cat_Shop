package com.catshop.catshop.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatDetailResponse {

    private Long productId;
    private String productName;
    private Double price;
    private Integer stockQuantity;
    private String imageUrl;
    private String description;

    private String breed;
    private Integer age;
    private String gender;
    private Boolean vaccinated;
}

