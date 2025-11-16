package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.PaymentRequest;
import com.catshop.catshop.dto.response.PaymentResponse;
import com.catshop.catshop.entity.Order;
import com.catshop.catshop.entity.Payment;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.PaymentMapper;
import com.catshop.catshop.repository.OrderRepository;
import com.catshop.catshop.repository.PaymentRepository;
import com.catshop.catshop.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;

    // CRUD ==============================
    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllOrderByDateDesc().stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID = " + request.getOrderId()));

        Payment payment = Payment.builder()
                .order(order)
                .method(request.getMethod())
                .amount(request.getAmount())
                .build();

        paymentRepository.save(payment);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public PaymentResponse updatePayment(Long id, PaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment ID = " + id));

        if (!payment.getOrder().getOrderId().equals(request.getOrderId())) {
            Order newOrder = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID = " + request.getOrderId()));
            payment.setOrder(newOrder);
        }

        payment.setMethod(request.getMethod());
        payment.setAmount(request.getAmount());
        paymentRepository.save(payment);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment ID = " + id));
        paymentRepository.delete(payment);
    }

    // FILTERS ============================
    @Override
    public List<PaymentResponse> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByMethod(String method) {
        return paymentRepository.findByMethodIgnoreCase(method).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByDateRange(LocalDateTime start, LocalDateTime end) {
        return paymentRepository.findByPaymentDateBetween(start, end).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByMinAmount(BigDecimal minAmount) {
        return paymentRepository.findByMinAmount(minAmount).stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    // STATISTICS =========================
    @Override
    public BigDecimal getTotalAmount() {
        return paymentRepository.getTotalPaymentAmount();
    }

    @Override
    public BigDecimal getTotalAmountByUser(Long userId) {
        return paymentRepository.getTotalPaymentAmountByUser(userId);
    }

    @Override
    public List<Object[]> getCountAndSumByMethod() {
        return paymentRepository.countAndSumByMethod();
    }

    // USER SECTION =======================
    @Override
    public List<PaymentResponse> getUserPayments(Long userId) {
        return getPaymentsByUserId(userId);
    }

    @Override
    public List<PaymentResponse> getUserPaymentsByMethod(Long userId, String method) {
        return paymentRepository.findByUserId(userId).stream()
                .filter(p -> p.getMethod().equalsIgnoreCase(method))
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getUserPaymentsByDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return paymentRepository.findByUserId(userId).stream()
                .filter(p -> !p.getPaymentDate().isBefore(start) && !p.getPaymentDate().isAfter(end))
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }
}
