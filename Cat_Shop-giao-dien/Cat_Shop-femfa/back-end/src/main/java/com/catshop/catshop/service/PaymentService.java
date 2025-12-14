package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.PaymentRequest;
import com.catshop.catshop.dto.response.PaymentResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentService {

    // CRUD
    List<PaymentResponse> getAllPayments();
    PaymentResponse createPayment(PaymentRequest request);
    PaymentResponse updatePayment(Long id, PaymentRequest request);
    void deletePayment(Long id);

    // FILTERS (Admin)
    List<PaymentResponse> getPaymentsByOrderId(Long orderId);
    List<PaymentResponse> getPaymentsByUserId(Long userId);
    List<PaymentResponse> getPaymentsByMethod(String method);
    List<PaymentResponse> getPaymentsByDateRange(LocalDateTime start, LocalDateTime end);
    List<PaymentResponse> getPaymentsByMinAmount(BigDecimal minAmount);

    // STATISTICS (Admin)
    BigDecimal getTotalAmount();
    BigDecimal getTotalAmountByUser(Long userId);
    List<Object[]> getCountAndSumByMethod();

    // USER SECTION
    List<PaymentResponse> getUserPayments(Long userId);
    List<PaymentResponse> getUserPaymentsByMethod(Long userId, String method);
    List<PaymentResponse> getUserPaymentsByDateRange(Long userId, LocalDateTime start, LocalDateTime end);
}
