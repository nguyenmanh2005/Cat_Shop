package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.OrderRequest;
import com.catshop.catshop.dto.response.OrderResponse;
import java.util.List;

public interface OrderService {

    // Customer APIs
    List<OrderResponse> findAllByUserId(Long userId);
    List<OrderResponse> findByUserAndStatus(Long userId, String status);
    List<Object[]> getMonthlySpending(Long userId);
    List<OrderResponse> findOrdersByUserEmail(String email);

    // Admin APIs
    List<OrderResponse> findAllOrdersForAdmin();
    List<Object[]> countOrdersByStatus();
    List<Object[]> getMonthlyRevenue();

    // Thêm vào interface
    OrderResponse createOrder(OrderRequest orderRequest);
    OrderResponse updateOrder(Long orderId, OrderRequest orderRequest);
    void deleteOrder(Long orderId);

}
