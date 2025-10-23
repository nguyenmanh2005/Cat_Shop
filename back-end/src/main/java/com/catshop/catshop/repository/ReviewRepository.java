package com.catshop.catshop.repository;

import com.catshop.catshop.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Customer
    List<Review> findByUser_UserId(Long userId);
    List<Review> findByProduct_ProductId(Long productId);

    // Admin: thống kê & lọc
    @Query("SELECT r FROM Review r WHERE r.rating <= 2 ORDER BY r.createdAt DESC")
    List<Review> findLowRatingReviews();

    @Query("SELECT r FROM Review r WHERE r.rating = 5 ORDER BY r.createdAt DESC")
    List<Review> findHighRatingReviews();

    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findAllOrdered();

    @Query("SELECT r FROM Review r WHERE LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Review> searchByKeyword(String keyword);

    // Đếm số lượng review theo product
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.productId = :productId")
    long countByProduct(Long productId);

    // Tính trung bình rating của sản phẩm
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId")
    Double averageRatingByProduct(Long productId);
}
