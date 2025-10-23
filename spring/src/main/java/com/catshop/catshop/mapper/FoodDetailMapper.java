package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.request.FoodDetailRequest;
import com.catshop.catshop.dto.response.FoodDetailResponse;
import com.catshop.catshop.entity.FoodDetail;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FoodDetailMapper {

    @Mapping(target = "product", ignore = true) // sẽ set product trong service
    FoodDetail toEntity(FoodDetailRequest request);

    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.price", target = "price")
    @Mapping(source = "product.stockQuantity", target = "stockQuantity")
    @Mapping(source = "product.imageUrl", target = "imageUrl")
    @Mapping(source = "product.description", target = "description")
    FoodDetailResponse toResponse(FoodDetail entity);

    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.price", target = "price")
    @Mapping(source = "product.stockQuantity", target = "stockQuantity")
    @Mapping(source = "product.imageUrl", target = "imageUrl")
    @Mapping(source = "product.description", target = "description")
    List<FoodDetailResponse> toFoodDetailResponseList(List<FoodDetail> entityList);
}
