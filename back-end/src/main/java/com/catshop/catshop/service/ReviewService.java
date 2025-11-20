package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.ReviewRequest;
import com.catshop.catshop.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    // Customer
    ReviewResponse createReview(ReviewRequest request);
    ReviewResponse updateReview(Long reviewId, ReviewRequest request);
    void deleteReview(Long reviewId);
    ReviewResponse getReviewById(Long reviewId);
    List<ReviewResponse> getReviewsByUser(Long userId);
    List<ReviewResponse> getReviewsByProduct(Long productId);

    // Admin
    List<ReviewResponse> getAllReviews();
    List<ReviewResponse> getLowRatingReviews();
    List<ReviewResponse> getHighRatingReviews();
    List<ReviewResponse> searchReviews(String keyword);
    Double getAverageRating(Long productId);
    Long countReviewsByProduct(Long productId);
}
