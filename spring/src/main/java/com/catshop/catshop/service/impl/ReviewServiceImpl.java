package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.ReviewRequest;
import com.catshop.catshop.dto.response.ReviewResponse;
import com.catshop.catshop.entity.Product;
import com.catshop.catshop.entity.Review;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.ReviewMapper;
import com.catshop.catshop.repository.ProductRepository;
import com.catshop.catshop.repository.ReviewRepository;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse createReview(ReviewRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy userId: " + request.getUserId()));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy productId: " + request.getProductId()));

        // Kiểm tra đã đánh giá chưa
        boolean exists = reviewRepository.findByUser_UserId(user.getUserId())
                .stream()
                .anyMatch(r -> r.getProduct().getProductId().equals(product.getProductId()));
        if (exists) throw new BadRequestException("Bạn đã đánh giá sản phẩm này rồi!");

        Review review = reviewMapper.toEntity(request);
        review.setUser(user);
        review.setProduct(product);
        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy reviewId: " + reviewId));

        if (!review.getUser().getUserId().equals(request.getUserId()))
            throw new BadRequestException("Bạn không thể sửa review của người khác!");

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy reviewId: " + reviewId));
        reviewRepository.delete(review);
    }

    @Override
    public ReviewResponse getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy reviewId: " + reviewId));
        return reviewMapper.toResponse(review);
    }

    @Override
    public List<ReviewResponse> getReviewsByUser(Long userId) {
        return reviewMapper.toResponseList(reviewRepository.findByUser_UserId(userId));
    }

    @Override
    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        return reviewMapper.toResponseList(reviewRepository.findByProduct_ProductId(productId));
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewMapper.toResponseList(reviewRepository.findAllOrdered());
    }

    @Override
    public List<ReviewResponse> getLowRatingReviews() {
        return reviewMapper.toResponseList(reviewRepository.findLowRatingReviews());
    }

    @Override
    public List<ReviewResponse> getHighRatingReviews() {
        return reviewMapper.toResponseList(reviewRepository.findHighRatingReviews());
    }

    @Override
    public List<ReviewResponse> searchReviews(String keyword) {
        return reviewMapper.toResponseList(reviewRepository.searchByKeyword(keyword));
    }

    @Override
    public Double getAverageRating(Long productId) {
        Double avg = reviewRepository.averageRatingByProduct(productId);
        return avg != null ? avg : 0.0;
    }

    @Override
    public Long countReviewsByProduct(Long productId) {
        return reviewRepository.countByProduct(productId);
    }
}
