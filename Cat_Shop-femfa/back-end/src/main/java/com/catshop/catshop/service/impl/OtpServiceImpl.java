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
        
        // Thử gửi qua Resend API trước (không cần SMTP, hoạt động trên Railway)
        try {
            resendEmailService.sendOtpEmail(email, otp, isRegister);
            log.info("✅ OTP email sent successfully via Resend API to: {}", email);
            log.info("═══════════════════════════════════════════════════════════");
            log.info("✅ [SUCCESS] Email đã được gửi thành công qua Resend!");
            log.info("✅ [SUCCESS] OTP cho {} = {}", email, otp);
            log.info("═══════════════════════════════════════════════════════════");
            return "session-" + Math.abs(RANDOM.nextInt());
        } catch (Exception resendError) {
            log.warn("⚠️ Resend API failed: {}", resendError.getMessage());
            if (resendError.getMessage() != null && resendError.getMessage().contains("API key chưa được cấu hình")) {
                log.error("═══════════════════════════════════════════════════════════");
                log.error("❌ [CRITICAL] Resend API key chưa được cấu hình trong Railway!");
                log.error("❌ [CRITICAL] SMTP không hoạt động trên Railway (bị chặn port 465/587)");
                log.error("❌ [CRITICAL] Vui lòng cấu hình Resend API key:");
                log.error("❌ [CRITICAL] 1. Đăng ký tại: https://resend.com/signup");
                log.error("❌ [CRITICAL] 2. Lấy API key tại: https://resend.com/api-keys");
                log.error("❌ [CRITICAL] 3. Thêm vào Railway: RESEND_API_KEY=your-api-key");
                log.error("❌ [CRITICAL] 4. (Optional) Thêm RESEND_FROM_EMAIL=your-email@yourdomain.com");
                log.error("═══════════════════════════════════════════════════════════");
                log.warn("⚠️ [DEV MODE] OTP cho {} = {} (Email không được gửi - cần cấu hình Resend API)", email, otp);
                // Không fallback về SMTP nếu Resend API key chưa được cấu hình (Railway chặn SMTP)
                return "session-" + Math.abs(RANDOM.nextInt());
            }
            log.warn("⚠️ Resend API failed, falling back to SMTP (có thể không hoạt động trên Railway)...");
        }
        
        // Fallback: Thử gửi qua SMTP (có thể không hoạt động trên Railway)
        if (mailSender == null) {
            log.error("❌ MailSender is NULL! Cannot send email.");
            log.warn("═══════════════════════════════════════════════════════════");
            log.warn("⚠️ [DEV MODE] Email không được gửi - MailSender chưa được khởi tạo!");
            log.warn("⚠️ [DEV MODE] OTP cho {} = {}", email, otp);
            log.warn("⚠️ [DEV MODE] Vui lòng cấu hình Resend API key hoặc SMTP");
            log.warn("═══════════════════════════════════════════════════════════");
            return "session-" + Math.abs(RANDOM.nextInt());
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("cumanhpt@gmail.com"); // Thêm from address
            message.setTo(email);
            message.setSubject("Cham Pets - Mã OTP đăng nhập");
            message.setText("Mã OTP của bạn là: " + otp + "\nCó hiệu lực trong 5 phút.");
            
            log.info("📧 Sending email with subject: {}", message.getSubject());
            log.info("📧 From: {}, To: {}", message.getFrom(), message.getTo());
            log.debug("📧 MailSender class: {}", mailSender.getClass().getName());
            
            // Thử gửi email
            log.debug("📧 Calling mailSender.send()...");
            mailSender.send(message);
            log.debug("📧 mailSender.send() completed without exception");
            log.info("✅ OTP email sent successfully to: {}", email);
            log.info("═══════════════════════════════════════════════════════════");
            log.info("✅ [SUCCESS] Email đã được gửi thành công!");
            log.info("✅ [SUCCESS] OTP cho {} = {}", email, otp);
            log.info("═══════════════════════════════════════════════════════════");
        } catch (org.springframework.mail.MailAuthenticationException e) {
            // Log ERROR (có thể không hiển thị trong production)
            log.error("❌ Mail authentication failed. Please check your email credentials (App Password) in application.properties.");
            log.error("❌ Error details: {}", e.getMessage());
            log.error("❌ Root cause: {}", e.getCause() != null ? e.getCause().getMessage() : "N/A");
            log.error("❌ Full exception: ", e);
            
            // Log WARN với thông tin chi tiết để đảm bảo hiển thị trong production
            log.warn("═══════════════════════════════════════════════════════════");
            log.warn("⚠️ [DEV MODE] Email không được gửi do lỗi xác thực!");
            log.warn("⚠️ [DEV MODE] Error message: {}", e.getMessage());
            if (e.getCause() != null) {
                log.warn("⚠️ [DEV MODE] Root cause: {} - {}", 
                    e.getCause().getClass().getSimpleName(), 
                    e.getCause().getMessage());
            }
            log.warn("⚠️ [DEV MODE] OTP cho {} = {}", email, otp);
            log.warn("⚠️ [DEV MODE] Vui lòng kiểm tra App Password trong application.properties");
            log.warn("⚠️ [DEV MODE] Tạo App Password mới tại: https://myaccount.google.com/apppasswords");
            log.warn("⚠️ [DEV MODE] Hướng dẫn: https://support.google.com/accounts/answer/185833");
            log.warn("═══════════════════════════════════════════════════════════");
            // Không throw exception - cho phép dev test với OTP từ logs
        } catch (org.springframework.mail.MailSendException e) {
            // Log ERROR (có thể không hiển thị trong production)
            log.error("❌ Failed to send email to {}. Please check SMTP configuration.", email);
            log.error("❌ Error details: {}", e.getMessage());
            if (e.getFailedMessages() != null && !e.getFailedMessages().isEmpty()) {
                e.getFailedMessages().forEach((address, exception) -> {
                    log.error("❌ Failed address: {}, Exception: {}", address, exception.getMessage());
                    if (exception.getCause() != null) {
                        log.error("❌   └─ Cause: {}", exception.getCause().getMessage());
                        log.error("❌   └─ Cause type: {}", exception.getCause().getClass().getName());
                    }
                });
            }
            Throwable rootCause = e.getCause();
            int depth = 0;
            while (rootCause != null && depth < 5) {
                log.error("❌ Root cause (depth {}): {} - {}", depth, rootCause.getClass().getName(), rootCause.getMessage());
                rootCause = rootCause.getCause();
                depth++;
            }
            log.error("❌ Full exception stack trace: ", e);
            
            // Log WARN với thông tin chi tiết để đảm bảo hiển thị trong production
            log.warn("═══════════════════════════════════════════════════════════");
            log.warn("⚠️ [DEV MODE] Email không được gửi do lỗi SMTP!");
            log.warn("⚠️ [DEV MODE] Exception type: {}", e.getClass().getName());
            log.warn("⚠️ [DEV MODE] Error message: {}", e.getMessage());
            if (e.getCause() != null) {
                log.warn("⚠️ [DEV MODE] Root cause: {} - {}", 
                    e.getCause().getClass().getSimpleName(), 
                    e.getCause().getMessage());
            }
            log.warn("⚠️ [DEV MODE] OTP cho {} = {}", email, otp);
            log.warn("⚠️ [DEV MODE] Vui lòng kiểm tra:");
            log.warn("⚠️ [DEV MODE] 1. App Password có đúng không? (https://myaccount.google.com/apppasswords)");
            log.warn("⚠️ [DEV MODE] 2. SMTP host (smtp.gmail.com) và port (587) có đúng không?");
            log.warn("⚠️ [DEV MODE] 3. Firewall/Network có chặn port 587 không?");
            log.warn("⚠️ [DEV MODE] 4. Thử test endpoint: POST /api/auth/test-smtp");
            log.warn("═══════════════════════════════════════════════════════════");
            // Không throw exception - cho phép dev test với OTP từ logs
        } catch (Exception e) {
            // Log ERROR (có thể không hiển thị trong production)
            log.error("❌ Unexpected error sending email to {}.", email);
            log.error("❌ Error type: {}", e.getClass().getName());
            log.error("❌ Error details: {}", e.getMessage());
            Throwable rootCause = e.getCause();
            int depth = 0;
            while (rootCause != null && depth < 5) {
                log.error("❌ Root cause (depth {}): {} - {}", depth, rootCause.getClass().getName(), rootCause.getMessage());
                rootCause = rootCause.getCause();
                depth++;
            }
            log.error("❌ Full exception stack trace: ", e);
            
            // Log WARN với thông tin chi tiết để đảm bảo hiển thị trong production
            log.warn("═══════════════════════════════════════════════════════════");
            log.warn("⚠️ [DEV MODE] Email không được gửi do lỗi không xác định!");
            log.warn("⚠️ [DEV MODE] Exception type: {}", e.getClass().getName());
            log.warn("⚠️ [DEV MODE] Error message: {}", e.getMessage());
            if (e.getCause() != null) {
                log.warn("⚠️ [DEV MODE] Root cause: {} - {}", 
                    e.getCause().getClass().getSimpleName(), 
                    e.getCause().getMessage());
            }
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


