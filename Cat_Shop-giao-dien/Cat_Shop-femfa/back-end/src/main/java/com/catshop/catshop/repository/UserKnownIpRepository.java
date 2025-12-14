package com.catshop.catshop.repository;

import com.catshop.catshop.entity.UserKnownIp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserKnownIpRepository extends JpaRepository<UserKnownIp, Long> {
    /**
     * Tìm IP đã biết của user
     */
    Optional<UserKnownIp> findByUserEmailAndIpAddress(String userEmail, String ipAddress);

    /**
     * Lấy tất cả IP đã biết của user, sắp xếp theo lastSeen giảm dần
     */
    List<UserKnownIp> findByUserEmailOrderByLastSeenDesc(String userEmail);

    /**
     * Đếm số IP đã biết của user
     */
    long countByUserEmail(String userEmail);

    /**
     * Xóa tất cả IP của user
     */
    void deleteByUserEmail(String userEmail);
}

