package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.FoodDetailRequest;
import com.catshop.catshop.dto.response.FoodDetailResponse;
import com.catshop.catshop.entity.FoodDetail;
import com.catshop.catshop.entity.Product;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.mapper.FoodDetailMapper;
import com.catshop.catshop.repository.FoodDetailRepository;
import com.catshop.catshop.repository.ProductRepository;
import com.catshop.catshop.service.FoodDetailService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FoodDetailServiceImpl implements FoodDetailService {

    private final FoodDetailRepository foodDetailRepository;
    private final ProductRepository productRepository;
    private final FoodDetailMapper foodDetailMapper;

    private static final int FOOD_PRODUCT_TYPE_ID = 2;

    @Override
    @Transactional
    public FoodDetailResponse insert(FoodDetailRequest request) {
        Long foodId = request.getFoodId();

        // Check product exist
        Product product = productRepository.findById(foodId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy product với id: " + foodId));

        // Ensure product type = FOOD
        if (product.getProductType() == null || product.getProductType().getTypeId() != FOOD_PRODUCT_TYPE_ID) {
            throw new BadRequestException("Bạn không thể thêm FoodDetail cho product không thuộc loại food: " + product.getProductType());
        }

        // Prevent duplicate FoodDetail for same foodId
        if (foodDetailRepository.existsByFoodId(foodId)) {
            throw new BadRequestException("Đã tồn tại FoodDetail với foodId: " + foodId);
        }

        // Build entity
        FoodDetail fd = FoodDetail.builder()
                .product(product) // @MapsId trên entity sẽ map id từ product
                .weightKg(request.getWeightKg())
                .ingredients(request.getIngredients())
                .expiryDate(request.getExpiryDate())
                .build();

        FoodDetail saved = foodDetailRepository.save(fd);
        return foodDetailMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public FoodDetailResponse update(Long foodId, FoodDetailRequest request) {
        FoodDetail exist = foodDetailRepository.findById(foodId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy FoodDetail với id: " + foodId));

        // Optional: check product exists and type still food
        Product product = productRepository.findById(foodId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy product với id: " + foodId));
        if (product.getProductType() == null || product.getProductType().getTypeId() != FOOD_PRODUCT_TYPE_ID) {
            throw new BadRequestException("Product không thuộc loại food: " + product.getProductType());
        }

        exist.setProduct(product); // giữ liên kết
        exist.setWeightKg(request.getWeightKg());
        exist.setIngredients(request.getIngredients());
        exist.setExpiryDate(request.getExpiryDate());

        FoodDetail updated = foodDetailRepository.save(exist);
        return foodDetailMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long foodId) {
        if (!foodDetailRepository.existsById(foodId)) {
            throw new BadRequestException("Không tìm thấy FoodDetail với id: " + foodId);
        }
        foodDetailRepository.deleteById(foodId);
    }

    @Override
    public FoodDetailResponse getByIdAdmin(Long foodId) {
        FoodDetail fd = foodDetailRepository.findById(foodId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy FoodDetail với id: " + foodId));
        return foodDetailMapper.toResponse(fd);
    }

    @Override
    public Page<FoodDetailResponse> getAllAdmin(Pageable pageable) {
        return foodDetailRepository.findAll(pageable).map(foodDetailMapper::toResponse);
    }

    @Override
    public FoodDetailResponse getByIdCustomer(Long foodId) {
        return getByIdAdmin(foodId);
    }

    @Override
    public Page<FoodDetailResponse> getAllCustomer(Pageable pageable) {
        return getAllAdmin(pageable);
    }

    @Override
    public List<FoodDetailResponse> searchByIngredients(String ingredients) {
        return foodDetailRepository.findByIngredientsContainingIgnoreCase(ingredients)
                .stream().map(foodDetailMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<FoodDetailResponse> filterByExpiryBefore(LocalDate date) {
        return foodDetailRepository.findByExpiryDateBefore(date)
                .stream().map(foodDetailMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<FoodDetailResponse> searchAndFilter(String ingredients, LocalDate expiryBefore) {
        return foodDetailRepository.findByIngredientsContainingIgnoreCaseAndExpiryDateBefore(ingredients, expiryBefore)
                .stream().map(foodDetailMapper::toResponse).collect(Collectors.toList());
    }
}
