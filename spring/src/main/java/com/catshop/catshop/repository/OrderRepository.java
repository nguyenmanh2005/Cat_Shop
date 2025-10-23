package com.catshop.catshop.repository;

import com.catshop.catshop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Customer
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.orderDate DESC")
    List<Order> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    List<Order> findByUserAndStatus(@Param("userId") Long userId, @Param("status") String status);

    @Query(value = """
        SELECT DATE_TRUNC('month', order_date) AS month, SUM(total_amount) AS total
        FROM orders
        WHERE user_id = :userId
        GROUP BY month ORDER BY month
    """, nativeQuery = true)
    List<Object[]> getMonthlySpending(@Param("userId") Long userId);


    // Admin
    @Query(value = "SELECT * FROM orders ORDER BY order_date DESC", nativeQuery = true)
    List<Order> findAllOrdersForAdmin();

    @Query(value = "SELECT status, COUNT(*) FROM orders GROUP BY status", nativeQuery = true)
    List<Object[]> countOrdersByStatus();

    @Query(value = """
        SELECT DATE_TRUNC('month', order_date) AS month, SUM(total_amount) 
        FROM orders GROUP BY month ORDER BY month
    """, nativeQuery = true)
    List<Object[]> getMonthlyRevenue();

    @Query(value = """
        SELECT o.* FROM orders o 
        JOIN users u ON o.user_id = u.user_id 
        WHERE u.email = :email
    """, nativeQuery = true)
    List<Order> findOrdersByUserEmail(@Param("email") String email);
}
