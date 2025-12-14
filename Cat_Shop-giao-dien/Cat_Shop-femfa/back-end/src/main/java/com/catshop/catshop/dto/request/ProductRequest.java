package com.catshop.catshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Product name cannot be empty")
    @Size(max = 100, message = "Product name must be at most 100 characters")
    private String productName;

    @NotNull(message = "Type ID cannot be null")
    private Long typeId;

    private Long categoryId;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity = 0;

    private String description;

    @Size(max = 255, message = "Image URL must be at most 255 characters")
    private String imageUrl;
}
