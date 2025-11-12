package com.catshop.catshop.controller;

import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.entity.ProductType;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-types")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ProductTypeController {

    private final ProductTypeRepository productTypeRepository;

    @GetMapping
    public ApiResponse<List<ProductType>> getAllProductTypes() {
        List<ProductType> productTypes = productTypeRepository.findAll();
        return ApiResponse.success(productTypes, "Lấy danh sách loại sản phẩm thành công");
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductType> getProductTypeById(@PathVariable Long id) {
        ProductType productType = productTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại sản phẩm với id: " + id));
        return ApiResponse.success(productType, "Lấy loại sản phẩm thành công");
    }
}

