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

        // Gửi email (nếu chưa cấu hình SMTP, sẽ log warning nhưng vẫn trả về OTP để dev test)
        log.info("📧 Attempting to send OTP email to: {}", email);
        log.info("🔑 Generated OTP for {}: {}", email, otp); // Log OTP ngay để debug
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("cumanhpt@gmail.com"); // Thêm from address
            message.setTo(email);
            message.setSubject("Cham Pets - Mã OTP đăng nhập");
            message.setText("Mã OTP của bạn là: " + otp + "\nCó hiệu lực trong 5 phút.");
            
            log.info("📧 Sending email with subject: {}", message.getSubject());
            log.info("📧 From: {}, To: {}", message.getFrom(), message.getTo());
            
            mailSender.send(message);
            log.info("✅ OTP email sent successfully to: {}", email);
            log.info("═══════════════════════════════════════════════════════════");
            log.info("✅ [SUCCESS] Email đã được gửi thành công!");
            log.info("✅ [SUCCESS] OTP cho {} = {}", email, otp);
            log.info("═══════════════════════════════════════════════════════════");
        } catch (org.springframework.mail.MailAuthenticationException e) {
            log.error("❌ Mail authentication failed. Please check your email credentials (App Password) in application.properties.");
            log.error("❌ Error details: {}", e.getMessage());
            log.error("❌ Full exception: ", e);
            // Log OTP để dev có thể test ngay cả khi email không gửi được
            log.warn("═══════════════════════════════════════════════════════════");
            log.warn("⚠️ [DEV MODE] Email không được gửi do lỗi xác thực!");
            log.warn("⚠️ [DEV MODE] OTP cho {} = {}", email, otp);
            log.warn("⚠️ [DEV MODE] Vui lòng kiểm tra App Password trong application.properties");
            log.warn("═══════════════════════════════════════════════════════════");
            // Không throw exception - cho phép dev test với OTP từ logs
        } catch (org.springframework.mail.MailSendException e) {
            log.error("❌ Failed to send email to {}. Please check SMTP configuration.", email);
            log.error("❌ Error details: {}", e.getMessage());
            log.error("❌ Full exception: ", e);
            // Log OTP để dev có thể test ngay cả khi email không gửi được
            log.warn("═══════════════════════════════════════════════════════════");
            log.warn("⚠️ [DEV MODE] Email không được gửi do lỗi SMTP!");
            log.warn("⚠️ [DEV MODE] OTP cho {} = {}", email, otp);
            log.warn("⚠️ [DEV MODE] Vui lòng kiểm tra cấu hình SMTP");
            log.warn("═══════════════════════════════════════════════════════════");
            // Không throw exception - cho phép dev test với OTP từ logs
        } catch (Exception e) {
            log.error("❌ Unexpected error sending email to {}.", email);
            log.error("❌ Error details: {}", e.getMessage(), e);
            // Log OTP để dev có thể test ngay cả khi email không gửi được
            log.warn("═══════════════════════════════════════════════════════════");
            log.warn("⚠️ [DEV MODE] Email không được gửi do lỗi không xác định!");
            log.warn("⚠️ [DEV MODE] OTP cho {} = {}", email, otp);
            log.warn("═══════════════════════════════════════════════════════════");
            // Không throw exception - cho phép dev test với OTP từ logs
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


