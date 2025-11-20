package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.request.CleaningDetailRequest;
import com.catshop.catshop.dto.response.CleaningDetailResponse;
import com.catshop.catshop.entity.CleaningDetail;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CleaningDetailMapper {

    @Mapping(target = "cleaningId", ignore = true) // ID lấy từ product
    @Mapping(target = "product", ignore = true)    // set sau trong service
    CleaningDetail toEntity(CleaningDetailRequest request);

    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.price", target = "price")
    @Mapping(source = "product.stockQuantity", target = "stockQuantity")
    @Mapping(source = "product.imageUrl", target = "imageUrl")
    @Mapping(source = "product.description", target = "description")
    @Mapping(source = "volumeMl", target = "volumeMl")
    @Mapping(source = "usage", target = "usage")
    CleaningDetailResponse toResponse(CleaningDetail cleaningDetail);

    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.price", target = "price")
    @Mapping(source = "product.stockQuantity", target = "stockQuantity")
    @Mapping(source = "product.imageUrl", target = "imageUrl")
    @Mapping(source = "product.description", target = "description")
    @Mapping(source = "volumeMl", target = "volumeMl")
    @Mapping(source = "usage", target = "usage")
    List<CleaningDetailResponse> toResponseList(List<CleaningDetail> list);
}
