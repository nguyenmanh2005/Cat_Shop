package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.ProductRequest;
import com.catshop.catshop.dto.response.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    // ADMIN
    ProductResponse createProductWithFile(ProductRequest request, MultipartFile file);
    ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile file);
    void deleteProduct(Long id);

    // CUSTOMER & ADMIN
    List<ProductResponse> getAllProducts();
    ProductResponse getProductById(Long id);
    List<ProductResponse> getProductsByType(Long typeId);
    List<ProductResponse> getProductsByCategory(Long categoryId);
    List<ProductResponse> searchProductsByName(String keyword);
    List<ProductResponse> getProductsInPriceRange(double min, double max);
}
