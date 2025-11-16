package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.response.PaymentResponse;
import com.catshop.catshop.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(source = "order.orderId",target = "orderId")
    PaymentResponse toPaymentResponse(Payment payment);

    @Mapping(source = "order.orderId",target = "orderId")
    List<PaymentResponse> toPaymentResponseList(List<Payment> payment);
}
