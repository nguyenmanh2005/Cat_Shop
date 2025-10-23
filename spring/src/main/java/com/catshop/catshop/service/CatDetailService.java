package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.CatDetailRequest;
import com.catshop.catshop.dto.response.CatDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CatDetailService {

    // Admin
    CatDetailResponse insert(CatDetailRequest request);

    CatDetailResponse update(Long catId, CatDetailRequest request);

    void delete(Long catId);

    CatDetailResponse getByIdAdmin(Long catId);

    Page<CatDetailResponse> getAllAdmin(Pageable pageable);

    // Customer (read-only)
    CatDetailResponse getByIdCustomer(Long catId);

    Page<CatDetailResponse> getAllCustomer(Pageable pageable);

    // Search / Filters
    List<CatDetailResponse> searchByBreed(String breed);

    List<CatDetailResponse> filterByGender(String gender);

    List<CatDetailResponse> filterByVaccinated(Boolean vaccinated);
}
