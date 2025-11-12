package com.catshop.catshop.repository;

import com.catshop.catshop.entity.Product;
import com.catshop.catshop.entity.ProductType;
import com.catshop.catshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ✅ Kiểm tra trùng tên sản phẩm
    boolean existsByProductName(String productName);

    // ✅ ADMIN - lấy tất cả sản phẩm theo loại (ProductType)
    List<Product> findByProductType(ProductType productType);

    // ✅ ADMIN - lấy tất cả sản phẩm theo Category
    List<Product> findByCategory(Category category);

    // ✅ ADMIN - tìm theo khoảng giá
    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // ✅ ADMIN - tìm sản phẩm có stock = 0 (hết hàng)
    List<Product> findByStockQuantityEquals(int stock);

    // ✅ ADMIN - tìm sản phẩm có tồn kho ít hơn X
    List<Product> findByStockQuantityLessThan(int limit);

    // ✅ ADMIN - tìm sản phẩm theo tên gần đúng
    List<Product> findByProductNameContainingIgnoreCase(String keyword);

    // ✅ CUSTOMER - lấy sản phẩm còn hàng và có ProductType hợp lệ
    @Query("SELECT p FROM Product p WHERE p.stockQuantity > 0 AND p.productType IS NOT NULL")
    List<Product> findAllAvailableProducts();

    // ✅ CUSTOMER - lấy sản phẩm theo loại (chỉ sản phẩm còn hàng và có ProductType hợp lệ)
    @Query("SELECT p FROM Product p WHERE p.productType IS NOT NULL AND p.productType.typeId = :typeId AND p.stockQuantity > 0")
    List<Product> findAvailableProductsByTypeId(Long typeId);

    // ✅ CUSTOMER - lấy sản phẩm theo category (chỉ còn hàng và có ProductType hợp lệ)
    @Query("SELECT p FROM Product p WHERE p.productType IS NOT NULL AND p.category.categoryId = :categoryId AND p.stockQuantity > 0")
    List<Product> findAvailableProductsByCategoryId(Long categoryId);

    // ✅ CUSTOMER - tìm sản phẩm có giá nhỏ hơn X (có ProductType hợp lệ)
    @Query("SELECT p FROM Product p WHERE p.productType IS NOT NULL AND p.stockQuantity > 0 AND p.price <= :priceLimit")
    List<Product> findAvailableProductsCheaperThan(BigDecimal priceLimit);

    // ✅ CUSTOMER - tìm sản phẩm có từ khóa (chỉ lấy còn hàng và có ProductType hợp lệ)
    @Query("SELECT p FROM Product p WHERE p.productType IS NOT NULL AND LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.stockQuantity > 0")
    List<Product> searchAvailableProductsByKeyword(String keyword);
}
