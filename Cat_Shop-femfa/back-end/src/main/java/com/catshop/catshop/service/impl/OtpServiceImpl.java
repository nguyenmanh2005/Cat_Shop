package com.catshop.catshop.service.impl;

import com.catshop.catshop.service.OtpService;
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
    private final com.catshop.catshop.service.ResendEmailService resendEmailService;

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
        
        // Chỉ dùng Resend API - KHÔNG fallback về SMTP vì Railway chặn SMTP
        try {
            resendEmailService.sendOtpEmail(email, otp, isRegister);
            log.info("✅ OTP email sent successfully via Resend API to: {}", email);
            log.info("═══════════════════════════════════════════════════════════");
            log.info("✅ [SUCCESS] Email đã được gửi thành công qua Resend!");
            log.info("✅ [SUCCESS] OTP cho {} = {}", email, otp);
            log.info("═══════════════════════════════════════════════════════════");
            return "session-" + Math.abs(RANDOM.nextInt());
        } catch (Exception resendError) {
            // Resend API failed - KHÔNG fallback về SMTP (Railway chặn SMTP)
            String keyType = isRegister ? "RESEND_API_KEY_REGISTER" : "RESEND_API_KEY";
            log.error("═══════════════════════════════════════════════════════════");
            log.error("❌ [CRITICAL] Resend API failed!");
            log.error("❌ [CRITICAL] Loại: {}", isRegister ? "Đăng ký" : "Đăng nhập");
            log.error("❌ [CRITICAL] Error: {}", resendError.getMessage());
            log.error("❌ [CRITICAL] SMTP không hoạt động trên Railway (bị chặn port 465/587)");
            log.error("❌ [CRITICAL] Vui lòng cấu hình Resend API key:");
            log.error("❌ [CRITICAL] 1. Đăng ký tại: https://resend.com/signup");
            log.error("❌ [CRITICAL] 2. Lấy API key tại: https://resend.com/api-keys");
            log.error("❌ [CRITICAL] 3. Vào Railway Dashboard → Service → Variables");
            log.error("❌ [CRITICAL] 4. Thêm biến: {} = re_xxxxxxxxxxxxx", keyType);
            log.error("❌ [CRITICAL] 5. (Optional) Thêm: RESEND_FROM_EMAIL = your-email@yourdomain.com");
            log.error("❌ [CRITICAL] 6. Redeploy service để áp dụng thay đổi");
            log.error("═══════════════════════════════════════════════════════════");
            log.warn("⚠️ [DEV MODE] OTP cho {} = {} (Email không được gửi - cần cấu hình Resend API)", email, otp);
            // Throw exception để frontend biết lỗi - KHÔNG fallback về SMTP
            throw new RuntimeException("Không thể gửi email OTP. Resend API key chưa được cấu hình hoặc có lỗi. Vui lòng thêm " + keyType + " vào Railway Environment Variables. Error: " + resendError.getMessage());
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


