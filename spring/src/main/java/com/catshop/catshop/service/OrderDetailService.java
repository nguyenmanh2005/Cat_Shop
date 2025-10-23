package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.OrderDetailRequest;
import com.catshop.catshop.dto.response.OrderDetailResponse;
import java.util.List;

public interface OrderDetailService {

    OrderDetailResponse createOrderDetail(OrderDetailRequest request);

    OrderDetailResponse updateOrderDetail(Long id, OrderDetailRequest request);

    void deleteOrderDetail(Long id);

    List<OrderDetailResponse> getAllOrder();

    OrderDetailResponse getOrderDetailById(Long id);

    List<OrderDetailResponse> getOrderDetailsByOrder(Long orderId);

    List<OrderDetailResponse> getOrderDetailsByProduct(Long productId);

    Double getOrderTotal(Long orderId);

    Double getTotalRevenue(); // Admin thống kê doanh thu
}
