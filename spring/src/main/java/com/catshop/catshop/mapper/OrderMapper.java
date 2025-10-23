package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.response.OrderResponse;
import com.catshop.catshop.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    @Mapping(source = "user.userId", target = "userId")
    OrderResponse toOrderResponse(Order order);

    @Mapping(source = "user.userId", target = "userId")
    List<OrderResponse> toOrderResponseList(List<Order> orders);
}
