package com.catshop.catshop.mapper;
import com.catshop.catshop.dto.response.CatDetailResponse;
import com.catshop.catshop.entity.CatDetails;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CatDetailMapper {

    @Mapping(source = "catDetails.product.productId", target = "productId")
    @Mapping(source = "catDetails.product.productName", target = "productName")
    @Mapping(source = "catDetails.product.price", target = "price")
    @Mapping(source = "catDetails.product.stockQuantity", target = "stockQuantity")
    @Mapping(source = "catDetails.product.imageUrl", target = "imageUrl")
    @Mapping(source = "catDetails.product.description", target = "description")
    CatDetailResponse toCatDetailResponse(CatDetails catDetails);
}
