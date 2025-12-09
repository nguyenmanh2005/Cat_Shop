package com.catshop.catshop.service.impl;

import com.catshop.catshop.service.OtpService;
import com.catshop.catshop.service.GmailEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
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
    private final GmailEmailService gmailEmailService;

    private static final String OTP_KEY_PREFIX = "OTP:";
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final SecureRandom RANDOM = new SecureRandom();
    private final Map<String, FallbackOtp> inMemoryStore = new ConcurrentHashMap<>();

    @Override
    public String generateAndSendOtp(String email) {
        return generateAndSendOtp(email, false);
    }
    
    @Override
    public String generateAndSendOtpForRegister(String email) {
        return generateAndSendOtp(email, true);
    }
    
    private String generateAndSendOtp(String email, boolean isRegister) {
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));

        boolean persisted = saveOtp(email, otp);
        if (!persisted) {
            log.warn("OTP đang sử dụng bộ nhớ tạm vì không kết nối được Redis.");
        }

        // Gửi email - Ưu tiên Resend API, fallback về SMTP
        String emailType = isRegister ? "đăng ký" : "đăng nhập";
        log.info("📧 Attempting to send OTP email ({}) to: {}", emailType, email);
        log.info("🔑 Generated OTP for {}: {}", email, otp); // Log OTP ngay để debug
        
        // Dùng Gmail API - KHÔNG fallback SMTP/Resend
        try {
            gmailEmailService.sendOtpEmail(email, otp, isRegister);
            log.info("✅ OTP email sent successfully via Gmail API to: {}", email);
            log.info("═══════════════════════════════════════════════════════════");
            log.info("✅ [SUCCESS] Email đã được gửi thành công qua Gmail!");
            log.info("✅ [SUCCESS] OTP cho {} = {}", email, otp);
            log.info("═══════════════════════════════════════════════════════════");
            return "session-" + Math.abs(RANDOM.nextInt());
        } catch (Exception resendError) {
            log.error("═══════════════════════════════════════════════════════════");
            log.error("❌ [CRITICAL] Gmail API failed!");
            log.error("❌ [CRITICAL] Loại: {}", isRegister ? "Đăng ký" : "Đăng nhập");
            log.error("❌ [CRITICAL] Error: {}", resendError.getMessage());
            log.error("❌ [CRITICAL] Vui lòng kiểm tra cấu hình Gmail API (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, FROM_EMAIL)");
            log.error("═══════════════════════════════════════════════════════════");
            log.warn("⚠️ [DEV MODE] OTP cho {} = {} (Email không được gửi - kiểm tra Gmail API)", email, otp);
            // Throw exception để frontend biết lỗi - KHÔNG fallback
            throw new RuntimeException("Không thể gửi email OTP qua Gmail API. Vui lòng kiểm tra cấu hình. Error: " + resendError.getMessage());
        }
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


