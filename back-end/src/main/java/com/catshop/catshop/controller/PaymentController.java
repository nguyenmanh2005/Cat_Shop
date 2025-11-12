package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.PaymentRequest;
import com.catshop.catshop.dto.request.VietQrRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.PaymentResponse;
import com.catshop.catshop.dto.response.VietQrResponse;
import com.catshop.catshop.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // =================== ADMIN SECTION ===================

    @GetMapping("/all")
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        return ApiResponse.success(paymentService.getAllPayments(), "Lấy danh sách tất cả payment thành công");
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<List<PaymentResponse>> getByOrder(@PathVariable Long orderId) {
        return ApiResponse.success(paymentService.getPaymentsByOrderId(orderId), "Lấy payment theo orderId thành công");
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<PaymentResponse>> getByUser(@PathVariable Long userId) {
        return ApiResponse.success(paymentService.getPaymentsByUserId(userId), "Lấy payment theo userId thành công");
    }

    @GetMapping("/method/{method}")
    public ApiResponse<List<PaymentResponse>> getByMethod(@PathVariable String method) {
        return ApiResponse.success(paymentService.getPaymentsByMethod(method), "Lấy payment theo phương thức thành công");
    }

    @GetMapping("/date-range")
    public ApiResponse<List<PaymentResponse>> getByDateRange(@RequestParam LocalDateTime start,
                                                             @RequestParam LocalDateTime end) {
        return ApiResponse.success(paymentService.getPaymentsByDateRange(start, end), "Lấy payment theo khoảng thời gian thành công");
    }

    @GetMapping("/min-amount")
    public ApiResponse<List<PaymentResponse>> getByMinAmount(@RequestParam BigDecimal minAmount) {
        return ApiResponse.success(paymentService.getPaymentsByMinAmount(minAmount), "Lấy payment có số tiền lớn hơn " + minAmount);
    }

    @GetMapping("/total")
    public ApiResponse<BigDecimal> getTotal() {
        return ApiResponse.success(paymentService.getTotalAmount(), "Tổng tiền tất cả payment");
    }

    @GetMapping("/total/user/{userId}")
    public ApiResponse<BigDecimal> getTotalByUser(@PathVariable Long userId) {
        return ApiResponse.success(paymentService.getTotalAmountByUser(userId), "Tổng tiền theo user");
    }

    @GetMapping("/stats/method")
    public ApiResponse<List<Object[]>> getStatsByMethod() {
        return ApiResponse.success(paymentService.getCountAndSumByMethod(), "Thống kê payment theo phương thức");
    }

    // CRUD ===============================

    @PostMapping
    public ApiResponse<PaymentResponse> create(@Valid @RequestBody PaymentRequest request) {
        return ApiResponse.success(paymentService.createPayment(request), "Tạo payment thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<PaymentResponse> update(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return ApiResponse.success(paymentService.updatePayment(id, request), "Cập nhật payment thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ApiResponse.success("Đã xóa payment ID = " + id, "Xóa payment thành công");
    }

    // =================== USER SECTION ===================

    @GetMapping("/user/{userId}/all")
    public ApiResponse<List<PaymentResponse>> getUserPayments(@PathVariable Long userId) {
        return ApiResponse.success(paymentService.getUserPayments(userId), "Lấy tất cả payment của user");
    }

    @GetMapping("/user/{userId}/method/{method}")
    public ApiResponse<List<PaymentResponse>> getUserPaymentsByMethod(@PathVariable Long userId,
                                                                      @PathVariable String method) {
        return ApiResponse.success(paymentService.getUserPaymentsByMethod(userId, method),
                "Lấy payment theo phương thức của user");
    }

    @GetMapping("/user/{userId}/date-range")
    public ApiResponse<List<PaymentResponse>> getUserPaymentsByDateRange(@PathVariable Long userId,
                                                                         @RequestParam LocalDateTime start,
                                                                         @RequestParam LocalDateTime end) {
        return ApiResponse.success(paymentService.getUserPaymentsByDateRange(userId, start, end),
                "Lấy payment của user theo khoảng thời gian");
    }

    // =================== VIETQR ===================
    @PostMapping("/generate-vietqr")
    public ApiResponse<VietQrResponse> generateVietQr(@Valid @RequestBody VietQrRequest request) {
        return ApiResponse.success(paymentService.generateVietQr(request), "Tạo mã QR thanh toán thành công");
    }
}
