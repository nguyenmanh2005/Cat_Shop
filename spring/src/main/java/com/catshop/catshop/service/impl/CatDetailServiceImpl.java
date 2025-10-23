package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.CatDetailRequest;
import com.catshop.catshop.dto.response.CatDetailResponse;
import com.catshop.catshop.entity.CatDetails;
import com.catshop.catshop.entity.Product;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.mapper.CatDetailMapper;
import com.catshop.catshop.repository.CatDetailRepository;
import com.catshop.catshop.repository.ProductRepository;
import com.catshop.catshop.service.CatDetailService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CatDetailServiceImpl implements CatDetailService {

    private final CatDetailRepository catDetailRepository;
    private final ProductRepository productRepository;
    private final CatDetailMapper catDetailMapper;

    @Override
    @Transactional
    public CatDetailResponse insert(CatDetailRequest catDetailRequest){
        Long catId = catDetailRequest.getCatId();

        Product product = productRepository.findById(catId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy product với id: " + catId));

        if (product.getProductType() == null || product.getProductType().getTypeId() != 1) {
            throw new BadRequestException("Product này không phải loại Cat");
        }

        if (catDetailRepository.existsByCatId(catId)) {
            throw new BadRequestException("CatDetail đã tồn tại với id: " + catId);
        }

        CatDetails catDetails = CatDetails.builder()
                .product(product)
                .breed(catDetailRequest.getBreed())
                .age(catDetailRequest.getAge())
                .gender(catDetailRequest.getGender())
                .vaccinated(catDetailRequest.getVaccinated())
                .build();

        CatDetails saved = catDetailRepository.save(catDetails);
        return catDetailMapper.toCatDetailResponse(saved);
    }

    @Override
    @Transactional
    public CatDetailResponse update(Long catId, CatDetailRequest catDetailRequest) {
        // ensure exists
        CatDetails exist = catDetailRepository.findById(catId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy CatDetails với id: " + catId));

        // product check (optional but keep rule)
        Product product = productRepository.findById(catId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy product với id: " + catId));

        exist.setBreed(catDetailRequest.getBreed());
        exist.setAge(catDetailRequest.getAge());
        exist.setGender(catDetailRequest.getGender());
        exist.setVaccinated(catDetailRequest.getVaccinated());

        CatDetails updated = catDetailRepository.save(exist);
        return catDetailMapper.toCatDetailResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long catId) {
        if (!catDetailRepository.existsById(catId)) {
            throw new BadRequestException("Không tìm thấy CatDetails với id: " + catId);
        }
        catDetailRepository.deleteById(catId);
    }

    @Override
    public CatDetailResponse getByIdAdmin(Long catId) {
        CatDetails cd = catDetailRepository.findById(catId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy CatDetails với id: " + catId));
        return catDetailMapper.toCatDetailResponse(cd);
    }

    @Override
    public Page<CatDetailResponse> getAllAdmin(Pageable pageable) {
        return catDetailRepository.findAll(pageable).map(catDetailMapper::toCatDetailResponse);
    }

    // Customer read-only methods - same behavior but kept separate for future auth differences
    @Override
    public CatDetailResponse getByIdCustomer(Long catId) {
        return getByIdAdmin(catId);
    }

    @Override
    public Page<CatDetailResponse> getAllCustomer(Pageable pageable) {
        return getAllAdmin(pageable);
    }

    // Search / Filter
    @Override
    public List<CatDetailResponse> searchByBreed(String breed) {
        return catDetailRepository.findByBreedContainingIgnoreCase(breed)
                .stream().map(catDetailMapper::toCatDetailResponse).collect(Collectors.toList());
    }

    @Override
    public List<CatDetailResponse> filterByGender(String gender) {
        return catDetailRepository.findByGender(gender)
                .stream().map(catDetailMapper::toCatDetailResponse).collect(Collectors.toList());
    }

    @Override
    public List<CatDetailResponse> filterByVaccinated(Boolean vaccinated) {
        return catDetailRepository.findByVaccinated(vaccinated)
                .stream().map(catDetailMapper::toCatDetailResponse).collect(Collectors.toList());
    }
}
