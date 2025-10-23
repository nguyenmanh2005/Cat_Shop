package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.FoodDetailRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.FoodDetailResponse;
import com.catshop.catshop.service.FoodDetailService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class FoodDetailController {

    private final FoodDetailService foodDetailService;

    // ----------------- Admin APIs -----------------

    @PostMapping("/admin/food-details")
    public ResponseEntity<ApiResponse<FoodDetailResponse>> createFoodDetail(@Valid @RequestBody FoodDetailRequest request) {
        FoodDetailResponse res = foodDetailService.insert(request);
        return ResponseEntity.ok(ApiResponse.success(res, "Tạo FoodDetail thành công"));
    }

    @PutMapping("/admin/food-details/{foodId}")
    public ResponseEntity<ApiResponse<FoodDetailResponse>> updateFoodDetail(
            @PathVariable Long foodId,
            @Valid @RequestBody FoodDetailRequest request) {
        FoodDetailResponse res = foodDetailService.update(foodId, request);
        return ResponseEntity.ok(ApiResponse.success(res, "Cập nhật FoodDetail thành công"));
    }

    @DeleteMapping("/admin/food-details/{foodId}")
    public ResponseEntity<ApiResponse<Void>> deleteFoodDetail(@PathVariable Long foodId) {
        foodDetailService.delete(foodId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa FoodDetail thành công"));
    }

    @GetMapping("/admin/food-details/{foodId}")
    public ResponseEntity<ApiResponse<FoodDetailResponse>> getByIdAdmin(@PathVariable Long foodId) {
        FoodDetailResponse res = foodDetailService.getByIdAdmin(foodId);
        return ResponseEntity.ok(ApiResponse.success(res, "Lấy FoodDetail thành công"));
    }

    @GetMapping("/admin/food-details")
    public ResponseEntity<ApiResponse<Page<FoodDetailResponse>>> getAllAdmin(Pageable pageable) {
        Page<FoodDetailResponse> page = foodDetailService.getAllAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(page, "Lấy danh sách FoodDetail (admin)"));
    }

    @GetMapping("/admin/food-details/search")
    public ResponseEntity<ApiResponse<List<FoodDetailResponse>>> searchAdmin(@RequestParam String ingredients) {
        List<FoodDetailResponse> list = foodDetailService.searchByIngredients(ingredients);
        return ResponseEntity.ok(ApiResponse.success(list, "Kết quả tìm kiếm theo ingredients"));
    }

    @GetMapping("/admin/food-details/filter")
    public ResponseEntity<ApiResponse<List<FoodDetailResponse>>> filterAdmin(
            @RequestParam("expiryBefore") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryBefore) {
        List<FoodDetailResponse> list = foodDetailService.filterByExpiryBefore(expiryBefore);
        return ResponseEntity.ok(ApiResponse.success(list, "Kết quả lọc theo expiryDate"));
    }

    @GetMapping("/admin/food-details/search-filter")
    public ResponseEntity<ApiResponse<List<FoodDetailResponse>>> searchFilterAdmin(
            @RequestParam String ingredients,
            @RequestParam("expiryBefore") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryBefore) {
        List<FoodDetailResponse> list = foodDetailService.searchAndFilter(ingredients, expiryBefore);
        return ResponseEntity.ok(ApiResponse.success(list, "Kết quả tìm & lọc theo ingredients + expiryDate"));
    }

    // ----------------- Customer APIs -----------------

    @GetMapping("/food-details/{foodId}")
    public ResponseEntity<ApiResponse<FoodDetailResponse>> getByIdCustomer(@PathVariable Long foodId) {
        FoodDetailResponse res = foodDetailService.getByIdCustomer(foodId);
        return ResponseEntity.ok(ApiResponse.success(res, "Lấy FoodDetail thành công"));
    }

    @GetMapping("/food-details")
    public ResponseEntity<ApiResponse<Page<FoodDetailResponse>>> getAllCustomer(Pageable pageable) {
        Page<FoodDetailResponse> page = foodDetailService.getAllCustomer(pageable);
        return ResponseEntity.ok(ApiResponse.success(page, "Lấy danh sách FoodDetail"));
    }

    @GetMapping("/food-details/search")
    public ResponseEntity<ApiResponse<List<FoodDetailResponse>>> searchCustomer(@RequestParam String ingredients) {
        List<FoodDetailResponse> list = foodDetailService.searchByIngredients(ingredients);
        return ResponseEntity.ok(ApiResponse.success(list, "Kết quả tìm kiếm theo ingredients"));
    }
}
