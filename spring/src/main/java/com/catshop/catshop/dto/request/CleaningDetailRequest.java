package com.catshop.catshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CleaningDetailRequest {

    @NotNull(message = "Product ID không được để trống")
    private Long productId;

    @NotNull(message = "Volume (ml) không được để trống")
    @Min(value = 1, message = "Volume phải lớn hơn 0ml")
    private Integer volumeMl;

    @NotBlank(message = "Usage không được để trống")
    private String usage;
}
