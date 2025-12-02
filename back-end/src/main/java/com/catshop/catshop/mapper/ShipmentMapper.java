package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.response.ShipmentResponse;
import com.catshop.catshop.entity.Order;
import com.catshop.catshop.entity.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ShipmentMapper {
    @Mapping(source = "order.orderId",target = "orderId")
    ShipmentResponse toShipmentResponse(Shipment shipment);

    @Mapping(source = "order.orderId",target = "orderId")
    List<ShipmentResponse> toShipmentResponseList(List<Shipment> shipments);
}
