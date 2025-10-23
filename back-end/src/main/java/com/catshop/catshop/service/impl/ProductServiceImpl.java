package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.ProductRequest;
import com.catshop.catshop.dto.response.ProductResponse;
import com.catshop.catshop.entity.*;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.ProductMapper;
import com.catshop.catshop.repository.*;
import com.catshop.catshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    // ====================== ADMIN ======================
    @Override
    public ProductResponse createProduct(ProductRequest request) {
        ProductType type = productTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại sản phẩm (typeId=" + request.getTypeId() + ")"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục (categoryId=" + request.getCategoryId() + ")"));
        }

        Product product = productMapper.toEntity(request);
        product.setProductType(type);
        product.setCategory(category);

        return productMapper.toDto(productRepository.save(product));
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm (id=" + id + ")"));

        ProductType type = productTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại sản phẩm (typeId=" + request.getTypeId() + ")"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục (categoryId=" + request.getCategoryId() + ")"));
        }

        existing.setProductName(request.getProductName());
        existing.setProductType(type);
        existing.setCategory(category);
        existing.setPrice(request.getPrice());
        existing.setStockQuantity(request.getStockQuantity());
        existing.setDescription(request.getDescription());
        existing.setImageUrl(request.getImageUrl());

        return productMapper.toDto(productRepository.save(existing));
    }

    @Override
    public void deleteProduct(Long id) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm (id=" + id + ")"));
        productRepository.delete(existing);
    }

    // ====================== CUSTOMER ======================
    @Override
    public List<ProductResponse> getAllProducts() {
        return productMapper.toDtoList(productRepository.findAllAvailableProducts());
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm (id=" + id + ")"));
        return productMapper.toDto(product);
    }

    @Override
    public List<ProductResponse> getProductsByType(Long typeId) {
        return productMapper.toDtoList(productRepository.findAvailableProductsByTypeId(typeId));
    }

    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productMapper.toDtoList(productRepository.findAvailableProductsByCategoryId(categoryId));
    }

    @Override
    public List<ProductResponse> searchProductsByName(String keyword) {
        return productMapper.toDtoList(productRepository.searchAvailableProductsByKeyword(keyword));
    }

    @Override
    public List<ProductResponse> getProductsInPriceRange(double min, double max) {
        BigDecimal minPrice = BigDecimal.valueOf(min);
        BigDecimal maxPrice = BigDecimal.valueOf(max);
        return productMapper.toDtoList(productRepository.findByPriceBetween(minPrice, maxPrice));
    }
}
