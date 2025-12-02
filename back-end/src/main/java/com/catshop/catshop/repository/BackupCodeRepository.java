package com.catshop.catshop.repository;

import com.catshop.catshop.entity.BackupCode;
import com.catshop.catshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BackupCodeRepository extends JpaRepository<BackupCode, Long> {

    // Tìm tất cả backup codes chưa dùng của user
    List<BackupCode> findByUserAndUsedFalse(User user);

    // Tìm backup code chưa dùng theo code hash
    @Query("SELECT bc FROM BackupCode bc WHERE bc.codeHash = :codeHash AND bc.used = false")
    Optional<BackupCode> findByCodeHashAndNotUsed(@Param("codeHash") String codeHash);

    // Đếm số backup codes chưa dùng của user
    long countByUserAndUsedFalse(User user);

    // Xóa tất cả backup codes của user (khi regenerate)
    @Modifying
    @Query("DELETE FROM BackupCode bc WHERE bc.user = :user")
    void deleteAllByUser(@Param("user") User user);
}

