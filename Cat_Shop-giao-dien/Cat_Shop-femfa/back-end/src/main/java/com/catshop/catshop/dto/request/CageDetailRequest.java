package com.catshop.catshop.dto.request;

import jakarta.validation.constraints.*;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CageDetailRequest {

    @NotNull(message = "Product ID không được để trống")
    private Long productId;

    @NotBlank(message = "Material không được để trống")
    @Size(max = 100, message = "Material tối đa 100 ký tự")
    private String material;

    @NotBlank(message = "Dimensions không được để trống")
    @Size(max = 50, message = "Dimensions tối đa 50 ký tự")
    private String dimensions;
}
