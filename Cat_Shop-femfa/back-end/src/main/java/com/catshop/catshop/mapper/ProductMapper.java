package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.request.ProductRequest;
import com.catshop.catshop.dto.response.ProductResponse;
import com.catshop.catshop.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProductMapper {

    // ✅ Entity -> DTO (Response)
    @Mapping(source = "productId", target = "productId")
    @Mapping(source = "productType.typeName", target = "typeName", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    @Mapping(source = "category.categoryId", target = "categoryId", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    @Mapping(source = "category.categoryName", target = "categoryName", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    ProductResponse toDto(Product product);

    // ✅ List<Entity> -> List<DTO>
    // MapStruct sẽ tự động sử dụng mapping của toDto() cho từng element trong List
    List<ProductResponse> toDtoList(List<Product> products);

    // ✅ Request -> Entity
    Product toEntity(ProductRequest productRequest);
}
