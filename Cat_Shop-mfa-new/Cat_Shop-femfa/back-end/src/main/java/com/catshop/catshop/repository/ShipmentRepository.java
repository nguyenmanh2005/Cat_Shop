package com.catshop.catshop.repository;

import com.catshop.catshop.entity.Shipment;
import com.catshop.catshop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    // ===============================
    // 🧭  PHẦN DÀNH CHO ADMIN
    // ===============================

    // 1️⃣ Lấy tất cả shipment, sắp xếp theo ngày giao mới nhất
    @Query("SELECT s FROM Shipment s ORDER BY s.shippedDate DESC")
    List<Shipment> findAllOrderByDateDesc();

    // 2️⃣ Lọc theo trạng thái (status)
    @Query("SELECT s FROM Shipment s WHERE s.status = :status ORDER BY s.shippedDate DESC")
    List<Shipment> findByStatus(@Param("status") String status);

    // 3️⃣ Tìm theo địa chỉ giao hàng (tìm gần đúng)
    @Query("SELECT s FROM Shipment s WHERE LOWER(s.shippingAddress) LIKE LOWER(CONCAT('%', :address, '%'))")
    List<Shipment> searchByAddress(@Param("address") String address);

    // 4️⃣ Lọc theo khoảng thời gian giao hàng
    @Query("SELECT s FROM Shipment s WHERE s.shippedDate BETWEEN :startDate AND :endDate ORDER BY s.shippedDate DESC")
    List<Shipment> findByShippedDateBetween(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    // 5️⃣ Thống kê: đếm số shipment theo trạng thái
    @Query("SELECT s.status, COUNT(s) FROM Shipment s GROUP BY s.status")
    List<Object[]> countShipmentsByStatus();

    // 6️⃣ Tìm shipment theo orderId
    @Query("SELECT s FROM Shipment s WHERE s.order.orderId = :orderId")
    List<Shipment> findByOrderId(@Param("orderId") Long orderId);

    // 7️⃣ Xem shipment theo userId (qua bảng Order)
    @Query("SELECT s FROM Shipment s WHERE s.order.user.userId = :userId ORDER BY s.shippedDate DESC")
    List<Shipment> findAllByUserId(@Param("userId") Long userId);

    // 8️⃣ Thống kê tổng số shipment trong tháng hiện tại
    @Query("SELECT COUNT(s) FROM Shipment s WHERE MONTH(s.shippedDate) = MONTH(CURRENT_DATE) AND YEAR(s.shippedDate) = YEAR(CURRENT_DATE)")
    Long countShipmentsInCurrentMonth();

    // ===============================
    // 👤  PHẦN DÀNH CHO USER
    // ===============================

    // 9️⃣ Lấy tất cả shipment của 1 user
    @Query("SELECT s FROM Shipment s WHERE s.order.user.userId = :userId ORDER BY s.shippedDate DESC")
    List<Shipment> findUserShipments(@Param("userId") Long userId);

    // 🔟 Lọc shipment của user theo trạng thái
    @Query("SELECT s FROM Shipment s WHERE s.order.user.userId = :userId AND s.status = :status ORDER BY s.shippedDate DESC")
    List<Shipment> findUserShipmentsByStatus(@Param("userId") Long userId, @Param("status") String status);

    // 11️⃣ Tìm shipment của user theo khoảng thời gian
    @Query("SELECT s FROM Shipment s WHERE s.order.user.userId = :userId AND s.shippedDate BETWEEN :startDate AND :endDate")
    List<Shipment> findUserShipmentsByDateRange(@Param("userId") Long userId,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    // 12️⃣ Xem chi tiết 1 shipment của user (đảm bảo không xem đơn của người khác)
    @Query("SELECT s FROM Shipment s WHERE s.shipmentId = :shipmentId AND s.order.user.userId = :userId")
    Shipment findUserShipmentDetail(@Param("shipmentId") Long shipmentId, @Param("userId") Long userId);
}
