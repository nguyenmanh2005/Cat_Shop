package com.catshop.catshop.controller;

import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.MfaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/mfa")
@RequiredArgsConstructor
public class MfaController {

    private final UserRepository userRepository;
    private final MfaService mfaService;

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
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getMfaStatus(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));

        boolean isMfaEnabled = Boolean.TRUE.equals(user.getMfaEnabled()) && user.getMfaSecret() != null;
        
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("mfaEnabled", isMfaEnabled),
                "Trạng thái MFA đã được kiểm tra"));
    }
}
