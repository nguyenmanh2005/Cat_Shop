package com.catshop.catshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodDetailRequest {

    @NotNull(message = "Product ID (food_id) không được để trống")
    private Long foodId;

    @DecimalMin(value = "0.1", message = "Cân nặng phải lớn hơn 0")
    @Digits(integer = 3, fraction = 2, message = "Cân nặng không hợp lệ (tối đa 3 số và 2 số thập phân)")
    private BigDecimal weightKg;

    @NotBlank(message = "Thành phần không được để trống")
    private String ingredients;

    @Future(message = "Hạn sử dụng phải ở tương lai")
    private LocalDate expiryDate;
}
