package com.catshop.catshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {

    @NotNull(message = "userId không được để trống")
    private Long userId;

    @NotNull(message = "productId không được để trống")
    private Long productId;

    @NotNull(message = "Rating không được để trống")
    @Min(value = 1, message = "Rating tối thiểu là 1")
    @Max(value = 5, message = "Rating tối đa là 5")
    private Integer rating;

    @Size(max = 1000, message = "Bình luận tối đa 1000 ký tự")
    private String comment;
}
