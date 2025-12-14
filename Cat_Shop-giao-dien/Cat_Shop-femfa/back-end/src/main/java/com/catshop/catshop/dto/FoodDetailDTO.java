package com.catshop.catshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodDetailDTO {
    private Long foodId;
    private Double weightKg;
    private String ingredients;
    private LocalDate expiryDate;
}