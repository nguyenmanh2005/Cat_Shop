package com.catshop.catshop.repository;

import com.catshop.catshop.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Lấy tất cả
    @Query("SELECT p FROM Payment p ORDER BY p.paymentDate DESC")
    List<Payment> findAllOrderByDateDesc();

    // Theo orderId
    @Query("SELECT p FROM Payment p WHERE p.order.orderId = :orderId ORDER BY p.paymentDate DESC")
    List<Payment> findByOrderId(Long orderId);

    // Theo userId
    @Query("SELECT p FROM Payment p WHERE p.order.user.userId = :userId ORDER BY p.paymentDate DESC")
    List<Payment> findByUserId(Long userId);

    // Theo phương thức
    List<Payment> findByMethodIgnoreCase(String method);

    // Theo khoảng thời gian
    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :start AND :end ORDER BY p.paymentDate DESC")
    List<Payment> findByPaymentDateBetween(LocalDateTime start, LocalDateTime end);

    // Theo số tiền lớn hơn giá trị
    @Query("SELECT p FROM Payment p WHERE p.amount >= :minAmount ORDER BY p.amount DESC")
    List<Payment> findByMinAmount(BigDecimal minAmount);

    // Tổng số tiền tất cả payment
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p")
    BigDecimal getTotalPaymentAmount();

    // Tổng tiền theo user
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.order.user.userId = :userId")
    BigDecimal getTotalPaymentAmountByUser(Long userId);

    // Thống kê theo method
    @Query("SELECT p.method, COUNT(p), SUM(p.amount) FROM Payment p GROUP BY p.method")
    List<Object[]> countAndSumByMethod();
}
