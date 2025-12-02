package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.request.CageDetailRequest;
import com.catshop.catshop.dto.response.CageDetailResponse;
import com.catshop.catshop.entity.CageDetail;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CageDetailMapper {

    @Mapping(target = "cageId", ignore = true) // ID sẽ lấy từ product
    @Mapping(target = "product", ignore = true) // set sau
    CageDetail toEntity(CageDetailRequest request);

    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.price", target = "price")
    @Mapping(source = "product.stockQuantity", target = "stockQuantity")
    @Mapping(source = "product.imageUrl", target = "imageUrl")
    @Mapping(source = "product.description", target = "description")
    CageDetailResponse toResponse(CageDetail cageDetail);


    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.price", target = "price")
    @Mapping(source = "product.stockQuantity", target = "stockQuantity")
    @Mapping(source = "product.imageUrl", target = "imageUrl")
    @Mapping(source = "product.description", target = "description")
    List<CageDetailResponse> toResponseList(List<CageDetail> list);
}
