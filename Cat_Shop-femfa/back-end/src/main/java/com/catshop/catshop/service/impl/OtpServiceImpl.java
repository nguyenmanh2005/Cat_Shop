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
    private final com.catshop.catshop.service.ResendEmailService resendEmailService;

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

        // Gửi email - Ưu tiên Resend API, fallback về SMTP
        log.info("📧 Attempting to send OTP email to: {}", email);
        log.info("🔑 Generated OTP for {}: {}", email, otp); // Log OTP ngay để debug
        
        // Thử gửi qua Resend API trước (không cần SMTP, hoạt động trên Railway)
        try {
            resendEmailService.sendOtpEmail(email, otp);
            log.info("✅ OTP email sent successfully via Resend API to: {}", email);
            log.info("═══════════════════════════════════════════════════════════");
            log.info("✅ [SUCCESS] Email đã được gửi thành công qua Resend!");
            log.info("✅ [SUCCESS] OTP cho {} = {}", email, otp);
            log.info("═══════════════════════════════════════════════════════════");
            return "session-" + Math.abs(RANDOM.nextInt());
        } catch (Exception resendError) {
            String msg = resendError.getMessage();
            log.warn("⚠️ Resend API failed: {}", msg);

            // Trường hợp chưa cấu hình API key
            if (msg != null && msg.contains("API key chưa được cấu hình")) {
                log.error("❌ Resend API key chưa được cấu hình trong Railway!");
                log.error("❌ Vui lòng thêm RESEND_API_KEY vào Railway Environment Variables");
                log.error("❌ Xem hướng dẫn: https://resend.com/api-keys");
            }

            // Các trường hợp lỗi khác: chỉ log OTP để dev/test dùng, KHÔNG fallback SMTP nữa
            log.warn("⚠️ Không fallback SMTP để tránh lỗi mạng trên Railway / môi trường deploy.");
            log.warn("⚠️ OTP cho {} = {}", email, otp);
            log.warn("═══════════════════════════════════════════════════════════");
        }

        // Không gửi SMTP nữa, chỉ dùng OTP trong log nếu Resend thất bại

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


