package com.catshop.catshop.repository;

import com.catshop.catshop.entity.MfaAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MfaAttemptRepository extends JpaRepository<MfaAttempt, Long> {
    
    /**
     * Đếm số lần thử MFA thất bại trong khoảng thời gian
     */
    long countByUserEmailAndSuccessFalseAndCreatedAtAfter(
            String userEmail, LocalDateTime after);
    
    /**
     * Đếm số lần thử MFA từ IP trong khoảng thời gian
     */
    long countByIpAddressAndSuccessFalseAndCreatedAtAfter(
            String ipAddress, LocalDateTime after);
    
    /**
     * Đếm số lần thử từ IP trong khoảng thời gian
     */
    long countByIpAddressAndCreatedAtAfter(String ipAddress, LocalDateTime after);
    
    /**
     * Lấy các lần thử gần đây của user
     */
    List<MfaAttempt> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    
    /**
     * Lấy các lần thử gần đây của user với phân trang
     */
    Page<MfaAttempt> findByUserEmailOrderByCreatedAtDesc(String userEmail, Pageable pageable);
    
    /**
     * Lấy các lần thử gần đây từ IP
     */
    List<MfaAttempt> findByIpAddressOrderByCreatedAtDesc(String ipAddress);
    
    /**
     * Lấy các lần thử gần đây từ IP với phân trang
     */
    Page<MfaAttempt> findByIpAddressOrderByCreatedAtDesc(String ipAddress, Pageable pageable);
    
    /**
     * Xóa các attempts cũ hơn một khoảng thời gian (cleanup)
     */
    void deleteByCreatedAtBefore(LocalDateTime before);
    
    /**
     * Đếm số lần thử thành công từ device trong khoảng thời gian
     */
    @Query("SELECT COUNT(m) FROM MfaAttempt m WHERE m.deviceId = :deviceId " +
           "AND m.success = true AND m.createdAt > :after")
    long countSuccessfulAttemptsByDevice(@Param("deviceId") String deviceId, 
                                         @Param("after") LocalDateTime after);
    
    /**
     * Đếm số lần thử thành công
     */
    long countBySuccessTrue();
    
    /**
     * Đếm số lần thử thất bại
     */
    long countBySuccessFalse();
    
    /**
     * Đếm số lần thử sau một thời điểm
     */
    long countByCreatedAtAfter(LocalDateTime after);
    
    /**
     * Lấy danh sách IP addresses duy nhất
     */
    @Query("SELECT DISTINCT m.ipAddress FROM MfaAttempt m WHERE m.ipAddress IS NOT NULL")
    List<String> findDistinctIpAddresses();
}

