package com.catshop.catshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentRequest {

    @NotNull(message = "OrderId không được để trống")
    private Long orderId;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;

    @NotBlank(message = "Trạng thái giao hàng không được để trống")
    private String status;
}
