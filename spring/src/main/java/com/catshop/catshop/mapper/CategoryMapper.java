package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.response.CategoryResponse;
import com.catshop.catshop.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    // typeId khác hoàn toàn so biến typeid
    @Mapping(source = "productType.typeId", target = "typeId")
    CategoryResponse toResponse(Category category);

    @Mapping(source = "productType.typeId", target = "typeId")
    List<CategoryResponse> toResponseList(List<Category> categories);
}
