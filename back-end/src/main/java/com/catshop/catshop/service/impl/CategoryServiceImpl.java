package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.CategoryRequest;
import com.catshop.catshop.dto.response.CategoryResponse;
import com.catshop.catshop.entity.Category;
import com.catshop.catshop.entity.ProductType;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.CategoryMapper;
import com.catshop.catshop.repository.CategoryRepository;
import com.catshop.catshop.repository.ProductTypeRepository;
import com.catshop.catshop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductTypeRepository productTypeRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new BadRequestException("Category name already exists");
        }

        ProductType productType = productTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductType not found with ID: " + request.getTypeId()));

        Category category = Category.builder()
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .productType(productType)
                .build();

        categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (categoryRepository.existsByCategoryNameAndCategoryIdNot(request.getCategoryName(), id)) {
            throw new BadRequestException("Category name already exists");
        }

        ProductType productType = productTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductType not found with ID: " + request.getTypeId()));

        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setProductType(productType);

        categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        categoryRepository.delete(category);
    }

    @Override
    public List<CategoryResponse> getAllCategoriesForAdmin() {
        return categoryMapper.toResponseList(categoryRepository.findAll());
    }

    @Override
    public List<CategoryResponse> getAvailableCategoriesForCustomer() {
        return categoryMapper.toResponseList(categoryRepository.findAllAvailableCategories());
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return categoryMapper.toResponse(category);
    }
}
