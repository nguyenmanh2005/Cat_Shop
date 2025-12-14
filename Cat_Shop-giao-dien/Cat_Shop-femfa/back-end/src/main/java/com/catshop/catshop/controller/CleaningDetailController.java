package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.CleaningDetailRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.CleaningDetailResponse;
import com.catshop.catshop.service.CleaningDetailService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class CleaningDetailController {

    private final CleaningDetailService cleaningDetailService;

    // ----------------- ADMIN -----------------
    @PostMapping("/admin/cleaning-details")
    public ResponseEntity<ApiResponse<CleaningDetailResponse>> create(@Valid @RequestBody CleaningDetailRequest request) {
        CleaningDetailResponse response = cleaningDetailService.insert(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Tạo CleaningDetail thành công"));
    }

    @PutMapping("/admin/cleaning-details/{id}")
    public ResponseEntity<ApiResponse<CleaningDetailResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CleaningDetailRequest request) {
        CleaningDetailResponse response = cleaningDetailService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật CleaningDetail thành công"));
    }

    @DeleteMapping("/admin/cleaning-details/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        cleaningDetailService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa CleaningDetail thành công"));
    }

    @GetMapping("/admin/cleaning-details/{id}")
    public ResponseEntity<ApiResponse<CleaningDetailResponse>> getByIdAdmin(@PathVariable Long id) {
        CleaningDetailResponse response = cleaningDetailService.getByIdAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy CleaningDetail thành công"));
    }

    @GetMapping("/admin/cleaning-details")
    public ResponseEntity<ApiResponse<Page<CleaningDetailResponse>>> getAllAdmin(Pageable pageable) {
        Page<CleaningDetailResponse> page = cleaningDetailService.getAllAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(page, "Danh sách CleaningDetail (admin)"));
    }

    // ----------------- CUSTOMER -----------------
    @GetMapping("/customer/cleaning-details/{id}")
    public ResponseEntity<ApiResponse<CleaningDetailResponse>> getByIdCustomer(@PathVariable Long id) {
        CleaningDetailResponse response = cleaningDetailService.getByIdCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy CleaningDetail thành công"));
    }

    @GetMapping("/customer/cleaning-details")
    public ResponseEntity<ApiResponse<Page<CleaningDetailResponse>>> getAllCustomer(Pageable pageable) {
        Page<CleaningDetailResponse> page = cleaningDetailService.getAllCustomer(pageable);
        return ResponseEntity.ok(ApiResponse.success(page, "Danh sách CleaningDetail (customer)"));
    }

    // ----------------- SEARCH -----------------
    @GetMapping("/admin/cleaning-details/search")
    public ResponseEntity<ApiResponse<List<CleaningDetailResponse>>> searchByUsage(@RequestParam String usage) {
        List<CleaningDetailResponse> list = cleaningDetailService.searchByUsage(usage);
        return ResponseEntity.ok(ApiResponse.success(list, "Tìm kiếm CleaningDetail theo usage"));
    }

    @GetMapping("/customer/cleaning-details/search")
    public ResponseEntity<ApiResponse<List<CleaningDetailResponse>>> searchByUsageCustomer(@RequestParam String usage) {
        List<CleaningDetailResponse> list = cleaningDetailService.searchByUsage(usage);
        return ResponseEntity.ok(ApiResponse.success(list, "Tìm kiếm CleaningDetail theo usage"));
    }
}
