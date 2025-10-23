package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.CleaningDetailRequest;
import com.catshop.catshop.dto.response.CleaningDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CleaningDetailService {

    CleaningDetailResponse insert(CleaningDetailRequest request);

    CleaningDetailResponse update(Long cleaningId, CleaningDetailRequest request);

    void delete(Long cleaningId);

    CleaningDetailResponse getByIdAdmin(Long cleaningId);

    Page<CleaningDetailResponse> getAllAdmin(Pageable pageable);

    CleaningDetailResponse getByIdCustomer(Long cleaningId);

    Page<CleaningDetailResponse> getAllCustomer(Pageable pageable);

    List<CleaningDetailResponse> searchByUsage(String usage);
}
