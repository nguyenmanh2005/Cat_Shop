package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.CageDetailRequest;
import com.catshop.catshop.dto.response.CageDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CageDetailService {
    CageDetailResponse insert(CageDetailRequest request);
    CageDetailResponse update(Long cageId, CageDetailRequest request);
    void delete(Long cageId);

    CageDetailResponse getByIdAdmin(Long cageId);
    Page<CageDetailResponse> getAllAdmin(Pageable pageable);

    CageDetailResponse getByIdCustomer(Long cageId);
    Page<CageDetailResponse> getAllCustomer(Pageable pageable);
}
