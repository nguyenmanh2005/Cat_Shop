package com.catshop.catshop.repository;

import com.catshop.catshop.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    // ✅ Lấy toàn bộ chi tiết đơn hàng theo order_id (Customer xem chi tiết đơn hàng của mình)
    List<OrderDetail> findByOrder_OrderId(Long orderId);

    // ✅ Lấy danh sách chi tiết theo product_id (Admin có thể thống kê sản phẩm)
    List<OrderDetail> findByProduct_ProductId(Long productId);

    // ✅ Kiểm tra chi tiết có tồn tại trong 1 đơn hàng cụ thể (phục vụ khi update/delete)
    Optional<OrderDetail> findByOrder_OrderIdAndOrderDetailId(Long orderId, Long orderDetailId);

    // ✅ Admin: thống kê tổng doanh thu theo sản phẩm
    @Query("SELECT od.product.productName, SUM(od.price * od.quantity) FROM OrderDetail od GROUP BY od.product.productName")
    List<Object[]> getRevenueByProduct();

    // ✅ Admin: tổng doanh thu tất cả đơn hàng
    @Query("SELECT SUM(od.price * od.quantity) FROM OrderDetail od")
    Double getTotalRevenue();

    // ✅ Customer: tổng tiền trong đơn hàng
    @Query("SELECT SUM(od.price * od.quantity) FROM OrderDetail od WHERE od.order.orderId = :orderId")
    Double getOrderTotal(Long orderId);
}
