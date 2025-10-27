package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.request.ProductRequest;
import com.catshop.catshop.dto.response.ProductResponse;
import com.catshop.catshop.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // ✅ Entity -> DTO (Response)
    @Mapping(source = "productType.typeId", target = "typeId")
    @Mapping(source = "productType.typeName", target = "typeName")
    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.categoryName", target = "categoryName")
    ProductResponse toDto(Product product);

    // ✅ List<Entity> -> List<DTO>
    @Mapping(source = "productType.typeId", target = "typeId")
    @Mapping(source = "productType.typeName", target = "typeName")
    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.categoryName", target = "categoryName")
    List<ProductResponse> toDtoList(List<Product> products);

    // ✅ Request -> Entity
    Product toEntity(ProductRequest productRequest);
}
