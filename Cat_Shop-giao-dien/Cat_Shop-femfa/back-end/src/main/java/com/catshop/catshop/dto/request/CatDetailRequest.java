package com.catshop.catshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatDetailRequest {

    @NotNull(message = "catId (product_id) không được để trống")
    private Long catId;

    @NotBlank(message = "breed (giống mèo) không được để trống")
    @Size(max = 100, message = "breed không được quá 100 ký tự")
    private String breed;

    @NotNull(message = "age không được để trống")
    @Min(value = 0, message = "age phải >= 0")
    @Max(value = 30, message = "age không hợp lệ (quá lớn)")
    private Integer age;

    @NotBlank(message = "gender không được để trống (Male/Female)")
    @Pattern(regexp = "Male|Female", message = "gender chỉ chấp nhận Male hoặc Female")
    private String gender;

    @NotNull(message = "vaccinated không được để trống (true/false)")
    private Boolean vaccinated;
}
