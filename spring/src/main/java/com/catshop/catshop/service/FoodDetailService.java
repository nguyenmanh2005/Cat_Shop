package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.FoodDetailRequest;
import com.catshop.catshop.dto.response.FoodDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface FoodDetailService {

    FoodDetailResponse insert(FoodDetailRequest request);

    FoodDetailResponse update(Long foodId, FoodDetailRequest request);

    void delete(Long foodId);

    FoodDetailResponse getByIdAdmin(Long foodId);

    Page<FoodDetailResponse> getAllAdmin(Pageable pageable);

    FoodDetailResponse getByIdCustomer(Long foodId);

    Page<FoodDetailResponse> getAllCustomer(Pageable pageable);

    List<FoodDetailResponse> searchByIngredients(String ingredients);

    List<FoodDetailResponse> filterByExpiryBefore(LocalDate date);

    List<FoodDetailResponse> searchAndFilter(String ingredients, LocalDate expiryBefore);
}
