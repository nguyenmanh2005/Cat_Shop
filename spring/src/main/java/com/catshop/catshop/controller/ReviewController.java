package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.ReviewRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.ReviewResponse;
import com.catshop.catshop.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // ================= CUSTOMER APIs =================

    // Tạo đánh giá
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@RequestBody ReviewRequest request) {
        ReviewResponse created = reviewService.createReview(request);
        return ResponseEntity.ok(ApiResponse.success(created, "Tạo đánh giá thành công"));
    }

    // Cập nhật đánh giá của chính mình
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest request) {
        ReviewResponse updated = reviewService.updateReview(reviewId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật đánh giá thành công"));
    }

    // Xóa đánh giá của chính mình
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa đánh giá thành công"));
    }

    // ================= PUBLIC APIs =================

    // Lấy tất cả review của 1 sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByProduct(@PathVariable Long productId) {
        List<ReviewResponse> list = reviewService.getReviewsByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách đánh giá theo sản phẩm"));
    }

    // Lấy tất cả review của 1 user
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByUser(@PathVariable Long userId) {
        List<ReviewResponse> list = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách đánh giá theo người dùng"));
    }

    // Lấy 1 review theo ID
    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long reviewId) {
        ReviewResponse review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(ApiResponse.success(review, "Chi tiết đánh giá"));
    }

    // Lấy trung bình rating của sản phẩm
    @GetMapping("/product/{productId}/average")
    public ResponseEntity<ApiResponse<Double>> getAverageRating(@PathVariable Long productId) {
        Double avg = reviewService.getAverageRating(productId);
        return ResponseEntity.ok(ApiResponse.success(avg, "Điểm trung bình của sản phẩm"));
    }

    // Đếm số lượng review của sản phẩm
    @GetMapping("/product/{productId}/count")
    public ResponseEntity<ApiResponse<Long>> countReviewsByProduct(@PathVariable Long productId) {
        Long count = reviewService.countReviewsByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(count, "Tổng số đánh giá của sản phẩm"));
    }

    // ================= ADMIN APIs =================

    // Xem toàn bộ review
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getAllReviews() {
        List<ReviewResponse> list = reviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách toàn bộ đánh giá"));
    }

    // Xem review có rating thấp (<=2)
    @GetMapping("/admin/low")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getLowRatingReviews() {
        List<ReviewResponse> list = reviewService.getLowRatingReviews();
        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách đánh giá thấp"));
    }

    // Xem review có rating cao (>=4)
    @GetMapping("/admin/high")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getHighRatingReviews() {
        List<ReviewResponse> list = reviewService.getHighRatingReviews();
        return ResponseEntity.ok(ApiResponse.success(list, "Danh sách đánh giá cao"));
    }

    // Tìm kiếm review theo từ khóa
    @GetMapping("/admin/search")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> searchReviews(@RequestParam String keyword) {
        List<ReviewResponse> list = reviewService.searchReviews(keyword);
        return ResponseEntity.ok(ApiResponse.success(list, "Kết quả tìm kiếm đánh giá theo từ khóa"));
    }
}
