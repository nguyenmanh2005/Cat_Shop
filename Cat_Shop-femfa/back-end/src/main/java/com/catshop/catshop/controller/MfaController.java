package com.catshop.catshop.controller;

import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.BackupCodeService;
import com.catshop.catshop.service.MfaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/mfa")
@RequiredArgsConstructor
public class MfaController {

    private final UserRepository userRepository;
    private final MfaService mfaService;
    private final BackupCodeService backupCodeService;

    @GetMapping(value = "/qr", produces = "image/png")
    public @ResponseBody byte[] getQrCode(@RequestParam String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));

        // Nếu chưa có secret, tạo mới
        if (user.getMfaSecret() == null) {
            user.setMfaSecret(mfaService.generateSecret());
            userRepository.save(user);
        }

        return mfaService.generateQrBytes(user.getEmail(), user.getMfaSecret());
    }

    /**
     * Kiểm tra trạng thái MFA của user
     * Trả về true nếu user đã kích hoạt MFA, false nếu chưa
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMfaStatus(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));

        boolean isMfaEnabled = Boolean.TRUE.equals(user.getMfaEnabled()) && user.getMfaSecret() != null;
        long remainingBackupCodes = backupCodeService.getRemainingBackupCodesCount(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("mfaEnabled", isMfaEnabled);
        response.put("remainingBackupCodes", remainingBackupCodes);
        
        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Trạng thái MFA đã được kiểm tra"));
    }

    /**
     * Tạo backup codes cho user (thường được gọi khi bật MFA)
     */
    @PostMapping("/backup-codes/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateBackupCodes(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));

        // Tạo 10 backup codes
        List<String> backupCodes = backupCodeService.generateBackupCodes(user, 10);

        Map<String, Object> response = new HashMap<>();
        response.put("backupCodes", backupCodes);
        response.put("count", backupCodes.size());
        response.put("message", "Lưu các mã này ở nơi an toàn. Mỗi mã chỉ dùng được 1 lần.");

        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Backup codes đã được tạo thành công"));
    }

    /**
     * Tạo lại backup codes (xóa codes cũ và tạo mới)
     */
    @PostMapping("/backup-codes/regenerate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> regenerateBackupCodes(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));

        if (!Boolean.TRUE.equals(user.getMfaEnabled())) {
            throw new ResourceNotFoundException("User chưa kích hoạt MFA");
        }

        // Tạo lại 10 backup codes
        List<String> backupCodes = backupCodeService.regenerateBackupCodes(user, 10);

        Map<String, Object> response = new HashMap<>();
        response.put("backupCodes", backupCodes);
        response.put("count", backupCodes.size());
        response.put("message", "Các mã cũ đã bị vô hiệu hóa. Lưu các mã mới này ở nơi an toàn.");

        return ResponseEntity.ok(ApiResponse.success(
                response,
                "Backup codes đã được tạo lại thành công"));
    }

    /**
     * Lấy số lượng backup codes còn lại
     */
    @GetMapping("/backup-codes/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getBackupCodesCount(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));

        long count = backupCodeService.getRemainingBackupCodesCount(user);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("remainingCount", count),
                "Số lượng backup codes còn lại"));
    }
}
