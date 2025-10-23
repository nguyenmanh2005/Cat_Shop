package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.ShipmentRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.ShipmentResponse;
import com.catshop.catshop.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    // ===============================
    // 👑 ADMIN SECTION
    // ===============================

    // 🟢 Lấy tất cả shipment (mới nhất trước)
    @GetMapping("/admin/all")
    public ApiResponse<List<ShipmentResponse>> getAllShipments() {
        return ApiResponse.success(
                shipmentService.findAllOrderByDateDesc(),
                "Lấy danh sách shipment thành công"
        );
    }

    // 🟢 Lọc shipment theo trạng thái (status)
    @GetMapping("/admin/status/{status}")
    public ApiResponse<List<ShipmentResponse>> getShipmentsByStatus(@PathVariable String status) {
        return ApiResponse.success(
                shipmentService.findByStatus(status),
                "Lọc shipment theo trạng thái thành công"
        );
    }

    // 🟢 Tìm shipment theo địa chỉ giao hàng
    @GetMapping("/admin/address")
    public ApiResponse<List<ShipmentResponse>> searchByAddress(@RequestParam String address) {
        return ApiResponse.success(
                shipmentService.searchByAddress(address),
                "Tìm shipment theo địa chỉ thành công"
        );
    }

    // 🟢 Lấy shipment trong khoảng ngày giao hàng
    @GetMapping("/admin/date-range")
    public ApiResponse<List<ShipmentResponse>> getShipmentsByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        return ApiResponse.success(
                shipmentService.findByShippedDateBetween(startDate, endDate),
                "Lấy shipment trong khoảng ngày thành công"
        );
    }

    // 🟢 Thống kê số lượng shipment theo trạng thái
    @GetMapping("/admin/count-by-status")
    public ApiResponse<List<Object[]>> countShipmentsByStatus() {
        return ApiResponse.success(
                shipmentService.countShipmentsByStatus(),
                "Thống kê shipment theo trạng thái thành công"
        );
    }

    // 🟢 Lấy shipment theo orderId
    @GetMapping("/admin/order/{orderId}")
    public ApiResponse<List<ShipmentResponse>> getShipmentsByOrderId(@PathVariable Long orderId) {
        return ApiResponse.success(
                shipmentService.findByOrderId(orderId),
                "Lấy shipment theo OrderId thành công"
        );
    }

    // 🟢 Lấy shipment theo userId
    @GetMapping("/admin/user/{userId}")
    public ApiResponse<List<ShipmentResponse>> getShipmentsByUserId(@PathVariable Long userId) {
        return ApiResponse.success(
                shipmentService.findAllByUserId(userId),
                "Lấy shipment theo UserId thành công"
        );
    }

    // 🟢 Đếm số shipment trong tháng hiện tại
    @GetMapping("/admin/count-month")
    public ApiResponse<Long> countShipmentsInCurrentMonth() {
        return ApiResponse.success(
                shipmentService.countShipmentsInCurrentMonth(),
                "Đếm số shipment trong tháng hiện tại thành công"
        );
    }

    // 🟢 Tạo shipment mới
    @PostMapping("/admin/create")
    public ApiResponse<ShipmentResponse> createShipment(@Valid @RequestBody ShipmentRequest request) {
        return ApiResponse.success(
                shipmentService.createShipment(request),
                "Tạo shipment mới thành công"
        );
    }

    // 🟡 Cập nhật shipment
    @PutMapping("/admin/update/{id}")
    public ApiResponse<ShipmentResponse> updateShipment(
            @PathVariable Long id,
            @Valid @RequestBody ShipmentRequest request) {
        return ApiResponse.success(
                shipmentService.updateShipment(id, request),
                "Cập nhật shipment thành công"
        );
    }

    //  Xóa shipment
    @DeleteMapping("/admin/delete/{id}")
    public ApiResponse<String> deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return ApiResponse.success(
                "Đã xóa shipment có ID = " + id,
                "Xóa shipment thành công"
        );
    }

    // ===============================
    // 👤 USER SECTION
    // ===============================

    // 🟢 Lấy tất cả shipment của user
    @GetMapping("/user/{userId}/all")
    public ApiResponse<List<ShipmentResponse>> getUserShipments(@PathVariable Long userId) {
        return ApiResponse.success(
                shipmentService.findUserShipments(userId),
                "Lấy danh sách shipment của user thành công"
        );
    }

    // 🟢 Lọc shipment theo status của user
    @GetMapping("/user/{userId}/status/{status}")
    public ApiResponse<List<ShipmentResponse>> getUserShipmentsByStatus(
            @PathVariable Long userId,
            @PathVariable String status) {
        return ApiResponse.success(
                shipmentService.findUserShipmentsByStatus(userId, status),
                "Lọc shipment của user theo trạng thái thành công"
        );
    }

    // 🟢 Lọc shipment theo khoảng thời gian của user
    @GetMapping("/user/{userId}/date-range")
    public ApiResponse<List<ShipmentResponse>> getUserShipmentsByDateRange(
            @PathVariable Long userId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        return ApiResponse.success(
                shipmentService.findUserShipmentsByDateRange(userId, startDate, endDate),
                "Lấy shipment của user theo khoảng thời gian thành công"
        );
    }

    // 🟢 Xem chi tiết shipment cụ thể của user
    @GetMapping("/user/{userId}/detail/{shipmentId}")
    public ApiResponse<ShipmentResponse> getUserShipmentDetail(
            @PathVariable Long shipmentId,
            @PathVariable Long userId) {
        return ApiResponse.success(
                shipmentService.findUserShipmentDetail(shipmentId, userId),
                "Lấy chi tiết shipment thành công"
        );
    }
}
