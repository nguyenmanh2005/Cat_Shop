package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.ProductRequest;
import com.catshop.catshop.dto.response.ProductResponse;
import com.catshop.catshop.entity.*;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.ProductMapper;
import com.catshop.catshop.repository.*;
import com.catshop.catshop.service.FileStorageService;
import com.catshop.catshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private final FileStorageService fileStorageService;

    // ====================== ADMIN ======================

    @Override
    public ProductResponse createProductWithFile(ProductRequest request, MultipartFile file) {
        ProductType type = productTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại sản phẩm"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));
        }

        Product product = productMapper.toEntity(request);
        product.setProductType(type);
        product.setCategory(category);

        try {
            String imageUrl = fileStorageService.saveFile(file,product.getProductName());
            product.setImageUrl(imageUrl);
        } catch (IOException e) {
            throw new BadRequestException("Lưu file thất bại: " + e.getMessage());
        }

        return productMapper.toDto(productRepository.save(product));
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile file) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm (id=" + id + ")"));

        ProductType type = productTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại sản phẩm"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));
        }

        existing.setProductName(request.getProductName());
        existing.setProductType(type);
        existing.setCategory(category);
        existing.setPrice(request.getPrice());
        existing.setStockQuantity(request.getStockQuantity());
        existing.setDescription(request.getDescription());

        if (file != null && !file.isEmpty()) {
            try {
                // Xóa file cũ nếu có
                if (existing.getImageUrl() != null) {
                    fileStorageService.deleteFile(existing.getImageUrl());
                }
                // Lưu file mới
                String imageUrl = fileStorageService.saveFile(file,existing.getProductName());
                existing.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new BadRequestException("Lưu file thất bại: " + e.getMessage());
            }
        }

        return productMapper.toDto(productRepository.save(existing));
    }

    @Override
    public void deleteProduct(Long id) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm (id=" + id + ")"));

        // Xóa file ảnh khỏi local
        if (existing.getImageUrl() != null) {
            fileStorageService.deleteFile(existing.getImageUrl());
        }

        productRepository.delete(existing);
    }

    // ====================== CUSTOMER ======================

    @Override
    public List<ProductResponse> getAllProducts() {
        try {
            return productMapper.toDtoList(productRepository.findAllAvailableProducts());
        } catch (Exception e) {
            // Log lỗi và trả về danh sách rỗng hoặc xử lý lỗi
            System.err.println("Lỗi khi lấy danh sách sản phẩm: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể lấy danh sách sản phẩm: " + e.getMessage(), e);
        }
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
