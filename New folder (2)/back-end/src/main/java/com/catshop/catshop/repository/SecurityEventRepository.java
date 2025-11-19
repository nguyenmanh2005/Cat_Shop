package com.catshop.catshop.repository;

import com.catshop.catshop.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {
    List<SecurityEvent> findTop50ByUserEmailOrderByCreatedAtDesc(String userEmail);
}

