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
    @Mapping(source = "productType.typeId", target = "typeId")
    @Mapping(source = "productType.typeName", target = "typeName", defaultValue = "")
    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.categoryName", target = "categoryName", defaultValue = "")
    ProductResponse toDto(Product product);

    // ✅ List<Entity> -> List<DTO>
    @Mapping(source = "productType.typeId", target = "typeId")
    @Mapping(source = "productType.typeName", target = "typeName", defaultValue = "")
    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.categoryName", target = "categoryName", defaultValue = "")
    List<ProductResponse> toDtoList(List<Product> products);

    // ✅ Request -> Entity
    Product toEntity(ProductRequest productRequest);
}
