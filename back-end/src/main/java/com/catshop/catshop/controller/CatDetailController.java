package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.CatDetailRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.CatDetailResponse;
import com.catshop.catshop.service.CatDetailService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
@Validated
@AllArgsConstructor
public class CatDetailController {

    private final CatDetailService catDetailService;

    // ---------------- ADMIN ----------------
    @PostMapping("/admin/cat-details")
    public ResponseEntity<ApiResponse<CatDetailResponse>> createCatDetail(
            @Valid @RequestBody CatDetailRequest request) {
        CatDetailResponse resp = catDetailService.insert(request);
        return ResponseEntity.ok(ApiResponse.success(resp, "Thêm CatDetails thành công"));
    }

    @PutMapping("/admin/cat-details/{id}")
    public ResponseEntity<ApiResponse<CatDetailResponse>> updateCatDetail(
            @PathVariable("id") Long id,
            @Valid @RequestBody CatDetailRequest request) {
        CatDetailResponse resp = catDetailService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(resp, "Cập nhật CatDetails thành công"));
    }

    @DeleteMapping("/admin/cat-details/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCatDetail(@PathVariable("id") Long id) {
        catDetailService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa CatDetails thành công"));
    }

    @GetMapping("/admin/cat-details/{id}")
    public ResponseEntity<ApiResponse<CatDetailResponse>> getCatDetailByIdAdmin(@PathVariable("id") Long id) {
        CatDetailResponse resp = catDetailService.getByIdAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(resp, "Lấy CatDetails theo id thành công"));
    }

    @GetMapping("/admin/cat-details")
    public ResponseEntity<ApiResponse<Page<CatDetailResponse>>> getAllAdmin(Pageable pageable) {
        Page<CatDetailResponse> page = catDetailService.getAllAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(page, "Lấy danh sách CatDetails (admin) thành công"));
    }

    // ---------------- CUSTOMER (read only) ----------------
    @GetMapping("/cat-details/{id}")
    public ResponseEntity<ApiResponse<CatDetailResponse>> getCatDetailByIdCustomer(@PathVariable("id") Long id) {
        CatDetailResponse resp = catDetailService.getByIdCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(resp, "Lấy CatDetails thành công"));
    }

    @GetMapping("/cat-details")
    public ResponseEntity<ApiResponse<Page<CatDetailResponse>>> getAllCustomer(Pageable pageable) {
        Page<CatDetailResponse> page = catDetailService.getAllCustomer(pageable);
        return ResponseEntity.ok(ApiResponse.success(page, "Lấy danh sách CatDetails thành công"));
    }

    // ---------------- Search / Filters (public) ----------------
    @GetMapping("/cat-details/search")
    public ResponseEntity<ApiResponse<List<CatDetailResponse>>> searchByBreed(@RequestParam("breed") String breed) {
        List<CatDetailResponse> list = catDetailService.searchByBreed(breed);
        return ResponseEntity.ok(ApiResponse.success(list, "Kết quả tìm kiếm theo breed"));
    }

    @GetMapping("/cat-details/filter/gender")
    public ResponseEntity<ApiResponse<List<CatDetailResponse>>> filterByGender(@RequestParam("gender") String gender) {
        List<CatDetailResponse> list = catDetailService.filterByGender(gender);
        return ResponseEntity.ok(ApiResponse.success(list, "Lọc theo gender thành công"));
    }

    @GetMapping("/cat-details/filter/vaccinated")
    public ResponseEntity<ApiResponse<List<CatDetailResponse>>> filterByVaccinated(@RequestParam("vaccinated") Boolean vaccinated) {
        List<CatDetailResponse> list = catDetailService.filterByVaccinated(vaccinated);
        return ResponseEntity.ok(ApiResponse.success(list, "Lọc theo vaccinated thành công"));
    }
}
