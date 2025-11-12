package com.catshop.catshop.repository;

import com.catshop.catshop.entity.TrustedDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrustedDeviceRepository extends JpaRepository<TrustedDevice, Long> {
    Optional<TrustedDevice> findByUserEmailAndDeviceId(String userEmail, String deviceId);
}
