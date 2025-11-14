package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.CategoryRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.CategoryResponse;
import com.catshop.catshop.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.createCategory(request), "Tạo category thành công"));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.updateCategory(id, request), "Cập nhật category thành công"));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa category thành công"));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategoriesForAdmin() {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.getAllCategoriesForAdmin(), "Lấy danh sách category (admin) thành công"));
    }

    @GetMapping("/customer")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAvailableCategoriesForCustomer() {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.getAvailableCategoriesForCustomer(), "Lấy danh sách category khả dụng (customer) thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.getCategoryById(id), "Lấy chi tiết category thành công"));
    }
}
