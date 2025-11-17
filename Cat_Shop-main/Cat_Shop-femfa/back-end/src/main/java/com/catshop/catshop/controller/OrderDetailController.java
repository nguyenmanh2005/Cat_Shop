package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.OrderDetailRequest;
import com.catshop.catshop.dto.response.*;
import com.catshop.catshop.service.OrderDetailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/order-details")
@RequiredArgsConstructor
public class OrderDetailController {

    private final OrderDetailService orderDetailService;

    // ✅ Admin + Customer: lấy danh sách chi tiết theo orderId
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<OrderDetailResponse>>> getByOrder(@PathVariable Long orderId) {
        List<OrderDetailResponse> details = orderDetailService.getOrderDetailsByOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(details, "Lấy danh sách chi tiết đơn hàng thành công"));
    }

    @GetMapping()
    public ResponseEntity<ApiResponse<List<OrderDetailResponse>>> getAllProduct() {
        List<OrderDetailResponse> details = orderDetailService.getAllOrder();
        return ResponseEntity.ok(ApiResponse.success(details, "Lấy danh sách chi tiết theo sản phẩm thành công"));
    }

    // ✅ Admin: lấy chi tiết theo product
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<OrderDetailResponse>>> getByProduct(@PathVariable Long productId) {
        List<OrderDetailResponse> details = orderDetailService.getOrderDetailsByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(details, "Lấy danh sách chi tiết theo sản phẩm thành công"));
    }

    // ✅ Admin: tạo chi tiết đơn hàng mới
    @PostMapping
    public ResponseEntity<ApiResponse<OrderDetailResponse>> create(@Valid @RequestBody OrderDetailRequest request) {
        OrderDetailResponse response = orderDetailService.createOrderDetail(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Tạo chi tiết đơn hàng thành công"));
    }

    // ✅ Admin: cập nhật chi tiết
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> update(@PathVariable Long id,
                                                                   @Valid @RequestBody OrderDetailRequest request) {
        OrderDetailResponse response = orderDetailService.updateOrderDetail(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật chi tiết đơn hàng thành công"));
    }

    // ✅ Admin: xóa chi tiết
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        orderDetailService.deleteOrderDetail(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa chi tiết đơn hàng thành công"));
    }

    // ✅ Admin: tổng doanh thu toàn hệ thống
    @GetMapping("/admin/revenue")
    public ResponseEntity<ApiResponse<Double>> getTotalRevenue() {
        Double revenue = orderDetailService.getTotalRevenue();
        return ResponseEntity.ok(ApiResponse.success(revenue, "Tổng doanh thu toàn hệ thống"));
    }

    // ✅ Customer: tổng tiền của đơn hàng
    @GetMapping("/order/{orderId}/total")
    public ResponseEntity<ApiResponse<Double>> getOrderTotal(@PathVariable Long orderId) {
        Double total = orderDetailService.getOrderTotal(orderId);
        return ResponseEntity.ok(ApiResponse.success(total, "Tổng tiền của đơn hàng"));
    }

    // ✅ Lấy chi tiết theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getById(@PathVariable Long id) {
        OrderDetailResponse response = orderDetailService.getOrderDetailById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết đơn hàng thành công"));
    }
}
