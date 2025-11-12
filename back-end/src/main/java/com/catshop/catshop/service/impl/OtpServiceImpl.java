package com.catshop.catshop.service.impl;

import com.catshop.catshop.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;

    private static final String OTP_KEY_PREFIX = "OTP:";
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final SecureRandom RANDOM = new SecureRandom();
    private final Map<String, FallbackOtp> inMemoryStore = new ConcurrentHashMap<>();

    @Override
    public String generateAndSendOtp(String email) {
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));

        boolean persisted = saveOtp(email, otp);
        if (!persisted) {
            log.warn("OTP đang sử dụng bộ nhớ tạm vì không kết nối được Redis.");
        }

        // Gửi email (nếu chưa cấu hình SMTP, sẽ throw – người dùng cần cấu hình)
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Cham Pets - Mã OTP đăng nhập");
            message.setText("Mã OTP của bạn là: " + otp + "\nCó hiệu lực trong 5 phút.");
            mailSender.send(message);
        } catch (Exception e) {
            // Nếu chưa cấu hình SMTP, vẫn cho phép dev test bằng log
            log.warn("[DEV ONLY] OTP của {} = {}", email, otp);
        }

        // sessionId có thể không cần; frontend hỗ trợ optional
        return "session-" + Math.abs(RANDOM.nextInt());
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        String stored = loadOtp(email);
        if (stored == null) {
            return false;
        }
        boolean match = stored.equals(otp);
        if (match) {
            deleteOtp(email);
        }
        return match;
    }

    private boolean saveOtp(String email, String otp) {
        try {
            redisTemplate.opsForValue().set(OTP_KEY_PREFIX + email, otp, OTP_TTL);
            return true;
        } catch (DataAccessException ex) {
            log.error("Không kết nối được Redis, fallback sang in-memory store: {}", ex.getMessage());
            inMemoryStore.put(email, new FallbackOtp(otp, System.currentTimeMillis()));
            return false;
        }
    }

    private String loadOtp(String email) {
        try {
            return redisTemplate.opsForValue().get(OTP_KEY_PREFIX + email);
        } catch (DataAccessException ex) {
            FallbackOtp entry = inMemoryStore.get(email);
            if (entry == null) return null;
            if (System.currentTimeMillis() - entry.createdAt > OTP_TTL.toMillis()) {
                inMemoryStore.remove(email);
                return null;
            }
            return entry.value;
        }
    }

    private void deleteOtp(String email) {
        try {
            redisTemplate.delete(OTP_KEY_PREFIX + email);
        } catch (DataAccessException ex) {
            inMemoryStore.remove(email);
        }
    }

    private record FallbackOtp(String value, long createdAt) {
    }
}


