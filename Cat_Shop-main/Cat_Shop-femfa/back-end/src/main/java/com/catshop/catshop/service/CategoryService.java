package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.CategoryRequest;
import com.catshop.catshop.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    List<CategoryResponse> getAllCategoriesForAdmin();
    List<CategoryResponse> getAvailableCategoriesForCustomer();
    CategoryResponse getCategoryById(Long id);
}
