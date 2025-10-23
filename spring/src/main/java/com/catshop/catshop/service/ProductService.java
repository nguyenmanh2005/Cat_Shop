package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.ProductRequest;
import com.catshop.catshop.dto.response.ProductResponse;
import java.util.List;

public interface ProductService {

    // ADMIN
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);

    // CUSTOMER & ADMIN
    List<ProductResponse> getAllProducts();
    ProductResponse getProductById(Long id);
    List<ProductResponse> getProductsByType(Long typeId);
    List<ProductResponse> getProductsByCategory(Long categoryId);
    List<ProductResponse> searchProductsByName(String keyword);
    List<ProductResponse> getProductsInPriceRange(double min, double max);
}
