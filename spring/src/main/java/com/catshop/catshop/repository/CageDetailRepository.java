package com.catshop.catshop.repository;

import com.catshop.catshop.entity.CageDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CageDetailRepository extends JpaRepository<CageDetail, Long> {

    // ADMIN: page tất cả (bao gồm hết hàng)
    @Query("SELECT c FROM CageDetail c")
    Page<CageDetail> findAllForAdmin(Pageable pageable);

    // CUSTOMER: chỉ sản phẩm còn hàng
    @Query("SELECT c FROM CageDetail c WHERE c.product.stockQuantity > 0")
    Page<CageDetail> findAllForCustomer(Pageable pageable);

    // Check tồn tại CageDetail theo productId
    boolean existsByProduct_ProductId(Long productId);

    // Lấy CageDetail theo productId
    Optional<CageDetail> findByProduct_ProductId(Long productId);
}
