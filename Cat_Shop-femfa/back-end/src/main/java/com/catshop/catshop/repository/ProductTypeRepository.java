package com.catshop.catshop.repository;

import com.catshop.catshop.entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {
    boolean existsByTypeName(String typeName);
}
