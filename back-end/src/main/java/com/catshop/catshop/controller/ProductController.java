package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.ProductRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.ProductResponse;
import com.catshop.catshop.service.ProductService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ProductController {

    private final ProductService productService;

    // ==================== ADMIN ====================
    @PostMapping(
            value = "/admin/products",
            consumes = { MediaType.MULTIPART_FORM_DATA_VALUE }
    )
    //@RequestPart dùng để lấy từng phần (part) trong request kiểu multipart/form-data.
    //Tức là khi request có nhiều “part” (vd: JSON + file), thì @RequestPart giúp Spring Boot bắt đúng từng phần ra.
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @RequestPart("product") String productJson,
            @RequestPart(value = "file", required = true) MultipartFile file
    ) throws JsonProcessingException {

        // Chuyển JSON sang object thủ công
        ObjectMapper mapper = new ObjectMapper();
        // Chuyển từ String thành đối tượng của ProductRequest
        ProductRequest request = mapper.readValue(productJson, ProductRequest.class);

        ProductResponse response = productService.createProductWithFile(request, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Tạo sản phẩm thành công"));
    }



    @PutMapping("/admin/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct (
            @PathVariable Long id,
            @RequestPart String productJson,
            @RequestPart(value = "file", required = false) MultipartFile file) throws JsonProcessingException{

        ObjectMapper objectMapper = new ObjectMapper();
        ProductRequest request = objectMapper.readValue(productJson,ProductRequest.class);
        ProductResponse response = productService.updateProduct(id, request, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật sản phẩm thành công"));
    }

    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa sản phẩm thành công"));
    }

    // ==================== CUSTOMER ====================
    @GetMapping("/customer/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(), "Lấy danh sách sản phẩm thành công"));
    }

    @GetMapping("/customer/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id), "Chi tiết sản phẩm"));
    }

    @GetMapping("/customer/products/type/{typeId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByType(@PathVariable Long typeId) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByType(typeId), "Lọc sản phẩm theo loại"));
    }

    @GetMapping("/customer/products/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByCategory(categoryId), "Lọc sản phẩm theo danh mục"));
    }

    @GetMapping("/customer/products/search")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> searchProducts(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(productService.searchProductsByName(keyword), "Tìm kiếm sản phẩm"));
    }

    @GetMapping("/customer/products/price-range")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsInPriceRange(
            @RequestParam double min,
            @RequestParam double max) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsInPriceRange(min, max), "Lọc sản phẩm theo khoảng giá"));
    }
}
