package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.CageDetailRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.CageDetailResponse;
import com.catshop.catshop.service.CageDetailService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class CageDetailController {

    private final CageDetailService cageDetailService;

    // ----------------- ADMIN -----------------
    @PostMapping("/admin/cage-details")
    public ResponseEntity<ApiResponse<CageDetailResponse>> createCage(@Valid @RequestBody CageDetailRequest request) {
        CageDetailResponse response = cageDetailService.insert(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Tạo CageDetail thành công"));
    }

    @PutMapping("/admin/cage-details/{id}")
    public ResponseEntity<ApiResponse<CageDetailResponse>> updateCage(
            @PathVariable("id") Long id,
            @Valid @RequestBody CageDetailRequest request) {
        CageDetailResponse response = cageDetailService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật CageDetail thành công"));
    }

    @DeleteMapping("/admin/cage-details/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCage(@PathVariable("id") Long id) {
        cageDetailService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa CageDetail thành công"));
    }

    @GetMapping("/admin/cage-details/{id}")
    public ResponseEntity<ApiResponse<CageDetailResponse>> getByIdAdmin(@PathVariable("id") Long id) {
        CageDetailResponse response = cageDetailService.getByIdAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy CageDetail thành công"));
    }

    @GetMapping("/admin/cage-details")
    public ResponseEntity<ApiResponse<Page<CageDetailResponse>>> getAllAdmin(Pageable pageable) {
        Page<CageDetailResponse> page = cageDetailService.getAllAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(page, "Danh sách CageDetail (admin)"));
    }

    // ----------------- CUSTOMER -----------------
    @GetMapping("/customer/cage-details/{id}")
    public ResponseEntity<ApiResponse<CageDetailResponse>> getByIdCustomer(@PathVariable("id") Long id) {
        CageDetailResponse response = cageDetailService.getByIdCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy CageDetail thành công"));
    }

    @GetMapping("/customer/cage-details")
    public ResponseEntity<ApiResponse<Page<CageDetailResponse>>> getAllCustomer(Pageable pageable) {
        Page<CageDetailResponse> page = cageDetailService.getAllCustomer(pageable);
        return ResponseEntity.ok(ApiResponse.success(page, "Danh sách CageDetail (customer)"));
    }
}
