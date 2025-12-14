package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.CageDetailRequest;
import com.catshop.catshop.dto.response.CageDetailResponse;
import com.catshop.catshop.entity.CageDetail;
import com.catshop.catshop.entity.Product;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.CageDetailMapper;
import com.catshop.catshop.repository.CageDetailRepository;
import com.catshop.catshop.repository.ProductRepository;
import com.catshop.catshop.service.CageDetailService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class CageDetailServiceImpl implements CageDetailService {

    private final CageDetailRepository cageDetailRepository;
    private final ProductRepository productRepository;
    private final CageDetailMapper cageDetailMapper;

    private static final int CAGE_PRODUCT_TYPE_ID = 3;

    @Override
    @Transactional
    public CageDetailResponse insert(CageDetailRequest request) {
        Long productId = request.getProductId();

        // Check product exist
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy product với id: " + productId));

        // Ensure product type = CAGE
        if (product.getProductType() == null || product.getProductType().getTypeId() != CAGE_PRODUCT_TYPE_ID) {
            throw new BadRequestException("Bạn không thể thêm CageDetail cho product không thuộc loại cage: " + product.getProductType());
        }

        // Prevent duplicate CageDetail for same productId
        if (cageDetailRepository.existsByProduct_ProductId(productId)) {
            throw new BadRequestException("Đã tồn tại CageDetail với productId: " + productId);
        }

        // Build entity
        CageDetail cd = CageDetail.builder()
                .product(product) // @MapsId trên entity sẽ map id từ product
                .material(request.getMaterial())
                .dimensions(request.getDimensions())
                .build();

        CageDetail saved = cageDetailRepository.save(cd);
        return cageDetailMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CageDetailResponse update(Long cageId, CageDetailRequest request) {
        CageDetail exist = cageDetailRepository.findById(cageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CageDetail với id: " + cageId));

        // Optional: ensure the product exists and still type = CAGE
        Product product = productRepository.findById(cageId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy product với id: " + cageId));

        if (product.getProductType() == null || product.getProductType().getTypeId() != CAGE_PRODUCT_TYPE_ID) {
            throw new BadRequestException("Product không thuộc loại cage: " + product.getProductType());
        }

        // Update fields
        exist.setProduct(product);
        exist.setMaterial(request.getMaterial());
        exist.setDimensions(request.getDimensions());

        CageDetail updated = cageDetailRepository.save(exist);
        return cageDetailMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long cageId) {
        if (!cageDetailRepository.existsById(cageId)) {
            throw new ResourceNotFoundException("Không tìm thấy CageDetail với id: " + cageId);
        }
        cageDetailRepository.deleteById(cageId);
    }

    @Override
    public CageDetailResponse getByIdAdmin(Long cageId) {
        CageDetail cd = cageDetailRepository.findById(cageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CageDetail với id: " + cageId));
        return cageDetailMapper.toResponse(cd);
    }

    @Override
    public Page<CageDetailResponse> getAllAdmin(Pageable pageable) {
        return cageDetailRepository.findAllForAdmin(pageable).map(cageDetailMapper::toResponse);
    }

    @Override
    public CageDetailResponse getByIdCustomer(Long cageId) {
        // For customer, we allow only if stockQuantity > 0
        CageDetail cd = cageDetailRepository.findById(cageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CageDetail với id: " + cageId));

        if (cd.getProduct().getStockQuantity() == null || cd.getProduct().getStockQuantity() <= 0) {
            throw new ResourceNotFoundException("Sản phẩm không còn hàng");
        }
        return cageDetailMapper.toResponse(cd);
    }

    @Override
    public Page<CageDetailResponse> getAllCustomer(Pageable pageable) {
        return cageDetailRepository.findAllForCustomer(pageable).map(cageDetailMapper::toResponse);
    }
}
