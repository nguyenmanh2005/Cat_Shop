package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.request.ReviewRequest;
import com.catshop.catshop.dto.response.ReviewResponse;
import com.catshop.catshop.entity.Review;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "product.productId", target = "productId")
    ReviewResponse toResponse(Review review);

    List<ReviewResponse> toResponseList(List<Review> reviews);

    @Mapping(target = "reviewId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "product", ignore = true)
    Review toEntity(ReviewRequest request);
}
