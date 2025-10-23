package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.CleaningDetailRequest;
import com.catshop.catshop.dto.response.CleaningDetailResponse;
import com.catshop.catshop.entity.CleaningDetail;
import com.catshop.catshop.entity.Product;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.mapper.CleaningDetailMapper;
import com.catshop.catshop.repository.CleaningDetailRepository;
import com.catshop.catshop.repository.ProductRepository;
import com.catshop.catshop.service.CleaningDetailService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CleaningDetailServiceImpl implements CleaningDetailService {

    private final CleaningDetailRepository cleaningDetailRepository;
    private final ProductRepository productRepository;
    private final CleaningDetailMapper cleaningDetailMapper;

    private static final int CLEANING_PRODUCT_TYPE_ID = 4;

    @Override
    @Transactional
    public CleaningDetailResponse insert(CleaningDetailRequest request) {
        Long cleaningId = request.getProductId();

        Product product = productRepository.findById(cleaningId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy product với id: " + cleaningId));

        if (product.getProductType() == null || product.getProductType().getTypeId() != CLEANING_PRODUCT_TYPE_ID) {
            throw new BadRequestException("Product này không phải loại Cleaning");
        }

        if (cleaningDetailRepository.existsByCleaningId(cleaningId)) {
            throw new BadRequestException("CleaningDetail đã tồn tại với id: " + cleaningId);
        }

        CleaningDetail cleaningDetail = CleaningDetail.builder()
                .product(product) // QUAN TRỌNG: MapsId
                .volumeMl(request.getVolumeMl())
                .usage(request.getUsage())
                .build();

        CleaningDetail saved = cleaningDetailRepository.save(cleaningDetail);
        return cleaningDetailMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CleaningDetailResponse update(Long cleaningId, CleaningDetailRequest request) {
        CleaningDetail exist = cleaningDetailRepository.findById(cleaningId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy CleaningDetail với id: " + cleaningId));

        Product product = productRepository.findById(cleaningId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy product với id: " + cleaningId));

        if (product.getProductType() == null || product.getProductType().getTypeId() != CLEANING_PRODUCT_TYPE_ID) {
            throw new BadRequestException("Product không thuộc loại Cleaning");
        }

        exist.setProduct(product);
        exist.setVolumeMl(request.getVolumeMl());
        exist.setUsage(request.getUsage());

        CleaningDetail updated = cleaningDetailRepository.save(exist);
        return cleaningDetailMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long cleaningId) {
        if (!cleaningDetailRepository.existsById(cleaningId)) {
            throw new BadRequestException("Không tìm thấy CleaningDetail với id: " + cleaningId);
        }
        cleaningDetailRepository.deleteById(cleaningId);
    }

    @Override
    public CleaningDetailResponse getByIdAdmin(Long cleaningId) {
        CleaningDetail detail = cleaningDetailRepository.findById(cleaningId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy CleaningDetail với id: " + cleaningId));
        return cleaningDetailMapper.toResponse(detail);
    }

    @Override
    public Page<CleaningDetailResponse> getAllAdmin(Pageable pageable) {
        return cleaningDetailRepository.findAll(pageable)
                .map(cleaningDetailMapper::toResponse);
    }

    @Override
    public CleaningDetailResponse getByIdCustomer(Long cleaningId) {
        return getByIdAdmin(cleaningId);
    }

    @Override
    public Page<CleaningDetailResponse> getAllCustomer(Pageable pageable) {
        return getAllAdmin(pageable);
    }

    @Override
    public List<CleaningDetailResponse> searchByUsage(String usage) {
        return cleaningDetailRepository.findByUsageContainingIgnoreCase(usage)
                .stream().map(cleaningDetailMapper::toResponse).collect(Collectors.toList());
    }
}
