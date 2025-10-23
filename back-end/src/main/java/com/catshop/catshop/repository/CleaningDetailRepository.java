package com.catshop.catshop.repository;

import com.catshop.catshop.entity.CleaningDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CleaningDetailRepository extends JpaRepository<CleaningDetail, Long> {
    boolean existsByCleaningId(Long cleaningId);

    List<CleaningDetail> findByUsageContainingIgnoreCase(String usage);
}
