package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.request.OrderDetailRequest;
import com.catshop.catshop.dto.response.OrderDetailResponse;
import com.catshop.catshop.entity.OrderDetail;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderDetailMapper {

    @Mapping(source = "order.orderId", target = "orderId")
    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    OrderDetailResponse toResponse(OrderDetail orderDetail);

    List<OrderDetailResponse> toResponseList(List<OrderDetail> orderDetails);

    // Map từ request sang entity
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "product", ignore = true)
    OrderDetail toEntity(OrderDetailRequest request);
}
