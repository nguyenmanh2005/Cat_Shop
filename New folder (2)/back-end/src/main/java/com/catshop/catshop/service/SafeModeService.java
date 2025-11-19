package com.catshop.catshop.service;

import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SafeModeService {

    private static final Duration SAFE_MODE_DURATION = Duration.ofHours(24);
    private final UserRepository userRepository;

    @Transactional
    public void enableSafeMode(String email) {
        User user = getUserOrThrow(email);
        LocalDateTime expiresAt = LocalDateTime.now().plus(SAFE_MODE_DURATION);
        user.setSafeModeUntil(expiresAt);
        userRepository.save(user);
        log.info("✅ Safe Mode enabled for {} until {}", user.getEmail(), expiresAt);
    }

    @Transactional
    public void disableSafeMode(String email) {
        User user = getUserOrThrow(email);
        user.setSafeModeUntil(null);
        userRepository.save(user);
        log.info("✅ Safe Mode disabled for {}", user.getEmail());
    }

    @Transactional
    public boolean isSafeModeEnabled(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) {
            return false;
        }

        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOptional.isEmpty()) {
            return false;
        }

        User user = userOptional.get();
        LocalDateTime expiresAt = user.getSafeModeUntil();
        if (expiresAt == null) {
            return false;
        }

        if (expiresAt.isBefore(LocalDateTime.now())) {
            user.setSafeModeUntil(null);
            userRepository.save(user);
            return false;
        }

        return true;
    }

    private User getUserOrThrow(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isEmpty()) {
            throw new BadRequestException("Email không hợp lệ.");
        }

        return userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tài khoản với email " + normalizedEmail));
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}

