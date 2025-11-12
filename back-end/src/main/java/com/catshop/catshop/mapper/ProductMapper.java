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
    @Mapping(source = "productType.typeId", target = "typeId")
    @Mapping(source = "productType.typeName", target = "typeName")
    @Mapping(source = "category.categoryId", target = "categoryId", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    @Mapping(source = "category.categoryName", target = "categoryName", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    ProductResponse toDto(Product product);

    // ✅ List<Entity> -> List<DTO>
    @Mapping(source = "productType.typeId", target = "typeId")
    @Mapping(source = "productType.typeName", target = "typeName")
    @Mapping(source = "category.categoryId", target = "categoryId", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    @Mapping(source = "category.categoryName", target = "categoryName", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    List<ProductResponse> toDtoList(List<Product> products);

    // ✅ Request -> Entity
    Product toEntity(ProductRequest productRequest);
}
