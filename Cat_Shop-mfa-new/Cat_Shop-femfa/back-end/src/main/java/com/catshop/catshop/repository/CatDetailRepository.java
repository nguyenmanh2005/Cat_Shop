package com.catshop.catshop.repository;

import com.catshop.catshop.entity.CatDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatDetailRepository extends JpaRepository<CatDetails, Long> {
    boolean existsByCatId(Long catId);

    List<CatDetails> findByBreedContainingIgnoreCase(String breed);

    List<CatDetails> findByGender(String gender);

    List<CatDetails> findByVaccinated(Boolean vaccinated);

    Page<CatDetails> findAll(Pageable pageable);
}
