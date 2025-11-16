package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.OrderRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.OrderResponse;
import com.catshop.catshop.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ------------------ CUSTOMER APIs ------------------

    @GetMapping("/user/{userId}")
    public ApiResponse<List<OrderResponse>> getOrdersByUserId(@PathVariable Long userId) {
        return ApiResponse.success(orderService.findAllByUserId(userId),
                "Lấy danh sách đơn hàng của user thành công");
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ApiResponse<List<OrderResponse>> getOrdersByStatus(
            @PathVariable Long userId,
            @PathVariable String status) {
        return ApiResponse.success(orderService.findByUserAndStatus(userId, status),
                "Lấy danh sách đơn hàng theo trạng thái thành công");
    }

    @GetMapping("/user/{userId}/monthly-spending")
    public ApiResponse<List<Object[]>> getMonthlySpending(@PathVariable Long userId) {
        return ApiResponse.success(orderService.getMonthlySpending(userId),
                "Thống kê chi tiêu hàng tháng của user");
    }

    @GetMapping("/user/email/{email}")
    public ApiResponse<List<OrderResponse>> getOrdersByEmail(@PathVariable String email) {
        return ApiResponse.success(orderService.findOrdersByUserEmail(email),
                "Lấy đơn hàng theo email thành công");
    }

    // ------------------ ADMIN APIs ------------------

    @GetMapping("/admin/all")
    public ApiResponse<List<OrderResponse>> getAllOrdersForAdmin() {
        return ApiResponse.success(orderService.findAllOrdersForAdmin(),
                "Lấy danh sách toàn bộ đơn hàng thành công");
    }

    @GetMapping("/admin/status-count")
    public ApiResponse<List<Object[]>> countOrdersByStatus() {
        return ApiResponse.success(orderService.countOrdersByStatus(),
                "Thống kê số lượng đơn hàng theo trạng thái");
    }

    @GetMapping("/admin/monthly-revenue")
    public ApiResponse<List<Object[]>> getMonthlyRevenue() {
        return ApiResponse.success(orderService.getMonthlyRevenue(),
                "Thống kê doanh thu hàng tháng thành công");
    }

    // POST: tạo order
    @PostMapping
    public ApiResponse<OrderResponse> createOrder(@RequestBody @Valid OrderRequest request) {
        return ApiResponse.success(orderService.createOrder(request), "Tạo đơn hàng thành công");
    }

    // PUT: cập nhật order
    @PutMapping("/{orderId}")
    public ApiResponse<OrderResponse> updateOrder(@PathVariable Long orderId,
                                                  @RequestBody @Valid OrderRequest request) {
        return ApiResponse.success(orderService.updateOrder(orderId, request), "Cập nhật đơn hàng thành công");
    }

    // DELETE: xóa order
    @DeleteMapping("/{orderId}")
    public ApiResponse<String> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ApiResponse.success(null, "Xóa đơn hàng thành công");
    }

}
