package com.catshop.catshop.repository;

import com.catshop.catshop.entity.FoodDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FoodDetailRepository extends JpaRepository<FoodDetail, Long> {
    boolean existsByFoodId(Long foodId);
    List<FoodDetail> findByIngredientsContainingIgnoreCase(String ingredients);
    List<FoodDetail> findByExpiryDateBefore(LocalDate date);
    List<FoodDetail> findByIngredientsContainingIgnoreCaseAndExpiryDateBefore(String ingredients, LocalDate date);
}
