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
    @Mapping(source = "productId", target = "productId")
    @Mapping(source = "productType.typeName", target = "typeName")
    @Mapping(source = "category.categoryId", target = "categoryId")
    @Mapping(source = "category.categoryName", target = "categoryName")
    ProductResponse toDto(Product product);

    // ✅ List<Entity> -> List<DTO>
    // MapStruct sẽ tự động sử dụng mapping của toDto() cho từng element trong List
    List<ProductResponse> toDtoList(List<Product> products);

    // ✅ Request -> Entity
    Product toEntity(ProductRequest productRequest);
}
