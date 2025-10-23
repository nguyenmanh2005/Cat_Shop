package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.ShipmentRequest;
import com.catshop.catshop.dto.response.ShipmentResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface ShipmentService {

    // ===============================
    // 👑 ADMIN SECTION
    // ===============================
    List<ShipmentResponse> findAllOrderByDateDesc();
    List<ShipmentResponse> findByStatus(String status);
    List<ShipmentResponse> searchByAddress(String address);
    List<ShipmentResponse> findByShippedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Object[]> countShipmentsByStatus();
    List<ShipmentResponse> findByOrderId(Long orderId);
    List<ShipmentResponse> findAllByUserId(Long userId);
    Long countShipmentsInCurrentMonth();

    // CRUD
    ShipmentResponse createShipment(ShipmentRequest request);
    ShipmentResponse updateShipment(Long id, ShipmentRequest request);
    void deleteShipment(Long id);

    // ===============================
    // 👤 USER SECTION
    // ===============================
    List<ShipmentResponse> findUserShipments(Long userId);
    List<ShipmentResponse> findUserShipmentsByStatus(Long userId, String status);
    List<ShipmentResponse> findUserShipmentsByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate);
    ShipmentResponse findUserShipmentDetail(Long shipmentId, Long userId);
}
