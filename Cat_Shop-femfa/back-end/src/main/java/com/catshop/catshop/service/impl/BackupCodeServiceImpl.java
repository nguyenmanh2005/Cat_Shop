package com.catshop.catshop.service.impl;

import com.catshop.catshop.entity.BackupCode;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.repository.BackupCodeRepository;
import com.catshop.catshop.service.BackupCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BackupCodeServiceImpl implements BackupCodeService {

    private final BackupCodeRepository backupCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private static final SecureRandom random = new SecureRandom();
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Loại bỏ 0, O, I, 1 để tránh nhầm lẫn

    @Override
    public List<String> generateBackupCodes(User user, int count) {
        // Xóa các backup codes cũ nếu có (khi regenerate)
        backupCodeRepository.deleteAllByUser(user);

        List<String> plainCodes = new ArrayList<>();
        List<BackupCode> backupCodes = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            // Tạo code dạng: XXXX-XXXX (8 ký tự, chia 2 phần)
            String code = generateRandomCode();
            plainCodes.add(code);

            // Hash code trước khi lưu
            String codeHash = passwordEncoder.encode(code);

            BackupCode backupCode = BackupCode.builder()
                    .user(user)
                    .codeHash(codeHash)
                    .used(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            backupCodes.add(backupCode);
        }

        // Lưu tất cả vào database
        backupCodeRepository.saveAll(backupCodes);

        log.info("✅ Đã tạo {} backup codes cho user: {}", count, user.getEmail());
        return plainCodes;
    }

    @Override
    public boolean verifyBackupCode(User user, String code) {
        if (code == null || code.isBlank()) {
            return false;
        }

        // Tìm tất cả backup codes chưa dùng của user
        List<BackupCode> unusedCodes = backupCodeRepository.findByUserAndUsedFalse(user);

        // Kiểm tra từng code (so sánh hash)
        for (BackupCode backupCode : unusedCodes) {
            if (passwordEncoder.matches(code, backupCode.getCodeHash())) {
                // Code hợp lệ - đánh dấu đã dùng
                backupCode.setUsed(true);
                backupCode.setUsedAt(LocalDateTime.now());
                backupCodeRepository.save(backupCode);

                log.info("✅ Backup code đã được sử dụng cho user: {}", user.getEmail());
                return true;
            }
        }

        log.warn("⚠️ Backup code không hợp lệ hoặc đã được sử dụng cho user: {}", user.getEmail());
        return false;
    }

    @Override
    public List<String> regenerateBackupCodes(User user, int count) {
        // Xóa tất cả codes cũ và tạo mới
        return generateBackupCodes(user, count);
    }

    @Override
    public long getRemainingBackupCodesCount(User user) {
        return backupCodeRepository.countByUserAndUsedFalse(user);
    }

    @Override
    public long getAvailableBackupCodesCount(User user) {
        return getRemainingBackupCodesCount(user);
    }

    @Override
    public void deleteAllBackupCodes(User user) {
        backupCodeRepository.deleteAllByUser(user);
        log.info("✅ Đã xóa tất cả backup codes cho user: {}", user.getEmail());
    }

    /**
     * Tạo backup code ngẫu nhiên dạng: XXXX-XXXX
     */
    private String generateRandomCode() {
        StringBuilder code = new StringBuilder();
        
        // Phần đầu: 4 ký tự
        for (int i = 0; i < 4; i++) {
            code.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        
        code.append("-");
        
        // Phần sau: 4 ký tự
        for (int i = 0; i < 4; i++) {
            code.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        
        return code.toString();
    }
}

