package com.catshop.catshop.repository;

import com.catshop.catshop.entity.Category;
import com.catshop.catshop.entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByCategoryName(String categoryName);

    boolean existsByCategoryNameAndCategoryIdNot(String categoryName, Long categoryId);

    List<Category> findByProductType(ProductType productType);

    @Query("SELECT DISTINCT c FROM Category c JOIN c.products p WHERE p.stockQuantity > 0")
    List<Category> findAllAvailableCategories();
}
