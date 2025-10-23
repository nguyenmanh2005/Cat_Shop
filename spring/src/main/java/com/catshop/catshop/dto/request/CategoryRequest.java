package com.catshop.catshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "Category name cannot be empty")
    @Size(max = 100, message = "Category name must be at most 100 characters")
    private String categoryName;
    private String description;

    @NotNull(message = "Type ID cannot be null")
    private Long typeId;
}
